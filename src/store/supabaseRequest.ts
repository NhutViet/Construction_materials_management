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
    return {
      materialId,
      materialName: item.materialName || material?.name || 'Vật tư',
      quantity,
      unitPrice,
      totalPrice: round(unitPrice * quantity),
      unit: item.unit || material?.unit || '',
      ...(item.deliveredQuantity !== undefined ? { deliveredQuantity: num(item.deliveredQuantity) } : {}),
      ...(item.deliveryStatus ? { deliveryStatus: item.deliveryStatus } : {}),
    };
  }));
}

const activeInvoices = async () => (await fetchRows<any>('invoices')).filter((i) => !i.isDeleted);

function derivePayment(paidAmount: number, totalAmount: number) {
  const paid = Math.max(0, round(paidAmount));
  const remaining = Math.max(0, round(totalAmount - paid));
  const status = remaining === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  return { paidAmount: paid, remainingAmount: remaining, paymentStatus: status };
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
      deliveredAmount: round(delivered * unitPrice),
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
      for (const invoice of invoices) {
        const items = invoice.items || [];
        if (!items.some((item: any) => item.materialId === second)) continue;
        const newItems = items.map((item: any) => item.materialId === second
          ? { ...item, originalUnitPrice: item.originalUnitPrice ?? item.unitPrice, originalTotalPrice: item.originalTotalPrice ?? item.totalPrice, unitPrice: num(body.price), totalPrice: round(num(body.price) * num(item.quantity)), priceAdjustmentAmount: round((num(body.price) - num(item.unitPrice)) * num(item.quantity)), priceAdjustmentReason: body.priceUpdateReason || '', priceAdjustedAt: nowIso() }
          : item);
        const totals = computeTotals(newItems, invoice.taxRate, invoice.discountRate);
        await supabase.from('invoices').update({ items: newItems, ...totals, updatedAt: nowIso() }).eq('_id', invoice._id);
        affected.push({
          invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, customerName: invoice.customerName,
          oldTotalAmount: num(invoice.totalAmount), newTotalAmount: totals.totalAmount,
          priceDifference: round(totals.totalAmount - num(invoice.totalAmount)), items: newItems,
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
      await adjustMaterialStock(items, -1);
      return invoice;
    }

    if (method === 'PATCH' && second && third === 'status') {
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
      const delivered = Math.min(qty, num(body?.deliveredQuantity));
      items[index] = { ...items[index], deliveredQuantity: delivered, deliveryStatus: delivered >= qty ? 'delivered' : delivered > 0 ? 'partial' : 'pending', deliveredAt: delivered > 0 ? nowIso() : null };
      return check(await supabase.from('invoices').update({ items, updatedAt: nowIso() }).eq('_id', second).select().single());
    }
    if (method === 'PATCH' && second) {
      const items = await buildInvoiceItems(body.items || []);
      const taxRate = num(body.taxRate);
      const discountRate = num(body.discountRate);
      const totals = computeTotals(items, taxRate, discountRate);
      const payment = derivePayment(num(body.paidAmount), totals.totalAmount);
      const patch: Record<string, any> = {
        customerName: body.customerName, customerPhone: body.customerPhone || '', customerAddress: body.customerAddress || '',
        items, taxRate, discountRate, ...totals, ...payment,
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
