import {
  fetchRows,
  num,
  round,
  sum,
  monthKey,
  inDateRange,
  groupBy,
  paginate,
} from './supabaseData';

/**
 * Analytics được tính ở client từ dữ liệu thô Supabase.
 * Mỗi hàm trả về ĐÚNG shape mà analyticsSlice đang kỳ vọng (kể cả key `_id`).
 */

export interface AnalyticsContext {
  invoices: any[];
  materials: any[];
  stockIns: any[];
}

export async function loadAnalyticsContext(query?: Record<string, any>): Promise<AnalyticsContext> {
  const [rawInvoices, materials, rawStockIns] = await Promise.all([
    fetchRows<any>('invoices'),
    fetchRows<any>('materials'),
    fetchRows<any>('stock_in'),
  ]);

  const invoices = rawInvoices.filter((inv) => !inv.isDeleted && inDateRange(inv, query));
  const stockIns = rawStockIns.filter((item) => !item.isDeleted && inDateRange(item, query));
  return { invoices, materials, stockIns };
}

const customerKey = (inv: any) => inv.customerId || inv.customerPhone || inv.customerName || 'unknown';
const customerIdObj = (inv: any) => ({
  customerId: customerKey(inv),
  customerName: inv.customerName || 'Khách lẻ',
  customerPhone: inv.customerPhone || '',
  customerAddress: inv.customerAddress || '',
});

const avg = (values: number[]) => (values.length ? round(sum(values) / values.length) : 0);
const sortMonthKeys = <T extends { _id: { year: number; month: number } }>(rows: T[]) =>
  rows.sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);

// ---------------------------------------------------------------- revenue
export function revenueAnalytics(ctx: AnalyticsContext, query: any = {}) {
  const { invoices } = ctx;
  const totals = invoices.map((i) => num(i.totalAmount));

  const months = groupBy(invoices, (i) => {
    const { year, month } = monthKey(i.createdAt);
    return `${year}-${month}`;
  });
  const revenueByMonth = sortMonthKeys(
    Object.entries(months).map(([key, rows]) => {
      const [year, month] = key.split('-').map(Number);
      return { _id: { year, month }, revenue: sum(rows.map((r) => num(r.totalAmount))), count: rows.length };
    })
  );

  // current vs previous period
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const prevMonthDate = new Date(thisYear, now.getMonth() - 1, 1);
  const current = query.startDate
    ? sum(totals)
    : sum(invoices.filter((i) => { const m = monthKey(i.createdAt); return m.year === thisYear && m.month === thisMonth; }).map((i) => num(i.totalAmount)));
  const previous = query.startDate
    ? 0
    : sum(invoices.filter((i) => { const m = monthKey(i.createdAt); return m.year === prevMonthDate.getFullYear() && m.month === prevMonthDate.getMonth() + 1; }).map((i) => num(i.totalAmount)));
  const growthAmount = round(current - previous);

  const methods = groupBy(invoices, (i) => i.paymentMethod || 'cash');
  return {
    totalRevenue: sum(totals),
    revenueByMonth,
    averageOrderValue: { avgOrderValue: avg(totals), minOrderValue: totals.length ? Math.min(...totals) : 0, maxOrderValue: totals.length ? Math.max(...totals) : 0 },
    revenueGrowth: { current: round(current), previous: round(previous), growthRate: previous ? round((growthAmount / previous) * 100) : 0, growthAmount },
    paymentMethodRevenue: Object.entries(methods).map(([_id, rows]) => ({
      _id,
      totalRevenue: sum(rows.map((r) => num(r.totalAmount))),
      count: rows.length,
      avgValue: avg(rows.map((r) => num(r.totalAmount))),
    })),
  };
}

// ---------------------------------------------------------------- payments
export function paymentAnalytics(ctx: AnalyticsContext) {
  const { invoices } = ctx;
  const statusGroups = groupBy(invoices, (i) => i.paymentStatus || 'unpaid');
  const paymentStatusStats = Object.entries(statusGroups).map(([_id, rows]) => ({
    _id,
    count: rows.length,
    totalAmount: sum(rows.map((r) => num(r.totalAmount))),
    paidAmount: sum(rows.map((r) => num(r.paidAmount))),
    remainingAmount: sum(rows.map((r) => num(r.remainingAmount))),
  }));

  const debts = invoices.filter((i) => num(i.remainingAmount) > 0);
  const debtAmounts = debts.map((i) => num(i.remainingAmount));
  const debtAnalysis = {
    totalDebt: sum(debtAmounts),
    avgDebtPerInvoice: avg(debtAmounts),
    maxDebt: debtAmounts.length ? Math.max(...debtAmounts) : 0,
    minDebt: debtAmounts.length ? Math.min(...debtAmounts) : 0,
    debtCount: debts.length,
    unpaidCount: statusGroups['unpaid']?.length || 0,
    partialCount: statusGroups['partial']?.length || 0,
  };

  const methodGroups = groupBy(invoices, (i) => i.paymentMethod || 'cash');
  const paymentMethodStats = Object.entries(methodGroups).map(([_id, rows]) => ({
    _id,
    count: rows.length,
    totalAmount: sum(rows.map((r) => num(r.totalAmount))),
    paidAmount: sum(rows.map((r) => num(r.paidAmount))),
    remainingAmount: sum(rows.map((r) => num(r.remainingAmount))),
    avgAmount: avg(rows.map((r) => num(r.totalAmount))),
  }));

  const overdue = debts.filter((i) => (Date.now() - new Date(i.createdAt).getTime()) / 86400000 > 30);
  const totalPaid = sum(invoices.map((i) => num(i.paidAmount)));
  const totalRevenue = sum(invoices.map((i) => num(i.totalAmount)));

  const byCustomer = groupBy(debts, customerKey);
  const debtByCustomer = Object.entries(byCustomer).map(([, rows]) => {
    const d = rows.map((r) => num(r.remainingAmount));
    return {
      _id: { customerId: customerKey(rows[0]), customerName: rows[0].customerName, customerPhone: rows[0].customerPhone || '' },
      totalDebt: sum(d),
      invoiceCount: rows.length,
      avgDebt: avg(d),
      maxDebt: Math.max(...d),
      lastOrderDate: rows.map((r) => r.createdAt).sort().at(-1) || '',
    };
  });

  const byMonth = groupBy(invoices, (i) => { const m = monthKey(i.createdAt); return `${m.year}-${m.month}`; });
  const paymentHistory = sortMonthKeys(
    Object.entries(byMonth).map(([key, rows]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        _id: { year, month },
        totalRevenue: sum(rows.map((r) => num(r.totalAmount))),
        totalPaid: sum(rows.map((r) => num(r.paidAmount))),
        totalDebt: sum(rows.map((r) => num(r.remainingAmount))),
        invoiceCount: rows.length,
      };
    })
  );

  return {
    paymentStatusStats,
    debtAnalysis,
    paymentMethodStats,
    overdueInvoices: { count: overdue.length, totalAmount: sum(overdue.map((i) => num(i.remainingAmount))), avgAmount: avg(overdue.map((i) => num(i.remainingAmount))) },
    totalPaidAmount: { totalPaid, totalRevenue, paymentRate: totalRevenue ? round((totalPaid / totalRevenue) * 100) : 0 },
    debtByCustomer,
    paymentHistory,
    summary: { totalDebt: sum(debtAmounts), totalPaid, totalRevenue, paymentRate: totalRevenue ? round((totalPaid / totalRevenue) * 100) : 0, debtRate: totalRevenue ? round((sum(debtAmounts) / totalRevenue) * 100) : 0 },
  };
}

// ---------------------------------------------------------------- inventory
export function inventoryAnalytics(ctx: AnalyticsContext) {
  const { materials, invoices } = ctx;
  const totalValue = sum(materials.map((m) => num(m.quantity) * num(m.price)));
  const lowStockItems = materials
    .filter((m) => num(m.quantity) <= num(m.minStock || 10))
    .map((m) => ({ _id: m._id, name: m.name, quantity: num(m.quantity), price: num(m.price), category: m.category }));

  const itemStats = new Map<string, any>();
  invoices.forEach((inv) => (inv.items || []).forEach((item: any) => {
    const key = item.materialId;
    const entry = itemStats.get(key) || {
      _id: { materialId: key, materialName: item.materialName },
      totalQuantity: 0, totalRevenue: 0, orderCount: 0, lastOrderDate: '',
    };
    entry.totalQuantity += num(item.quantity);
    entry.totalRevenue += num(item.totalPrice);
    entry.orderCount += 1;
    if (inv.createdAt > entry.lastOrderDate) entry.lastOrderDate = inv.createdAt;
    itemStats.set(key, entry);
  }));
  const allStats = Array.from(itemStats.values()).map((e) => ({ ...e, totalQuantity: round(e.totalQuantity), totalRevenue: round(e.totalRevenue) }));
  const topSellingMaterials = [...allStats].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10);
  const slowMovingItems = [...allStats].sort((a, b) => a.totalQuantity - b.totalQuantity).slice(0, 10);

  const categories = groupBy(materials, (m) => m.category || 'Khác');
  const categoryAnalysis = Object.entries(categories).map(([_id, rows]) => ({
    _id,
    count: rows.length,
    totalQuantity: sum(rows.map((r) => num(r.quantity))),
    totalValue: sum(rows.map((r) => num(r.quantity) * num(r.price))),
    avgPrice: avg(rows.map((r) => num(r.price))),
  }));

  return {
    inventoryOverview: {
      totalItems: materials.length,
      totalQuantity: sum(materials.map((m) => num(m.quantity))),
      avgQuantity: avg(materials.map((m) => num(m.quantity))),
      totalValue,
    },
    lowStockItems,
    topSellingMaterials,
    slowMovingItems,
    categoryAnalysis,
    inventoryValue: totalValue,
  };
}

// ---------------------------------------------------------------- customers
function customerAggregates(invoices: any[]) {
  const groups = groupBy(invoices, customerKey);
  return Object.entries(groups).map(([key, rows]) => {
    const spent = rows.map((r) => num(r.totalAmount));
    const dates = rows.map((r) => r.createdAt).filter(Boolean).sort();
    return {
      _id: customerIdObj(rows[0]),
      customerRef: key,
      totalSpent: sum(spent),
      invoiceCount: rows.length,
      avgOrderValue: avg(spent),
      lastOrderDate: dates.at(-1) || '',
      firstOrderDate: dates[0] || '',
      totalPaid: sum(rows.map((r) => num(r.paidAmount))),
      totalDebt: sum(rows.map((r) => num(r.remainingAmount))),
      unpaidInvoices: rows.filter((r) => r.paymentStatus === 'unpaid').length,
      partialInvoices: rows.filter((r) => r.paymentStatus === 'partial').length,
      paidInvoices: rows.filter((r) => r.paymentStatus === 'paid').length,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
}

const stripRef = (c: any) => {
  const { customerRef, ...rest } = c;
  return rest;
};

export function customerAnalytics(ctx: AnalyticsContext) {
  const { invoices } = ctx;
  const all = customerAggregates(invoices);
  const segments = groupBy(all, (c) => (c.totalSpent >= 10000000 ? 'VIP' : c.totalSpent >= 2000000 ? 'Thường xuyên' : 'Mới'));
  const customerSegments = Object.entries(segments).map(([_id, rows]) => ({ _id, count: rows.length, avgSpent: avg(rows.map((r) => r.totalSpent)), avgOrders: avg(rows.map((r) => r.invoiceCount)) }));
  const returning = all.filter((c) => c.invoiceCount > 1).length;
  const debts = groupBy(invoices.filter((i) => num(i.remainingAmount) > 0), (i) => i.paymentStatus || 'unpaid');
  const customerPaymentAnalysis = Object.entries(debts).map(([_id, rows]) => {
    const d = rows.map((r) => num(r.remainingAmount));
    return { _id, totalDebt: sum(d), avgDebt: avg(d), maxDebt: Math.max(...d), debtInvoices: rows.length };
  });
  const totalRevenue = sum(invoices.map((i) => num(i.totalAmount)));
  const totalDebt = sum(invoices.map((i) => num(i.remainingAmount)));

  return {
    customerOverview: { totalCustomers: all.length, totalInvoices: invoices.length, avgInvoicesPerCustomer: avg(invoices.map(() => 1)) && all.length ? round(invoices.length / all.length) : 0 },
    topCustomers: all.slice(0, 10).map(stripRef),
    customerSegments,
    customerRetention: { retentionRate: all.length ? round((returning / all.length) * 100) : 0, newCustomers: all.length - returning, returningCustomers: returning },
    newVsReturningCustomers: { newCustomers: all.length - returning, returningCustomers: returning },
    customerDetails: all.map(stripRef),
    customerPaymentAnalysis,
    summary: { totalCustomers: all.length, totalRevenue, totalDebt, avgCustomerValue: all.length ? round(totalRevenue / all.length) : 0 },
  };
}

export function customerListResponse(ctx: AnalyticsContext, query: any = {}) {
  let customers = customerAggregates(ctx.invoices).map(stripRef);
  const sortBy = query.sortBy || 'totalSpent';
  const dir = query.sortOrder === 'asc' ? 1 : -1;
  customers = [...customers].sort((a: any, b: any) => ((a[sortBy] ?? 0) > (b[sortBy] ?? 0) ? dir : -(dir)));
  const paged = paginate(customers, query.page || 1, query.limit || 10);
  const totalRevenue = sum(customers.map((c: any) => c.totalSpent));
  const totalDebt = sum(customers.map((c: any) => c.totalDebt));
  return {
    customers: paged.rows,
    pagination: { total: paged.total, limit: paged.limit, page: paged.page, hasMore: paged.page * paged.limit < paged.total },
    summary: { totalCustomers: customers.length, totalRevenue, totalDebt, avgCustomerValue: customers.length ? round(totalRevenue / customers.length) : 0 },
  };
}

// ---------------------------------------------------------------- regions
function regionOf(inv: any): string {
  const address = inv.customerAddress || '';
  const parts = address.split(/[,-]/).map((s: string) => s.trim()).filter(Boolean);
  return parts.at(-1) || 'Khác';
}

function regionStats(invoices: any[]) {
  const groups = groupBy(invoices, regionOf);
  return Object.entries(groups).map(([region, rows]) => ({
    region,
    customerCount: new Set(rows.map(customerKey)).size,
    totalRevenue: sum(rows.map((r) => num(r.totalAmount))),
    totalOrders: rows.length,
    avgOrderValue: avg(rows.map((r) => num(r.totalAmount))),
    totalPaid: sum(rows.map((r) => num(r.paidAmount))),
    totalDebt: sum(rows.map((r) => num(r.remainingAmount))),
  }));
}

export function regionAnalytics(ctx: AnalyticsContext) {
  const stats = regionStats(ctx.invoices);
  const thisYear = new Date().getFullYear();
  const regionGrowth = Object.entries(groupBy(ctx.invoices, regionOf)).map(([region, rows]) => {
    const currentCustomers = new Set(rows.filter((r) => new Date(r.createdAt).getFullYear() === thisYear).map(customerKey)).size;
    const previousCustomers = new Set(rows.filter((r) => new Date(r.createdAt).getFullYear() === thisYear - 1).map(customerKey)).size;
    const currentRevenue = sum(rows.filter((r) => new Date(r.createdAt).getFullYear() === thisYear).map((r) => num(r.totalAmount)));
    const previousRevenue = sum(rows.filter((r) => new Date(r.createdAt).getFullYear() === thisYear - 1).map((r) => num(r.totalAmount)));
    return {
      region,
      currentCustomers,
      previousCustomers,
      customerGrowth: previousCustomers ? round(((currentCustomers - previousCustomers) / previousCustomers) * 100) : 0,
      currentRevenue: round(currentRevenue),
      previousRevenue: round(previousRevenue),
      revenueGrowth: previousRevenue ? round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0,
    };
  });
  const totalCustomers = new Set(ctx.invoices.map(customerKey)).size;
  const totalRevenue = sum(ctx.invoices.map((i) => num(i.totalAmount)));
  return {
    regionStats: stats,
    topRegions: [...stats].sort((a, b) => b.customerCount - a.customerCount).slice(0, 10).map((r) => ({ region: r.region, customerCount: r.customerCount })),
    regionRevenue: stats.map(({ region, totalRevenue: tr, totalOrders, avgOrderValue }) => ({ region, totalRevenue: tr, totalOrders, avgOrderValue })),
    regionGrowth,
    summary: { totalRegions: stats.length, totalCustomers, totalRevenue, avgCustomersPerRegion: stats.length ? round(totalCustomers / stats.length) : 0 },
  };
}

export function customerListByRegionResponse(ctx: AnalyticsContext, query: any = {}) {
  const groups = groupBy(ctx.invoices, regionOf);
  let regions = Object.entries(groups).map(([region, rows]) => {
    const dates = rows.map((r) => r.createdAt).filter(Boolean).sort();
    return {
      region,
      customerCount: new Set(rows.map(customerKey)).size,
      totalRevenue: sum(rows.map((r) => num(r.totalAmount))),
      totalOrders: rows.length,
      avgOrderValue: avg(rows.map((r) => num(r.totalAmount))),
      totalPaid: sum(rows.map((r) => num(r.paidAmount))),
      totalDebt: sum(rows.map((r) => num(r.remainingAmount))),
      lastOrderDate: dates.at(-1) || '',
      firstOrderDate: dates[0] || '',
    };
  });
  if (query.region) regions = regions.filter((r) => r.region === query.region);
  const sortBy = query.sortBy || 'totalRevenue';
  const dir = query.sortOrder === 'asc' ? 1 : -1;
  regions = [...regions].sort((a: any, b: any) => ((a[sortBy] ?? 0) > (b[sortBy] ?? 0) ? dir : -(dir)));
  const paged = paginate(regions, query.page || 1, query.limit || 10);
  const totalCustomers = new Set(ctx.invoices.map(customerKey)).size;
  const totalRevenue = sum(ctx.invoices.map((i) => num(i.totalAmount)));
  return {
    regions: paged.rows,
    pagination: { total: paged.total, limit: paged.limit, page: paged.page, hasMore: paged.page * paged.limit < paged.total },
    summary: { totalRegions: regions.length, totalCustomers, totalRevenue, avgCustomersPerRegion: regions.length ? round(totalCustomers / regions.length) : 0 },
  };
}

// ---------------------------------------------------------------- stock-in
export function stockInAnalytics(ctx: AnalyticsContext) {
  const { stockIns } = ctx;
  const suppliers = groupBy(stockIns, (s) => s.supplier || 'Không rõ');
  const statuses = groupBy(stockIns, (s) => s.status || 'pending');
  const processingTimes = stockIns
    .filter((s) => s.approvedAt && s.createdAt)
    .map((s) => Math.max(0, (new Date(s.approvedAt).getTime() - new Date(s.createdAt).getTime()) / 86400000));
  return {
    stockInOverview: {
      totalStockIns: stockIns.length,
      totalAmount: sum(stockIns.map((s) => num(s.totalAmount))),
      paidAmount: sum(stockIns.map((s) => num(s.paidAmount))),
      remainingAmount: sum(stockIns.map((s) => num(s.remainingAmount))),
      avgAmount: avg(stockIns.map((s) => num(s.totalAmount))),
    },
    supplierAnalysis: Object.entries(suppliers).map(([_id, rows]) => ({
      _id,
      count: rows.length,
      totalAmount: sum(rows.map((r) => num(r.totalAmount))),
      avgAmount: avg(rows.map((r) => num(r.totalAmount))),
      lastOrderDate: rows.map((r) => r.receivedDate || r.createdAt).sort().at(-1) || '',
    })),
    paymentStatusAnalysis: Object.entries(statuses).map(([_id, rows]) => ({
      _id,
      count: rows.length,
      totalAmount: sum(rows.map((r) => num(r.totalAmount))),
      paidAmount: sum(rows.map((r) => num(r.paidAmount))),
      remainingAmount: sum(rows.map((r) => num(r.remainingAmount))),
    })),
    processingTimeAnalysis: [{
      _id: null,
      avgProcessingTime: round(avg(processingTimes)),
      minProcessingTime: processingTimes.length ? round(Math.min(...processingTimes)) : 0,
      maxProcessingTime: processingTimes.length ? round(Math.max(...processingTimes)) : 0,
    }],
  };
}

// ---------------------------------------------------------------- trends
function weekOf(d: Date) {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86400000) - (target.getTimezoneOffset() - firstThursday.getTimezoneOffset()) / 604800000 / 7);
}

export function timeBasedAnalytics(ctx: AnalyticsContext) {
  const { invoices } = ctx;
  const dailyGroups = groupBy(invoices, (i) => {
    const d = new Date(i.createdAt); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  });
  const weeklyGroups = groupBy(invoices, (i) => { const d = new Date(i.createdAt); return `${d.getFullYear()}-${weekOf(d)}`; });
  const monthlyGroups = groupBy(invoices, (i) => { const m = monthKey(i.createdAt); return `${m.year}-${m.month}`; });

  const dailyTrends = Object.entries(dailyGroups).map(([key, rows]) => {
    const [year, month, day] = key.split('-').map(Number);
    return { _id: { year, month, day }, revenue: sum(rows.map((r) => num(r.totalAmount))), orders: rows.length };
  }).sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month || a._id.day - b._id.day);
  const weeklyTrends = Object.entries(weeklyGroups).map(([key, rows]) => {
    const [year, week] = key.split('-').map(Number);
    return { _id: { year, week }, revenue: sum(rows.map((r) => num(r.totalAmount))), orders: rows.length };
  }).sort((a, b) => a._id.year - b._id.year || a._id.week - b._id.week);
  const monthlyTrends = sortMonthKeys(Object.entries(monthlyGroups).map(([key, rows]) => {
    const [year, month] = key.split('-').map(Number);
    return { _id: { year, month }, revenue: sum(rows.map((r) => num(r.totalAmount))), orders: rows.length };
  }));

  const seasonal = groupBy(invoices, (i) => String(new Date(i.createdAt).getMonth() + 1));
  const seasonalAnalysis = Object.entries(seasonal).map(([key, rows]) => ({ _id: Number(key), revenue: sum(rows.map((r) => num(r.totalAmount))), orders: rows.length }));

  const thisYear = new Date().getFullYear();
  const yearStat = (year: number) => {
    const rows = invoices.filter((i) => new Date(i.createdAt).getFullYear() === year);
    return { year, revenue: sum(rows.map((r) => num(r.totalAmount))), orders: rows.length };
  };
  const currentYear = yearStat(thisYear);
  const lastYear = yearStat(thisYear - 1);
  return {
    dailyTrends, weeklyTrends, monthlyTrends, seasonalAnalysis,
    yearOverYearComparison: {
      currentYear,
      lastYear,
      revenueGrowth: lastYear.revenue ? round(((currentYear.revenue - lastYear.revenue) / lastYear.revenue) * 100) : 0,
      orderGrowth: lastYear.orders ? round(((currentYear.orders - lastYear.orders) / lastYear.orders) * 100) : 0,
    },
  };
}

// ---------------------------------------------------------------- dashboard
export function alertsData(ctx: AnalyticsContext) {
  const { invoices, materials, stockIns } = ctx;
  const lowStockItems = materials
    .filter((m) => num(m.quantity) <= num(m.minStock || 10))
    .map((m) => ({ _id: m._id, name: m.name, quantity: num(m.quantity), price: num(m.price), category: m.category }));
  const overdueInvoices = invoices
    .filter((i) => num(i.remainingAmount) > 0 && (Date.now() - new Date(i.createdAt).getTime()) / 86400000 > 30)
    .map((i) => ({ _id: i._id, invoiceNumber: i.invoiceNumber, customerName: i.customerName, remainingAmount: num(i.remainingAmount), createdAt: i.createdAt }));
  const pendingStockIns = stockIns
    .filter((s) => s.status === 'pending')
    .map((s) => ({ _id: s._id, supplier: s.supplier || '', totalAmount: num(s.totalAmount), createdAt: s.createdAt }));
  return { lowStockItems, overdueInvoices, pendingStockIns, totalAlerts: lowStockItems.length + overdueInvoices.length + pendingStockIns.length };
}

export function dashboardData(ctx: AnalyticsContext, query: any = {}) {
  const { invoices, materials, stockIns } = ctx;
  const totalRevenue = sum(invoices.map((i) => num(i.totalAmount)));
  const last30 = new Date(Date.now() - 30 * 86400000);
  const newCustomers = new Set(invoices.filter((i) => new Date(i.createdAt) >= last30).map(customerKey)).size;
  return {
    financialSummary: { totalRevenue, totalOrders: invoices.length, averageOrderValue: avg(invoices.map((i) => num(i.totalAmount))) },
    inventorySummary: {
      totalItems: materials.length,
      lowStockCount: materials.filter((m) => num(m.quantity) <= num(m.minStock || 10)).length,
      totalValue: sum(materials.map((m) => num(m.quantity) * num(m.price))),
    },
    customerSummary: { totalCustomers: new Set(invoices.map(customerKey)).size, newCustomers },
    stockInSummary: {
      totalStockIns: stockIns.length,
      pendingCount: stockIns.filter((s) => s.status === 'pending').length,
      totalAmount: sum(stockIns.map((s) => num(s.totalAmount))),
    },
    alerts: alertsData(ctx),
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------- debt
export function debtAnalytics(ctx: AnalyticsContext) {
  const { invoices } = ctx;
  const debts = invoices.filter((i) => num(i.remainingAmount) > 0);
  const amounts = debts.map((i) => num(i.remainingAmount));
  const byCustomer = groupBy(debts, customerKey);
  const debtByCustomer = Object.entries(byCustomer).map(([, rows]) => {
    const d = rows.map((r) => num(r.remainingAmount));
    const dates = rows.map((r) => r.createdAt).filter(Boolean).sort();
    return {
      _id: customerIdObj(rows[0]),
      totalDebt: sum(d), invoiceCount: rows.length, avgDebt: avg(d), maxDebt: Math.max(...d),
      lastOrderDate: dates.at(-1) || '', firstDebtDate: dates[0] || '',
      unpaidInvoices: rows.filter((r) => r.paymentStatus === 'unpaid').length,
      partialInvoices: rows.filter((r) => r.paymentStatus === 'partial').length,
    };
  });
  const byStatus = groupBy(debts, (i) => i.paymentStatus || 'unpaid');
  const byMonth = groupBy(debts, (i) => { const m = monthKey(i.createdAt); return `${m.year}-${m.month}`; });
  const buckets = [
    { label: '0-30', min: 0, max: 30 }, { label: '31-60', min: 31, max: 60 },
    { label: '61-90', min: 61, max: 90 }, { label: '90+', min: 91, max: Infinity },
  ];
  const debtAging = buckets.map((b) => {
    const rows = debts.filter((i) => {
      const days = Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000);
      return days >= b.min && days <= b.max;
    });
    return {
      _id: b.label, count: rows.length, totalAmount: sum(rows.map((r) => num(r.remainingAmount))),
      avgAmount: avg(rows.map((r) => num(r.remainingAmount))),
      invoices: rows.map((r) => ({ invoiceNumber: r.invoiceNumber, customerName: r.customerName, remainingAmount: num(r.remainingAmount), daysSinceCreated: Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 86400000) })),
    };
  });
  const totalDebt = sum(amounts);
  return {
    debtOverview: {
      totalDebt, totalInvoices: debts.length, avgDebtPerInvoice: avg(amounts),
      maxDebt: amounts.length ? Math.max(...amounts) : 0, minDebt: amounts.length ? Math.min(...amounts) : 0,
      unpaidCount: byStatus['unpaid']?.length || 0, partialCount: byStatus['partial']?.length || 0,
    },
    debtByCustomer,
    debtByStatus: Object.entries(byStatus).map(([_id, rows]) => ({ _id, totalDebt: sum(rows.map((r) => num(r.remainingAmount))), invoiceCount: rows.length, avgDebt: avg(rows.map((r) => num(r.remainingAmount))) })),
    debtByTimeRange: sortMonthKeys(Object.entries(byMonth).map(([key, rows]) => {
      const [year, month] = key.split('-').map(Number);
      return { _id: { year, month }, totalDebt: sum(rows.map((r) => num(r.remainingAmount))), invoiceCount: rows.length, avgDebt: avg(rows.map((r) => num(r.remainingAmount))) };
    })),
    topDebtCustomers: [...debtByCustomer].sort((a, b) => b.totalDebt - a.totalDebt).slice(0, 10).map((c) => ({ _id: { customerId: c._id.customerId, customerName: c._id.customerName, customerPhone: c._id.customerPhone }, totalDebt: c.totalDebt, invoiceCount: c.invoiceCount, lastOrderDate: c.lastOrderDate })),
    debtAging,
    summary: { totalDebt, totalDebtCustomers: debtByCustomer.length, avgDebtPerCustomer: debtByCustomer.length ? round(totalDebt / debtByCustomer.length) : 0 },
  };
}

// ---------------------------------------------------------------- payment history
export function paymentHistoryAnalytics(ctx: AnalyticsContext) {
  const { invoices } = ctx;
  const totalRevenue = sum(invoices.map((i) => num(i.totalAmount)));
  const totalPaid = sum(invoices.map((i) => num(i.paidAmount)));
  const totalRemaining = sum(invoices.map((i) => num(i.remainingAmount)));
  const byMethod = groupBy(invoices, (i) => i.paymentMethod || 'cash');
  const byMonth = groupBy(invoices, (i) => { const m = monthKey(i.createdAt); return `${m.year}-${m.month}`; });
  const byCustomer = groupBy(invoices, customerKey);
  return {
    paymentOverview: {
      totalRevenue, totalPaid, totalRemaining, totalInvoices: invoices.length,
      paidInvoices: invoices.filter((i) => i.paymentStatus === 'paid').length,
      partialInvoices: invoices.filter((i) => i.paymentStatus === 'partial').length,
      unpaidInvoices: invoices.filter((i) => i.paymentStatus === 'unpaid').length,
      avgPaymentRate: invoices.length ? round(invoices.reduce((acc, i) => acc + (num(i.totalAmount) ? num(i.paidAmount) / num(i.totalAmount) : 0), 0) / invoices.length * 100) : 0,
    },
    paymentByMethod: Object.entries(byMethod).map(([_id, rows]) => {
      const revenue = sum(rows.map((r) => num(r.totalAmount)));
      const paid = sum(rows.map((r) => num(r.paidAmount)));
      return { _id, totalRevenue: revenue, totalPaid: paid, totalRemaining: sum(rows.map((r) => num(r.remainingAmount))), invoiceCount: rows.length, avgPaymentRate: revenue ? round((paid / revenue) * 100) : 0 };
    }),
    paymentByTimeRange: sortMonthKeys(Object.entries(byMonth).map(([key, rows]) => {
      const [year, month] = key.split('-').map(Number);
      const revenue = sum(rows.map((r) => num(r.totalAmount)));
      const paid = sum(rows.map((r) => num(r.paidAmount)));
      return { _id: { year, month }, totalRevenue: revenue, totalPaid: paid, totalRemaining: sum(rows.map((r) => num(r.remainingAmount))), invoiceCount: rows.length, paymentRate: revenue ? round((paid / revenue) * 100) : 0 };
    })),
    paymentByCustomer: Object.entries(byCustomer).map(([, rows]) => {
      const revenue = sum(rows.map((r) => num(r.totalAmount)));
      const paid = sum(rows.map((r) => num(r.paidAmount)));
      return {
        _id: { customerId: customerKey(rows[0]), customerName: rows[0].customerName, customerPhone: rows[0].customerPhone || '' },
        totalRevenue: revenue, totalPaid: paid, totalRemaining: sum(rows.map((r) => num(r.remainingAmount))),
        invoiceCount: rows.length, avgPaymentRate: revenue ? round((paid / revenue) * 100) : 0,
        lastPaymentDate: rows.map((r) => r.createdAt).sort().at(-1) || '',
      };
    }),
    recentPayments: [...invoices].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 10).map((i) => ({
      invoiceNumber: i.invoiceNumber, customerName: i.customerName, totalAmount: num(i.totalAmount),
      paidAmount: num(i.paidAmount), remainingAmount: num(i.remainingAmount), paymentStatus: i.paymentStatus, createdAt: i.createdAt,
    })),
    summary: { totalPaid, totalRevenue, paymentRate: totalRevenue ? round((totalPaid / totalRevenue) * 100) : 0, totalCustomers: Object.keys(byCustomer || {}).length },
  };
}

// ---------------------------------------------------------------- overdue
export function overdueDebtReport(ctx: AnalyticsContext, daysOverdue = 30) {
  const debts = ctx.invoices.filter((i) =>
    num(i.remainingAmount) > 0 && Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000) >= daysOverdue
  );
  const amounts = debts.map((i) => num(i.remainingAmount));
  const byCustomer = groupBy(debts, customerKey);
  const buckets = [
    { label: '30-60', min: 30, max: 60 }, { label: '61-90', min: 61, max: 90 }, { label: '90+', min: 91, max: Infinity },
  ];
  return {
    overdueOverview: {
      totalOverdueAmount: sum(amounts), totalOverdueInvoices: debts.length,
      avgOverdueAmount: avg(amounts),
      maxOverdueAmount: amounts.length ? Math.max(...amounts) : 0,
      minOverdueAmount: amounts.length ? Math.min(...amounts) : 0,
    },
    overdueByCustomer: Object.entries(byCustomer).map(([, rows]) => {
      const d = rows.map((r) => num(r.remainingAmount));
      const dates = rows.map((r) => r.createdAt).filter(Boolean).sort();
      return {
        _id: customerIdObj(rows[0]), totalOverdueAmount: sum(d), overdueInvoices: rows.length,
        avgOverdueAmount: avg(d), oldestOverdueDate: dates[0] || '', newestOverdueDate: dates.at(-1) || '',
      };
    }),
    overdueByTimeRange: buckets.map((b) => {
      const rows = debts.filter((i) => { const days = Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000); return days >= b.min && days <= b.max; });
      return { _id: b.label, count: rows.length, totalAmount: sum(rows.map((r) => num(r.remainingAmount))), avgAmount: avg(rows.map((r) => num(r.remainingAmount))) };
    }),
    criticalOverdue: debts.map((i) => ({ invoiceNumber: i.invoiceNumber, customerName: i.customerName, totalAmount: num(i.totalAmount), remainingAmount: num(i.remainingAmount), paymentStatus: i.paymentStatus, createdAt: i.createdAt })),
    summary: {
      totalOverdueAmount: sum(amounts), totalOverdueInvoices: debts.length, totalOverdueCustomers: Object.keys(byCustomer).length,
      criticalOverdueCount: debts.filter((i) => Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000) > 90).length,
    },
  };
}
