import { supabase } from '../lib/supabase';

/** Tạo lỗi có shape giống AxiosError để các slice đọc error.response?.data?.message được. */
export function apiError(message: string, status = 400, error?: string): never {
  const err: any = new Error(message);
  err.isAxiosError = true;
  err.response = {
    status,
    data: { message, error: error || message, success: false },
  };
  throw err;
}

/** Kiểm tra kết quả PostgREST, ném lỗi nếu có. */
export function check<T>(result: { data: T | null; error: any; status?: number }): T {
  if (result.error) {
    apiError(result.error.message, result.status || 400, result.error.hint);
  }
  return result.data as T;
}

export async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) apiError('Chưa đăng nhập hoặc phiên đã hết hạn', 401);
  return data.user!;
}

export async function fetchRows<T = any>(table: string, select = '*'): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(select);
  if (error) apiError(error.message, 400);
  return (data || []) as T[];
}

export const num = (value: any): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export const round = (n: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(num(n) * factor) / factor;
};

export const sum = (values: number[]): number => round(values.reduce((a, b) => a + num(b), 0));

/** Lấy năm/tháng từ createdAt (Mongo-style `_id: { year, month }`). */
export const monthKey = (dateValue: any) => {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return { year: 1970, month: 1 };
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

export const inDateRange = (row: any, query?: Record<string, any>): boolean => {
  if (!query?.startDate && !query?.endDate) return true;
  const time = new Date(row.createdAt || row.receivedDate || 0).getTime();
  if (query.startDate && time < new Date(query.startDate).getTime()) return false;
  if (query.endDate && time > new Date(query.endDate).getTime()) return false;
  return true;
};

export function groupBy<T>(rows: T[], keyFn: (row: T) => string): Record<string, T[]> {
  return rows.reduce((acc: Record<string, T[]>, row) => {
    const key = keyFn(row);
    (acc[key] ||= []).push(row);
    return acc;
  }, {});
}

export const paginate = <T>(rows: T[], page = 1, limit = 10) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 10);
  const start = (p - 1) * l;
  return { rows: rows.slice(start, start + l), page: p, limit: l, total: rows.length };
};

/** Sinh số hóa đơn/phiếu nhập kiểu Mongo timestamp id. */
export const makeDocNumber = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'online', label: 'Chuyển khoản' },
  { value: 'debt', label: 'Công nợ' },
];
