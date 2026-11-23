import { supabase } from '../lib/supabase';
import {
  apiError,
  check,
  currentUser,
  fetchRows,
  num,
  round,
  sum,
  makeDocNumber,
  PAYMENT_METHODS,
} from './supabaseData';
import * as A from './supabaseAnalytics';
import { matchesSearchTerm } from '../utils/vietnameseUtils';

interface SupabaseRequestArgs {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  params?: Record<string, any>;
  isPublic?: boolean;
}

const nowIso = () => new Date().toISOString();
const ok = (data: any, message = 'Thành công') => ({ success: true, message, data });
const fail = (message: string, status = 400): never => apiError(message, status);

/** Map row profile -> shape mà authSlice kỳ vọng. */
const toUser = (row: any) => ({
  _id: row.id,
  id: row.id,
  username: row.username || row.email,
  fullname: row.fullname || row.username || '',
  email: row.email || '',
  phoneNumber: row.phoneNumber || '',
  bankNumber: row.bankNumber || '',
  bankName: row.bankName || '',
  role: row.role || 'staff',
});

async function profileOf(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) fail(error.message);
  if (!data) {
    const { data: authUser } = await supabase.auth.getUser();
    return toUser({ id: userId, username: authUser.user?.email?.split('@')[0], fullname: authUser.user?.user_metadata?.fullname, email: authUser.user?.email });
  }
  return toUser(data);
}

// ---------------------------------------------------------------- helpers: invoice
const computeTotals = (items: any[], taxRate = 0, discountRate = 0) => {
  const subtotal = sum(items.map((i) => num(i.totalPrice)));
  const taxAmount = round((subtotal * num(taxRate)) / 100);
  const discountAmount = round((subtotal * num(discountRate)) / 100);
  const totalAmount = round(subtotal + taxAmount - discountAmount);
  return { subtotal, taxAmount, discountAmount, totalAmount };
};

async function buildInvoiceItems(rawItems: any[]) {
  return Promise.all((rawItems || []).map(async (item: any) => {
    const materialId = item.materialId;
    const { data: material, error } = await supabase.from('materials').select('*').eq('_id', materialId).maybeSingle();
    if (error) fail(error.message);
    const unitPrice = num(item.unitPrice ?? material?.price ?? 0);
    const quantity = num(item.quantity);
    const deliveredQuantity = num(item.deliveredQuantity);
    return applyItemPricing({
      materialId,
      materialName: item.materialName || material?.name || 'Vật tư',
      quantity,
      unitPrice,
      totalPrice: round(unitPrice * quantity),
      unit: item.unit || material?.unit || '',
      stockDeductedAtCreation: false,
      priceLocked: false,
      deliveredQuantity,
      ...(item.deliveredAmount !== undefined ? { deliveredAmount: num(item.deliveredAmount) } : {}),
      ...(item.originalUnitPrice !== undefined ? { originalUnitPrice: num(item.originalUnitPrice) } : {}),
      ...(item.originalTotalPrice !== undefined ? { originalTotalPrice: num(item.originalTotalPrice) } : {}),
      ...(item.deliveryStatus ? { deliveryStatus: item.deliveryStatus } : {}),
    });
  }));
}

const activeInvoices = async () => (await fetchRows<any>('invoices')).filter((i) => !i.isDeleted);

function derivePayment(paidAmount: number, totalAmount: number) {
  const paid = Math.max(0, round(paidAmount));
  const remaining = Math.max(0, round(totalAmount - paid));
  const status = remaining === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  return { paidAmount: paid, remainingAmount: remaining, paymentStatus: status };
}

/**
 * Giá trị phần đã giao.
 * - Nếu item đã có deliveredAmount thì giữ nguyên (giá tại thời điểm giao).
 * - Nếu chưa có (dữ liệu cũ), tạm tính theo giá gốc (originalUnitPrice) hoặc giá hiện tại.
 */
function itemDeliveredAmount(item: any) {
  const delivered = num(item.deliveredQuantity);
  if (item.deliveredAmount !== undefined && item.deliveredAmount !== null) {
    return round(num(item.deliveredAmount));
  }
  const price = num(item.originalUnitPrice ?? item.unitPrice);
  return round(delivered * price);
}

/**
 * Tính lại thành tiền theo mô hình:
 * - phần đã giao giữ giá trị đã chốt (deliveredAmount)
 * - phần còn lại nhân với unitPrice hiện tại
 */
function applyItemPricing(item: any) {
  const quantity = num(item.quantity);
  const delivered = num(item.deliveredQuantity);
  const remaining = Math.max(0, quantity - delivered);
  const deliveredAmount = itemDeliveredAmount(item);
  const unitPrice = num(item.unitPrice);
  const originalUnitPrice = num(item.originalUnitPrice ?? unitPrice);
  return {
    ...item,
    deliveredQuantity: delivered,
    deliveredAmount,
    originalUnitPrice,
    originalTotalPrice: item.originalTotalPrice ?? round(originalUnitPrice * quantity),
    totalPrice: round(deliveredAmount + remaining * unitPrice),
  };
}

function deliveryStatusOf(invoice: any) {
  const items = (invoice.items || []).map((item: any, index: number) => {
    const qty = num(item.quantity);
    const delivered = num(item.deliveredQuantity || (item.deliveryStatus === 'delivered' ? qty : 0));
    return {
      index,
      materialName: item.materialName,
      quantity: qty,
      deliveredQuantity: delivered,
      remainingQuantity: round(qty - delivered),
      deliveryStatus: delivered >= qty ? 'delivered' : delivered > 0 ? 'partial' : 'pending',
      deliveredAt: item.deliveredAt || '',
      unit: item.unit || '',
    };
  });
  return {
    totalItems: items.length,
    deliveredItems: items.filter((i) => i.deliveryStatus === 'delivered').length,
    partialItems: items.filter((i) => i.deliveryStatus === 'partial').length,
    pendingItems: items.filter((i) => i.deliveryStatus === 'pending').length,
    totalQuantity: sum(items.map((i) => i.quantity)),
    deliveredQuantity: sum(items.map((i) => i.deliveredQuantity)),
    remainingQuantity: sum(items.map((i) => i.remainingQuantity)),
    items,
  };
}

function deliveredAmountOf(invoice: any) {
  const items = (invoice.items || []).map((item: any) => {
    const qty = num(item.quantity);
    const delivered = num(item.deliveredQuantity || (item.deliveryStatus === 'delivered' ? qty : 0));
    const unitPrice = num(item.unitPrice);
    return {
      materialId: item.materialId,
      materialName: item.materialName,
      unit: item.unit || '',
      orderedQuantity: qty,
      deliveredQuantity: delivered,
      remainingQuantity: round(qty - delivered),
      unitPrice,
      deliveredAmount: itemDeliveredAmount(item),
      deliveryStatus: delivered >= qty ? 'delivered' : delivered > 0 ? 'partial' : 'pending',
      deliveredAt: item.deliveredAt || '',
    };
  });
  const totalOrderedAmount = sum((invoice.items || []).map((i: any) => num(i.totalPrice)));
  const deliveredAmount = sum(items.map((i) => i.deliveredAmount));
  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customerName,
    totalOrderedAmount,
    deliveredAmount,
    remainingAmount: round(totalOrderedAmount - deliveredAmount),
    totalOrderedQuantity: sum(items.map((i) => i.orderedQuantity)),
    totalDeliveredQuantity: sum(items.map((i) => i.deliveredQuantity)),
    deliveryPercentage: totalOrderedAmount ? round((deliveredAmount / totalOrderedAmount) * 100) : 0,
    deliveredAmountPercentage: totalOrderedAmount ? round((deliveredAmount / totalOrderedAmount) * 100) : 0,
    deliveredItems: items,
    summary: {
      totalItems: items.length,
      deliveredItems: items.filter((i) => i.deliveryStatus === 'delivered').length,
      pendingItems: items.filter((i) => i.deliveryStatus === 'pending').length,
      partialItems: items.filter((i) => i.deliveryStatus === 'partial').length,
      fullyDeliveredItems: items.filter((i) => i.deliveryStatus === 'delivered').length,
    },
  };
}

const genUuid = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

function deliveryHistoryOf(invoice: any, records: any[]) {
  const sorted = [...records].sort((a, b) => (a.deliveredAt < b.deliveredAt ? 1 : -1));
  const batchMap = new Map<string, any>();
  sorted.forEach((record) => {
    const key = record.batchId || record._id;
    const batch = batchMap.get(key) || {
      batchId: key,
      deliveredAt: record.deliveredAt,
      deliveredBy: record.deliveredBy,
      deliveredByName: record.deliveredByName || '',
      notes: record.notes || '',
      totalQuantity: 0,
      items: [],
    };
    batch.totalQuantity = round(batch.totalQuantity + num(record.quantity));
    batch.items.push({
      recordId: record._id,
      itemIndex: record.itemIndex,
      materialId: record.materialId,
      materialName: record.materialName,
      unit: record.unit || '',
      quantity: num(record.quantity),
      unitPrice: num(record.unitPrice),
    });
    batchMap.set(key, batch);
  });

  const items = (invoice.items || []).map((item: any, index: number) => {
    const ordered = num(item.quantity);
    const delivered = num(item.deliveredQuantity);
    return {
      itemIndex: index,
      materialId: item.materialId,
      materialName: item.materialName,
      unit: item.unit || '',
      unitPrice: num(item.unitPrice),
      orderedQuantity: ordered,
      deliveredQuantity: delivered,
      deliveredAmount: itemDeliveredAmount(item),
      remainingQuantity: round(ordered - delivered),
      deliveryStatus: delivered >= ordered ? 'delivered' : delivered > 0 ? 'partial' : 'pending',
    };
  });

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone || '',
    customerAddress: invoice.customerAddress || '',
    invoiceStatus: invoice.status,
    deliveredAt: invoice.deliveredAt || '',
    items,
    records: sorted,
    batches: Array.from(batchMap.values()).sort((a, b) => (a.deliveredAt < b.deliveredAt ? 1 : -1)),
    summary: {
      totalItems: items.length,
      totalQuantity: sum(items.map((i) => i.orderedQuantity)),
      deliveredQuantity: sum(items.map((i) => i.deliveredQuantity)),
      remainingQuantity: sum(items.map((i) => i.remainingQuantity)),
      totalBatches: batchMap.size,
      lastDeliveredAt: sorted[0]?.deliveredAt || '',
    },
  };
}

function toIsoDate(value: any, endOfDay = false) {
  if (!value) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? `${text}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`
    : text;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function groupDeliveryBatches(records: any[], invoiceMap: Map<string, any>) {
  const map = new Map<string, any>();

  records.forEach((record) => {
    const invoice = invoiceMap.get(record.invoiceId);
    if (invoice?.isDeleted) return;

    const key = `${record.invoiceId}:${record.batchId || record._id}`;
    let batch = map.get(key);
    if (!batch) {
      batch = {
        batchId: record.batchId || record._id,
        invoiceId: record.invoiceId,
        invoiceNumber: record.invoiceNumber || invoice?.invoiceNumber || '',
        customerName: invoice?.customerName || '',
        customerPhone: invoice?.customerPhone || '',
        customerAddress: invoice?.customerAddress || '',
        invoiceStatus: invoice?.status || '',
        deliveredAt: record.deliveredAt,
        deliveredBy: record.deliveredBy || '',
        deliveredByName: record.deliveredByName || '',
        notes: record.notes || '',
        totalQuantity: 0,
        deliveredValue: 0,
        itemCount: 0,
        items: [] as any[],
      };
      map.set(key, batch);
    }

    const invoiceItems = invoice?.items || [];
    const item =
      invoiceItems[record.itemIndex] ||
      invoiceItems.find((entry: any) => entry.materialId && entry.materialId === record.materialId);
    const recordUnitPrice = num(record.unitPrice);
    let unitPrice = recordUnitPrice > 0 ? recordUnitPrice : num(item?.unitPrice);

    // Dữ liệu cũ chưa lưu giá tại thời điểm giao: suy ra theo mốc điều chỉnh giá.
    if (recordUnitPrice <= 0 && item?.priceAdjustedAt && item?.originalUnitPrice !== undefined) {
      const deliveredTime = record.deliveredAt ? new Date(record.deliveredAt).getTime() : 0;
      const adjustedTime = new Date(item.priceAdjustedAt).getTime();
      if (deliveredTime && adjustedTime && deliveredTime < adjustedTime) {
        unitPrice = num(item.originalUnitPrice);
      }
    }
    const quantity = num(record.quantity);

    batch.totalQuantity = round(batch.totalQuantity + quantity);
    batch.deliveredValue = round(batch.deliveredValue + quantity * unitPrice);
    batch.itemCount += 1;
    if (!batch.notes && record.notes) batch.notes = record.notes;
    if (!batch.deliveredByName && record.deliveredByName) batch.deliveredByName = record.deliveredByName;
    batch.items.push({
      recordId: record._id,
      itemIndex: record.itemIndex,
      materialId: record.materialId,
      materialName: record.materialName,
      unit: record.unit || '',
      quantity,
      unitPrice,
    });
  });

  return Array.from(map.values()).sort((a, b) =>
    a.deliveredAt < b.deliveredAt ? 1 : a.deliveredAt > b.deliveredAt ? -1 : 0
  );
}

// ---------------------------------------------------------------- helpers: stock-in
const computeStockTotals = (items: any[], taxRate = 0, discountRate = 0) =>
  computeTotals(items.map((i) => ({ totalPrice: i.totalPrice })), taxRate, discountRate);

async function adjustMaterialStock(items: any[], delta: number) {
  for (const item of items || []) {
    if (!item.materialId) continue;
    const { data: material, error } = await supabase.from('materials').select('quantity').eq('_id', item.materialId).maybeSingle();
    if (error || !material) continue;
    await supabase.from('materials').update({ quantity: Math.max(0, num(material.quantity) + delta * num(item.quantity)), updatedAt: nowIso() }).eq('_id', item.materialId);
  }
}

// ---------------------------------------------------------------- helpers: notifications
async function notificationUser(value: any) {
  if (value && typeof value === 'object') return value;
  if (!value) return null;
  const { data } = await supabase.from('profiles').select('id, username, fullname').eq('id', value).maybeSingle();
  return data ? { _id: data.id, username: data.username, fullname: data.fullname } : { _id: value, username: '', fullname: '' };
}

const envelope = (data: any, message = 'Thành công') => ok(data, message);

// ================================================================ ROUTER
export async function supabaseRequest({ method, path, body, params, isPublic }: SupabaseRequestArgs): Promise<any> {
  const [pathname, search = ''] = path.split('?');
  const searchParams = new URLSearchParams(search);
  const query: Record<string, any> = { ...(params || {}) };
  searchParams.forEach((value, key) => { query[key] = value; });
  const parts = pathname.split('/').filter(Boolean);
  const [resource, second, third, fourth, fifth] = parts;

  // ------------------------------------------------------------ AUTH
  if (resource === 'auth') {
    if (method === 'POST' && second === 'login') {
      const username = String(body?.username || '').trim();
      const password = String(body?.password || '');
      let email = username;
      if (!username.includes('@')) {
        const { data: profile } = await supabase.from('profiles').select('email').eq('username', username).maybeSingle();
        if (!profile?.email) fail('Sai tên đăng nhập hoặc mật khẩu', 401);
        email = profile.email;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) fail(error?.message || 'Đăng nhập thất bại', 401);
      return { user: await profileOf(data.user.id), access_token: data.session.access_token };
    }

    if (second === 'profile') {
      const user = await currentUser();
      if (method === 'GET') return profileOf(user.id);
      if (method === 'PUT') {
        const patch: Record<string, any> = {};
        ['fullname', 'phoneNumber', 'bankNumber', 'bankName'].forEach((key) => {
          if (body?.[key] !== undefined) patch[key] = body[key];
        });
        const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
        if (error) fail(error.message);
        return profileOf(user.id);
      }
    }
  }

  // ------------------------------------------------------------ MATERIALS
  if (resource === 'materials') {
    if (method === 'GET' && !second) return fetchRows('materials');
    if (method === 'GET' && second === 'low-stock') {
      const threshold = num(query.threshold ?? 10);
      return (await fetchRows<any>('materials')).filter((m) => num(m.quantity) <= threshold);
    }
    if (method === 'GET' && second === 'category') return (await fetchRows<any>('materials')).filter((m) => m.category === third);

    if (method === 'GET' && second) {
      const { data, error } = await supabase.from('materials').select('*').eq('_id', second).maybeSingle();
      if (error) fail(error.message);
      if (!data) fail('Không tìm thấy vật tư', 404);
      return data;
    }
    if (method === 'POST') {
      const user = await currentUser();
      const payload = {
        name: body.name, category: body.category || 'Khác', unit: body.unit || '',
        quantity: num(body.quantity), price: num(body.price), importCost: num(body.importCost ?? body.price),
        description: body.description || '', supplier: body.supplier || '',
        minStock: num(body.minStock ?? 10), maxStock: num(body.maxStock ?? 0), location: body.location || '',
        userId: user.id, isActive: true, createdAt: nowIso(), updatedAt: nowIso(),
      };
      return check(await supabase.from('materials').insert(payload).select().single());
    }
    if (method === 'PATCH' && second) {
      const { data: old } = await supabase.from('materials').select('*').eq('_id', second).maybeSingle();
      if (!old) fail('Không tìm thấy vật tư', 404);
      const patch: Record<string, any> = { updatedAt: nowIso() };
      ['name', 'category', 'unit', 'quantity', 'price', 'importCost', 'description', 'supplier', 'minStock', 'maxStock', 'location', 'isActive'].forEach((key) => {
        if (body?.[key] !== undefined) patch[key] = body[key];
      });
      const material = check(await supabase.from('materials').update(patch).eq('_id', second).select().single());
      const priceChanged = body?.price !== undefined && num(body.price) !== num(old.price);
      if (!priceChanged || body?.updateAffectedInvoices === false) return material;

      const affected: any[] = [];
      const invoices = await activeInvoices();
      const newPrice = num(body.price);
      for (const invoice of invoices) {
        const items = invoice.items || [];
        if (!items.some((item: any) => item.materialId === second)) continue;

        let changed = false;
        const newItems = items.map((item: any) => {
          if (item.materialId !== second) return item;
          // Sản phẩm đã chốt giá thì không bị ảnh hưởng khi giá vật tư thay đổi.
          if (item.priceLocked === true) return item;

          const quantity = num(item.quantity);
          const delivered = num(item.deliveredQuantity);
          const remaining = Math.max(0, quantity - delivered);
          const normalized = applyItemPricing(item);

          // Đã giao đủ: không đổi giá, chỉ chuẩn hoá lại thành tiền.
          if (remaining <= 0) {
            if (
              round(num(normalized.totalPrice)) !== round(num(item.totalPrice)) ||
              num(normalized.deliveredAmount) !== num(item.deliveredAmount)
            ) {
              changed = true;
            }
            return normalized;
          }

          const oldUnitPrice = num(item.unitPrice);
          const deliveredAmount = itemDeliveredAmount(item);
          const originalUnitPrice = num(item.originalUnitPrice ?? oldUnitPrice);
          const oldTotal = round(deliveredAmount + remaining * oldUnitPrice);
          const newTotal = round(deliveredAmount + remaining * newPrice);
          if (newTotal !== oldTotal) changed = true;

          return {
            ...item,
            originalUnitPrice,
            originalTotalPrice: item.originalTotalPrice ?? round(originalUnitPrice * quantity),
            unitPrice: newPrice,
            totalPrice: newTotal,
            deliveredAmount,
            adjustedUnitPrice: newPrice,
            adjustedTotalPrice: newTotal,
            priceAdjustmentAmount: round(newTotal - (deliveredAmount + remaining * originalUnitPrice)),
            priceAdjustmentReason: body.priceUpdateReason || '',
            priceAdjustedAt: nowIso(),
          };
        });

        if (!changed) continue;

        const oldTotalAmount = num(invoice.totalAmount);
        const totals = computeTotals(newItems, invoice.taxRate, invoice.discountRate);
        const payment = derivePayment(num(invoice.paidAmount), totals.totalAmount);
        const delta = round(totals.totalAmount - oldTotalAmount);

        const { error: updateError } = await supabase.from('invoices').update({
          items: newItems,
          ...totals,
          ...payment,
          updatedAt: nowIso(),
        }).eq('_id', invoice._id);
        if (updateError) fail(updateError.message);

        affected.push({
          invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, customerName: invoice.customerName,
          oldTotalAmount, newTotalAmount: totals.totalAmount,
          priceDifference: delta, items: newItems,
        });
      }
      return { material, affectedInvoices: affected };
    }
    if (method === 'DELETE' && second) {
      const { data } = await supabase.from('materials').select('*').eq('_id', second).maybeSingle();
      await supabase.from('materials').delete().eq('_id', second);
      return data;
    }
  }

  // ------------------------------------------------------------ DELIVERY LOG
  if (resource === 'deliveries') {
    if (method !== 'GET') fail('Không hỗ trợ thao tác này', 405);

    const search = String(query.search || '').trim();
    const fromIso = toIsoDate(query.from, false);
    const toIso = toIsoDate(query.to, true);
    const invoiceIdFilter = query.invoiceId ? String(query.invoiceId) : '';

    let records: any[] = [];
    const pageSize = 1000;
    for (let start = 0; start <= 9000; start += pageSize) {
      let q = supabase
        .from('delivery_records')
        .select('*')
        .order('deliveredAt', { ascending: false })
        .range(start, start + pageSize - 1);
      if (fromIso) q = q.gte('deliveredAt', fromIso);
      if (toIso) q = q.lte('deliveredAt', toIso);
      if (invoiceIdFilter) q = q.eq('invoiceId', invoiceIdFilter);
      const { data, error } = await q;
      if (error) fail(error.message);
      records = records.concat(data || []);
      if (!data || data.length < pageSize) break;
    }

    const invoiceMap = new Map<string, any>();
    const invoiceIds = Array.from(new Set(records.map((record) => record.invoiceId).filter(Boolean)));
    for (let index = 0; index < invoiceIds.length; index += 100) {
      const chunk = invoiceIds.slice(index, index + 100);
      const { data, error } = await supabase.from('invoices').select('*').in('_id', chunk);
      if (error) fail(error.message);
      (data || []).forEach((invoice) => invoiceMap.set(invoice._id, invoice));
    }

    const batches = groupDeliveryBatches(records, invoiceMap);
    const filtered = search
      ? batches.filter((batch) =>
          matchesSearchTerm(
            [
              batch.invoiceNumber,
              batch.customerName,
              batch.customerPhone,
              batch.deliveredByName,
              batch.notes,
              ...batch.items.map((item: any) => item.materialName),
            ]
              .filter(Boolean)
              .join(' '),
            search
          )
        )
      : batches;

    const page = Math.max(1, num(query.page) || 1);
    const limit = Math.max(1, Math.min(100, num(query.limit) || 20));
    const startIndex = (page - 1) * limit;

    return {
      deliveries: filtered.slice(startIndex, startIndex + limit),
      total: filtered.length,
      page,
      limit,
      summary: {
        totalBatches: filtered.length,
        totalQuantity: sum(filtered.map((batch) => batch.totalQuantity)),
        totalInvoices: new Set(filtered.map((batch) => batch.invoiceId)).size,
        totalRecords: sum(filtered.map((batch) => batch.itemCount)),
        deliveredValue: sum(filtered.map((batch) => batch.deliveredValue)),
      },
    };
  }

  // ------------------------------------------------------------ INVOICES
  if (resource === 'invoices') {
    const listInvoices = async (extra?: Record<string, any>) => {
      let q = supabase.from('invoices').select('*', { count: 'exact' }).eq('isDeleted', false);
      const filterMap: Record<string, string> = { status: 'status', paymentStatus: 'paymentStatus', paymentMethod: 'paymentMethod' };
      Object.entries({ ...query, ...extra }).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (filterMap[key]) q = q.eq(filterMap[key], value);
        else if (key === 'customerName') q = q.ilike('customerName', `%${value}%`);
        else if (key === 'invoiceNumber') q = q.ilike('invoiceNumber', `%${value}%`);
        else if (key === 'startDate') q = q.gte('createdAt', value);
        else if (key === 'endDate') q = q.lte('createdAt', value);
      });
      const page = Math.max(1, num(extra?.page ?? query.page) || 1);
      const limit = Math.max(1, num(extra?.limit ?? query.limit) || 10);
      const { data, error, count } = await q.order('createdAt', { ascending: false }).range((page - 1) * limit, page * limit - 1);
      if (error) fail(error.message);
      return { invoices: data || [], total: count || 0, page, limit };
    };

    if (method === 'GET' && !second) return listInvoices();
    if (method === 'GET' && second === 'statistics') {
      const invoices = await activeInvoices();
      const methods: Record<string, { count: number; totalAmount: number }> = {};
      invoices.forEach((i) => {
        const key = i.paymentMethod || 'cash';
        methods[key] ||= { count: 0, totalAmount: 0 };
        methods[key].count += 1;
        methods[key].totalAmount = round(methods[key].totalAmount + num(i.totalAmount));
      });
      return {
        totalInvoices: invoices.length,
        totalRevenue: sum(invoices.map((i) => num(i.totalAmount))),
        pendingInvoices: invoices.filter((i) => i.status === 'pending').length,
        confirmedInvoices: invoices.filter((i) => i.status === 'confirmed').length,
        deliveredInvoices: invoices.filter((i) => i.status === 'delivered').length,
        cancelledInvoices: invoices.filter((i) => i.status === 'cancelled').length,
        unpaidInvoices: invoices.filter((i) => i.paymentStatus === 'unpaid').length,
        paidInvoices: invoices.filter((i) => i.paymentStatus === 'paid').length,
        paymentMethods: methods,
      };
    }
    if (method === 'GET' && second === 'payment-methods') return { methods: PAYMENT_METHODS };
    if (method === 'GET' && second === 'public' && third === 'search') {
      let q = supabase.from('invoices').select('*').eq('isDeleted', false);
      if (query.invoiceNumber) q = q.ilike('invoiceNumber', `%${query.invoiceNumber}%`);
      if (query.customerPhone) q = q.ilike('customerPhone', `%${query.customerPhone}%`);
      if (query.customerName) q = q.ilike('customerName', `%${query.customerName}%`);
      const { data, error } = await q.order('createdAt', { ascending: false }).limit(50);
      if (error) fail(error.message);
      return data || [];
    }
    if (method === 'GET' && ['pending', 'confirmed', 'delivered', 'unpaid', 'paid'].includes(second)) return listInvoices({ status: ['pending', 'confirmed', 'delivered'].includes(second) ? second : undefined, paymentStatus: ['unpaid', 'paid'].includes(second) ? second : undefined });
    if (method === 'GET' && second === 'payment-method') return listInvoices({ paymentMethod: third });

    if (method === 'GET' && second && third === 'delivery-history') {
      const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (invoiceError) fail(invoiceError.message);
      if (!invoice) fail('Không tìm thấy hóa đơn', 404);
      const { data: records, error } = await supabase.from('delivery_records').select('*').eq('invoiceId', second).order('deliveredAt', { ascending: false });
      if (error) fail(error.message);
      return deliveryHistoryOf(invoice, records || []);
    }

    if (method === 'GET' && second) {
      const id = second === 'number' ? null : second;
      let result: any;
      if (second === 'number') {
        const { data, error } = await supabase.from('invoices').select('*').eq('invoiceNumber', third).maybeSingle();
        if (error) fail(error.message);
        result = data;
      } else {
        const { data, error } = await supabase.from('invoices').select('*').eq('_id', id).maybeSingle();
        if (error) fail(error.message);
        result = data;
      }
      if (!result || result.isDeleted) fail('Không tìm thấy hóa đơn', 404);
      if (third === 'delivery-status') return deliveryStatusOf(result);
      if (third === 'delivered-amount') return deliveredAmountOf(result);
      if (third === 'debug' || third === 'print' || third === 'export-pdf') return result;
      return result;
    }

    if (method === 'POST' && second && third === 'payment') {
      const { data: invoice } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (!invoice) fail('Không tìm thấy hóa đơn', 404);
      const payment = derivePayment(num(invoice.paidAmount) + num(body?.amount), num(invoice.totalAmount));
      return check(await supabase.from('invoices').update({ ...payment, paymentMethod: body?.paymentMethod || invoice.paymentMethod, notes: body?.notes || invoice.notes, updatedAt: nowIso() }).eq('_id', second).select().single());
    }
    if (method === 'POST' && second && third === 'deliveries') {
      const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (invoiceError) fail(invoiceError.message);
      if (!invoice) fail('Không tìm thấy hóa đơn', 404);
      if (invoice.isDeleted) fail('Hóa đơn đã bị xóa', 400);
      if (invoice.status === 'cancelled') fail('Hóa đơn đã hủy, không thể giao hàng', 400);

      const user = await currentUser();
      const { data: profile } = await supabase.from('profiles').select('fullname').eq('id', user.id).maybeSingle();
      const deliveredAt = body?.deliveredAt || nowIso();
      const batchId = genUuid();
      const items = [...(invoice.items || [])];
      const requested = (body?.items || []).filter((entry: any) => num(entry.quantity) > 0);
      if (!requested.length) fail('Vui lòng nhập số lượng giao hàng', 400);

      const records: any[] = [];
      const stockAdjustments: any[] = [];
      for (const entry of requested) {
        const index = num(entry.itemIndex);
        const item = items[index];
        if (!item) fail(`Không tìm thấy mặt hàng #${index + 1}`, 404);

        const ordered = num(item.quantity);
        const already = num(item.deliveredQuantity);
        const quantity = num(entry.quantity);
        if (already + quantity > ordered) {
          fail(`"${item.materialName}" chỉ còn ${round(ordered - already)} ${item.unit || ''} cần giao`, 400);
        }

        const newDelivered = round(already + quantity);
        const batchPrice = num(item.unitPrice);
        const previousDeliveredAmount = itemDeliveredAmount(item);
        const newDeliveredAmount = round(previousDeliveredAmount + quantity * batchPrice);
        const remainingAfter = Math.max(0, ordered - newDelivered);

        items[index] = {
          ...item,
          deliveredQuantity: newDelivered,
          deliveredAmount: newDeliveredAmount,
          totalPrice: round(newDeliveredAmount + remainingAfter * batchPrice),
          deliveryStatus: newDelivered >= ordered ? 'delivered' : newDelivered > 0 ? 'partial' : 'pending',
          deliveredAt,
          deliveredBy: user.id,
          originalUnitPrice: item.originalUnitPrice ?? batchPrice,
          originalTotalPrice: item.originalTotalPrice ?? round(batchPrice * ordered),
        };
        records.push({
          invoiceId: second,
          invoiceNumber: invoice.invoiceNumber,
          batchId,
          itemIndex: index,
          materialId: item.materialId || null,
          materialName: item.materialName || '',
          unit: item.unit || '',
          quantity,
          deliveredAt,
          deliveredBy: user.id,
          deliveredByName: profile?.fullname || '',
          notes: body?.notes || '',
          createdAt: nowIso(),
        });

        // Hóa đơn cũ đã trừ tồn kho lúc tạo đơn (chưa có dấu false) thì không trừ lại.
        if (item.stockDeductedAtCreation === false) {
          stockAdjustments.push({ materialId: item.materialId, quantity });
        }
      }

      const allDelivered = items.every((item: any) => num(item.deliveredQuantity) >= num(item.quantity));
      const anyDelivered = items.some((item: any) => num(item.deliveredQuantity) > 0);
      const status = allDelivered ? 'delivered' : anyDelivered ? 'confirmed' : invoice.status;
      const totals = computeTotals(items, invoice.taxRate, invoice.discountRate);
      const payment = derivePayment(num(invoice.paidAmount), totals.totalAmount);

      const updated = check(
        await supabase.from('invoices').update({ items, status, ...totals, ...payment, updatedAt: nowIso() }).eq('_id', second).select().single()
      );

      const { error: recordError } = await supabase.from('delivery_records').insert(records);
      if (recordError) fail(recordError.message);

      // Trừ tồn kho theo đúng số lượng thực giao trong đợt này (chỉ với hóa đơn mới).
      await adjustMaterialStock(stockAdjustments, -1);

      return updated;
    }
    if (method === 'POST' && second && third === 'send-email') return ok(null, `Đã gửi hóa đơn tới ${body?.email || ''}`);
    if (method === 'POST') {
      const user = await currentUser();
      const items = await buildInvoiceItems(body.items);
      const taxRate = num(body.taxRate);
      const discountRate = num(body.discountRate);
      const totals = computeTotals(items, taxRate, discountRate);
      const payment = derivePayment(num(body.paidAmount), totals.totalAmount);
      const payload = {
        invoiceNumber: `HD-${Date.now().toString().slice(-8)}`,
        customerId: body.customerId || body.customerPhone || body.customerName,
        customerName: body.customerName,
        customerPhone: body.customerPhone || '',
        customerAddress: body.customerAddress || '',
        items, ...totals, taxRate, discountRate,
        status: 'pending',
        paymentMethod: body.paymentMethod || 'cash',
        ...payment,
        notes: body.notes || '',
        deliveryDate: body.deliveryDate || null,
        createdBy: user.id,
        isDeleted: false,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      const invoice = check(await supabase.from('invoices').insert(payload).select().single());
      // Không trừ tồn kho khi tạo hóa đơn. Tồn kho chỉ giảm khi thực tế giao hàng.
      return invoice;
    }

    if (method === 'PATCH' && second && third === 'status') {
      if (body?.status === 'delivered') {
        const { data: invoice, error } = await supabase.from('invoices').select('items').eq('_id', second).maybeSingle();
        if (error) fail(error.message);
        if (!invoice) fail('Không tìm thấy hóa đơn', 404);
        const allDelivered = (invoice.items || []).every(
          (item: any) => num(item.deliveredQuantity) >= num(item.quantity)
        );
        if (!allDelivered) {
          fail('Hóa đơn còn hàng chưa giao. Vui lòng ghi nhận giao đủ trước khi chuyển sang trạng thái Đã giao.', 400);
        }
      }
      return check(await supabase.from('invoices').update({ status: body?.status, notes: body?.notes, updatedAt: nowIso() }).eq('_id', second).select().single());
    }
    if (method === 'PATCH' && second && third === 'payment-status') {
      const { data: invoice } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (!invoice) fail('Không tìm thấy hóa đơn', 404);
      const paid = body?.paidAmount !== undefined ? num(body.paidAmount) : num(invoice.paidAmount);
      return check(await supabase.from('invoices').update({ ...derivePayment(paid, num(invoice.totalAmount)), notes: body?.notes || invoice.notes, updatedAt: nowIso() }).eq('_id', second).select().single());
    }
    if (method === 'PATCH' && second && third === 'items' && fifth === 'delivery') {
      const { data: invoice } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (!invoice) fail('Không tìm thấy hóa đơn', 404);
      const index = num(fourth);
      const items = [...(invoice.items || [])];
      if (!items[index]) fail('Không tìm thấy item', 404);
      const qty = num(items[index].quantity);
      const previousDelivered = num(items[index].deliveredQuantity);
      const delivered = Math.min(qty, num(body?.deliveredQuantity));
      const delta = round(delivered - previousDelivered);
      const batchPrice = num(items[index].unitPrice);
      const newDeliveredAmount = round(itemDeliveredAmount(items[index]) + delta * batchPrice);
      const remainingAfter = Math.max(0, qty - delivered);
      const deliveredAt = delivered > 0 ? nowIso() : null;
      items[index] = {
        ...items[index],
        deliveredQuantity: delivered,
        deliveredAmount: newDeliveredAmount,
        totalPrice: round(newDeliveredAmount + remainingAfter * batchPrice),
        deliveryStatus: delivered >= qty ? 'delivered' : delivered > 0 ? 'partial' : 'pending',
        deliveredAt,
        originalUnitPrice: items[index].originalUnitPrice ?? batchPrice,
        originalTotalPrice: items[index].originalTotalPrice ?? round(batchPrice * qty),
      };
      const totals = computeTotals(items, invoice.taxRate, invoice.discountRate);
      const payment = derivePayment(num(invoice.paidAmount), totals.totalAmount);
      const updated = check(await supabase.from('invoices').update({ items, ...totals, ...payment, updatedAt: nowIso() }).eq('_id', second).select().single());

      // Ghi thêm lịch sử phần giao tăng thêm (không ghi đè lịch sử cũ).
      if (delta > 0) {
        const user = await currentUser();
        const { data: profile } = await supabase.from('profiles').select('fullname').eq('id', user.id).maybeSingle();
        const { error: recordError } = await supabase.from('delivery_records').insert({
          invoiceId: second,
          invoiceNumber: invoice.invoiceNumber,
          batchId: genUuid(),
          itemIndex: index,
          materialId: items[index].materialId || null,
          materialName: items[index].materialName || '',
          unit: items[index].unit || '',
          quantity: delta,
          deliveredAt: deliveredAt || nowIso(),
          deliveredBy: user.id,
          deliveredByName: profile?.fullname || '',
          notes: body?.notes || '',
          createdAt: nowIso(),
        });
        if (recordError) fail(recordError.message);
      }

      // Điều chỉnh tồn kho theo phần chênh lệch (chỉ với hóa đơn mới).
      // Hóa đơn cũ đã trừ tồn kho lúc tạo đơn nên bỏ qua để không trừ lần hai.
      if (delta !== 0 && items[index].stockDeductedAtCreation === false) {
        await adjustMaterialStock(
          [{ materialId: items[index].materialId, quantity: Math.abs(delta) }],
          delta > 0 ? -1 : 1
        );
      }
      return updated;
    }

    if (method === 'PATCH' && second && third === 'items' && fifth === 'price-lock') {
      const { data: invoice, error } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (error) fail(error.message);
      if (!invoice) fail('Không tìm thấy hóa đơn', 404);

      const index = num(fourth);
      const items = [...(invoice.items || [])];
      const item = items[index];
      if (!item) fail('Không tìm thấy item', 404);

      const locked = body?.locked === true;
      if (locked) {
        // Chốt giá: quay về giá gốc đã thoả thuận và giữ cố định cho phần còn lại.
        const lockedUnitPrice = num(item.originalUnitPrice ?? item.unitPrice);
        const deliveredAmount = itemDeliveredAmount(item);
        const quantity = num(item.quantity);
        const delivered = num(item.deliveredQuantity);
        items[index] = {
          ...item,
          priceLocked: true,
          lockedUnitPrice,
          priceLockedAt: nowIso(),
          unitPrice: lockedUnitPrice,
          originalUnitPrice: item.originalUnitPrice ?? lockedUnitPrice,
          deliveredAmount,
          totalPrice: round(deliveredAmount + Math.max(0, quantity - delivered) * lockedUnitPrice),
        };
      } else {
        // Bỏ chốt: áp lại giá hiện tại của vật tư cho phần còn lại.
        const { data: material } = item.materialId
          ? await supabase.from('materials').select('price').eq('_id', item.materialId).maybeSingle()
          : { data: null };
        const currentUnitPrice = material?.price !== undefined ? num(material.price) : num(item.unitPrice);
        const deliveredAmount = itemDeliveredAmount(item);
        const quantity = num(item.quantity);
        const delivered = num(item.deliveredQuantity);
        items[index] = {
          ...item,
          priceLocked: false,
          priceLockedAt: nowIso(),
          unitPrice: currentUnitPrice,
          deliveredAmount,
          totalPrice: round(deliveredAmount + Math.max(0, quantity - delivered) * currentUnitPrice),
        };
      }

      const totals = computeTotals(items, invoice.taxRate, invoice.discountRate);
      const payment = derivePayment(num(invoice.paidAmount), totals.totalAmount);
      return check(
        await supabase
          .from('invoices')
          .update({ items, ...totals, ...payment, updatedAt: nowIso() })
          .eq('_id', second)
          .select()
          .single()
      );
    }

    if (method === 'PATCH' && second) {
      const { data: existingInvoice, error: existingError } = await supabase.from('invoices').select('*').eq('_id', second).maybeSingle();
      if (existingError) fail(existingError.message);
      if (!existingInvoice) fail('Không tìm thấy hóa đơn', 404);

      const oldItems = existingInvoice.items || [];
      const newItems = await buildInvoiceItems(body.items || []);

      // Giữ nguyên số lượng đã giao khi sửa hóa đơn và không cho giảm dưới mức đã giao.
      const items = newItems.map((item, index) => {
        const oldItem =
          oldItems.find((old: any) => old.materialId && old.materialId === item.materialId) ||
          (item.materialId ? undefined : oldItems[index]);
        const delivered = num(oldItem?.deliveredQuantity);
        if (delivered > item.quantity) {
          fail(
            `"${item.materialName}" đã giao ${delivered} ${item.unit || ''}, không thể giảm số lượng xuống ${item.quantity}.`,
            400
          );
        }
        // Mặt hàng cũ giữ nguyên dấu "đã trừ tồn kho lúc tạo đơn" (nếu có),
        // mặt hàng mới thêm thì đánh dấu false để không bị cộng tồn kho sai.
        const stockMarker = oldItem ? oldItem.stockDeductedAtCreation : false;
        const { stockDeductedAtCreation: _newStockMarker, ...itemWithoutMarker } = item;
        const deliveredAmount = oldItem ? itemDeliveredAmount(oldItem) : 0;
        const unitPrice = num(item.unitPrice);
        const remaining = Math.max(0, item.quantity - delivered);
        return {
          ...itemWithoutMarker,
          ...(stockMarker !== undefined ? { stockDeductedAtCreation: stockMarker } : {}),
          deliveredQuantity: delivered,
          deliveredAmount,
          unitPrice,
          totalPrice: round(deliveredAmount + remaining * unitPrice),
          originalUnitPrice: oldItem?.originalUnitPrice ?? item.originalUnitPrice ?? unitPrice,
          originalTotalPrice:
            oldItem?.originalTotalPrice ?? item.originalTotalPrice ?? round(unitPrice * item.quantity),
          ...(oldItem?.adjustedUnitPrice !== undefined ? { adjustedUnitPrice: oldItem.adjustedUnitPrice } : {}),
          ...(oldItem?.adjustedTotalPrice !== undefined ? { adjustedTotalPrice: oldItem.adjustedTotalPrice } : {}),
          ...(oldItem?.priceAdjustmentAmount !== undefined ? { priceAdjustmentAmount: oldItem.priceAdjustmentAmount } : {}),
          ...(oldItem?.priceAdjustmentReason ? { priceAdjustmentReason: oldItem.priceAdjustmentReason } : {}),
          ...(oldItem?.priceAdjustedAt ? { priceAdjustedAt: oldItem.priceAdjustedAt } : {}),
          ...(oldItem?.priceLocked !== undefined ? { priceLocked: oldItem.priceLocked } : {}),
          ...(oldItem?.lockedUnitPrice !== undefined ? { lockedUnitPrice: oldItem.lockedUnitPrice } : {}),
          ...(oldItem?.priceLockedAt ? { priceLockedAt: oldItem.priceLockedAt } : {}),
          deliveryStatus: delivered >= item.quantity ? 'delivered' : delivered > 0 ? 'partial' : 'pending',
          ...(oldItem?.deliveredAt ? { deliveredAt: oldItem.deliveredAt } : {}),
          ...(oldItem?.deliveredBy ? { deliveredBy: oldItem.deliveredBy } : {}),
        };
      });

      oldItems.forEach((oldItem: any) => {
        const delivered = num(oldItem.deliveredQuantity);
        const stillExists = items.some(
          (item: any) => item.materialId && item.materialId === oldItem.materialId
        );
        if (delivered > 0 && !stillExists) {
          fail(
            `Không thể xóa mặt hàng "${oldItem.materialName}" vì đã giao ${delivered} ${oldItem.unit || ''}.`,
            400
          );
        }
      });

      const taxRate = num(body.taxRate);
      const discountRate = num(body.discountRate);
      const totals = computeTotals(items, taxRate, discountRate);
      const payment = derivePayment(num(body.paidAmount), totals.totalAmount);
      const allDelivered =
        items.length > 0 &&
        items.every((item: any) => num(item.deliveredQuantity) >= num(item.quantity));
      const anyDelivered = items.some((item: any) => num(item.deliveredQuantity) > 0);
      let status = existingInvoice.status;
      if (status !== 'cancelled') {
        status = allDelivered
          ? 'delivered'
          : anyDelivered
          ? 'confirmed'
          : status === 'delivered'
          ? 'pending'
          : status;
      }

      const patch: Record<string, any> = {
        customerName: body.customerName, customerPhone: body.customerPhone || '', customerAddress: body.customerAddress || '',
        items, taxRate, discountRate, ...totals, ...payment, status,
        paymentMethod: body.paymentMethod || 'cash', notes: body.notes || '', deliveryDate: body.deliveryDate || null,
        updatedAt: nowIso(),
      };
      return check(await supabase.from('invoices').update(patch).eq('_id', second).select().single());
    }
    if (method === 'DELETE' && second) {
      await supabase.from('invoices').update({ isDeleted: true, updatedAt: nowIso() }).eq('_id', second);
      return { _id: second };
    }
  }

  // ------------------------------------------------------------ STOCK-IN
  if (resource === 'stock-in') {
    if (method === 'GET' && !second) {
      const page = Math.max(1, num(query.page) || 1);
      const limit = Math.max(1, num(query.limit) || 10);
      let q = supabase.from('stock_in').select('*', { count: 'exact' }).eq('isDeleted', false);
      if (query.search) q = q.or(`stockInNumber.ilike.%${query.search}%,supplier.ilike.%${query.search}%`);
      if (query.status) q = q.eq('status', query.status);
      if (query.paymentStatus) q = q.eq('paymentStatus', query.paymentStatus);
      if (query.supplier) q = q.ilike('supplier', `%${query.supplier}%`);
      if (query.startDate) q = q.gte('createdAt', query.startDate);
      if (query.endDate) q = q.lte('createdAt', query.endDate);
      const { data, error, count } = await q.order('createdAt', { ascending: false }).range((page - 1) * limit, page * limit - 1);
      if (error) fail(error.message);
      return { data: data || [], total: count || 0, page, limit };
    }
    if (method === 'GET' && second === 'stats') {
      const rows = (await fetchRows<any>('stock_in')).filter((s) => !s.isDeleted);
      return {
        totalStockIns: rows.length,
        totalAmount: sum(rows.map((r) => num(r.totalAmount))),
        paidAmount: sum(rows.map((r) => num(r.paidAmount))),
        remainingAmount: sum(rows.map((r) => num(r.remainingAmount))),
        unpaidCount: rows.filter((r) => r.paymentStatus === 'unpaid').length,
        partialCount: rows.filter((r) => r.paymentStatus === 'partial').length,
        paidCount: rows.filter((r) => r.paymentStatus === 'paid').length,
      };
    }
    if (method === 'GET' && second === 'materials') return fetchRows('materials');
    if (method === 'GET' && second) {
      const { data, error } = await supabase.from('stock_in').select('*').eq('_id', second).maybeSingle();
      if (error) fail(error.message);
      if (!data) fail('Không tìm thấy phiếu nhập', 404);
      return data;
    }
    if (method === 'POST') {
      const user = await currentUser();
      const items = body.items || [];
      const totals = computeStockTotals(items, body.taxRate, body.discountRate);
      const payment = derivePayment(num(body.paidAmount), totals.totalAmount);
      const payload = {
        stockInNumber: `PN-${Date.now().toString().slice(-8)}`,
        userId: user.id,
        items, ...totals, taxRate: num(body.taxRate), discountRate: num(body.discountRate),
        ...payment,
        status: 'pending',
        supplier: body.supplier || '', supplierPhone: body.supplierPhone || '', supplierAddress: body.supplierAddress || '',
        notes: body.notes || '', receivedDate: body.receivedDate || nowIso(),
        createdBy: user.id, isDeleted: false, createdAt: nowIso(), updatedAt: nowIso(),
      };
      const stockIn = check(await supabase.from('stock_in').insert(payload).select().single());
      await adjustMaterialStock(items, 1);
      return stockIn;
    }
    if ((method === 'PUT' || method === 'PATCH') && second && third === 'status') {
      const patch: Record<string, any> = { status: body?.status, approvedAt: body?.status === 'approved' ? nowIso() : null, updatedAt: nowIso() };
      return check(await supabase.from('stock_in').update(patch).eq('_id', second).select().single());
    }
    if ((method === 'PUT' || method === 'PATCH') && second && third === 'payment-status') {
      const { data: stockIn } = await supabase.from('stock_in').select('*').eq('_id', second).maybeSingle();
      if (!stockIn) fail('Không tìm thấy phiếu nhập', 404);
      const payment = derivePayment(num(body?.paidAmount), num(stockIn.totalAmount));
      return check(await supabase.from('stock_in').update({ ...payment, paymentNotes: body?.paymentNotes || '', updatedAt: nowIso() }).eq('_id', second).select().single());
    }
    if ((method === 'PUT' || method === 'PATCH') && second) {
      const patch: Record<string, any> = { updatedAt: nowIso() };
      ['items', 'subtotal', 'taxRate', 'taxAmount', 'discountRate', 'discountAmount', 'totalAmount', 'paymentStatus', 'paidAmount', 'remainingAmount', 'supplier', 'supplierPhone', 'supplierAddress', 'notes', 'receivedDate'].forEach((key) => {
        if (body?.[key] !== undefined) patch[key] = body[key];
      });
      return check(await supabase.from('stock_in').update(patch).eq('_id', second).select().single());
    }
    if (method === 'DELETE' && second) {
      await supabase.from('stock_in').update({ isDeleted: true, updatedAt: nowIso() }).eq('_id', second);
      return { _id: second };
    }
  }

  // ------------------------------------------------------------ NOTIFICATIONS
  if (resource === 'notifications') {
    if (method === 'GET' && !second) {
      const page = Math.max(1, num(query.page) || 1);
      const limit = Math.max(1, num(query.limit) || 10);
      let q = supabase.from('notifications').select('*', { count: 'exact' }).eq('isDeleted', false);
      if (query.type) q = q.eq('type', query.type);
      if (query.priority) q = q.eq('priority', query.priority);
      if (query.status) q = q.eq('status', query.status);
      if (query.search) q = q.or(`title.ilike.%${query.search}%,message.ilike.%${query.search}%`);
      if (query.isAutoGenerated !== undefined) q = q.eq('isAutoGenerated', query.isAutoGenerated);
      if (query.userId) q = q.eq('userId', query.userId);
      const { data, error, count } = await q.order('createdAt', { ascending: false }).range((page - 1) * limit, page * limit - 1);
      if (error) fail(error.message);
      return envelope({ notifications: data || [], total: count || 0, page, limit });
    }
    if (method === 'GET' && second === 'unread-count') {
      const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'unread').eq('isDeleted', false);
      if (error) fail(error.message);
      return envelope({ unreadCount: count || 0 });
    }
    if (method === 'PATCH' && second === 'mark-all-read') {
      const { data, error } = await supabase.from('notifications').update({ status: 'read', readAt: nowIso(), updatedAt: nowIso() }).eq('status', 'unread').eq('isDeleted', false).select('id');
      if (error) fail(error.message);
      return envelope({ modifiedCount: data?.length || 0 });
    }
    if (method === 'GET' && second === 'type') return envelope((await fetchRows('notifications')).filter((n) => n.type === third));
    if (method === 'GET' && second === 'priority') return envelope((await fetchRows('notifications')).filter((n) => n.priority === third));
    if (method === 'GET' && second === 'system') return envelope((await fetchRows('notifications')).filter((n) => n.type === 'system'));
    if (method === 'GET' && second === 'auto-generated') return envelope((await fetchRows('notifications')).filter((n) => n.isAutoGenerated));
    if (method === 'DELETE' && second === 'cleanup' && third === 'expired') {
      const { data, error } = await supabase.from('notifications').delete().lt('expiresAt', nowIso()).select('id');
      if (error) fail(error.message);
      return envelope({ deletedCount: data?.length || 0 });
    }
    if (method === 'POST' && second === 'system' && third === 'broadcast') {
      const payload = {
        title: body.title, message: body.message, type: 'system',
        priority: body.priority || 'medium', status: 'unread',
        userId: null, metadata: body.metadata || null, isAutoGenerated: true,
        isDeleted: false, createdAt: nowIso(), updatedAt: nowIso(),
      };
      return envelope(check(await supabase.from('notifications').insert(payload).select().single()));
    }
    if (method === 'GET' && second) {
      const { data, error } = await supabase.from('notifications').select('*').eq('_id', second).maybeSingle();
      if (error) fail(error.message);
      if (!data) fail('Không tìm thấy thông báo', 404);
      return envelope(data);
    }
    if (method === 'PATCH' && second && third === 'read') {
      return envelope(check(await supabase.from('notifications').update({ status: 'read', readAt: nowIso(), updatedAt: nowIso() }).eq('_id', second).select().single()));
    }
    if (method === 'PATCH' && second && third === 'unread') {
      return envelope(check(await supabase.from('notifications').update({ status: 'unread', readAt: null, updatedAt: nowIso() }).eq('_id', second).select().single()));
    }
    if (method === 'PATCH' && second) {
      const patch: Record<string, any> = { updatedAt: nowIso() };
      ['title', 'message', 'priority', 'status', 'relatedEntityId', 'relatedEntityType', 'metadata', 'expiresAt'].forEach((key) => {
        if (body?.[key] !== undefined) patch[key] = body[key];
      });
      return envelope(check(await supabase.from('notifications').update(patch).eq('_id', second).select().single()));
    }
    if (method === 'POST') {
      const payload = {
        title: body.title, message: body.message, type: body.type || 'system',
        priority: body.priority || 'medium', status: 'unread',
        userId: await notificationUser(body.userId),
        relatedEntityId: body.relatedEntityId || null, relatedEntityType: body.relatedEntityType || null,
        metadata: body.metadata || null, isAutoGenerated: body.isAutoGenerated ?? false,
        expiresAt: body.expiresAt || null, isDeleted: false, createdAt: nowIso(), updatedAt: nowIso(),
      };
      return envelope(check(await supabase.from('notifications').insert(payload).select().single()));
    }
    if (method === 'DELETE' && second) {
      await supabase.from('notifications').update({ isDeleted: true, updatedAt: nowIso() }).eq('_id', second);
      return envelope(null);
    }
  }

  // ------------------------------------------------------------ ANALYTICS
  if (resource === 'analytics' && method === 'GET') {
    const ctx = await A.loadAnalyticsContext(query);
    switch (parts.slice(1).join('/')) {
      case 'revenue': return A.revenueAnalytics(ctx, query);
      case 'payments': return A.paymentAnalytics(ctx);
      case 'payments/history': return A.paymentHistoryAnalytics(ctx);
      case 'inventory': return A.inventoryAnalytics(ctx);
      case 'customers': return A.customerAnalytics(ctx);
      case 'customers/list': return A.customerListResponse(ctx, query);
      case 'customers/regions': return A.regionAnalytics(ctx);
      case 'customers/regions/list': return A.customerListByRegionResponse(ctx, query);
      case 'stock-in': return A.stockInAnalytics(ctx);
      case 'trends': return A.timeBasedAnalytics(ctx);
      case 'dashboard':
      case 'quick-stats': return A.dashboardData(ctx, query);
      case 'debt': return A.debtAnalytics(ctx);
      case 'debt/overdue': return A.overdueDebtReport(ctx, num(query.daysOverdue || 30));
      case 'alerts': return A.alertsData(ctx);
      default: return ok({});
    }
  }

  fail(`Không hỗ trợ endpoint ${method} ${path}`, 404);
}
