import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true khi đã khai báo đầy đủ thông tin project Supabase trong .env */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Dùng URL/key placeholder để createClient() không throw lúc build.
 * Khi chưa cấu hình, apiClient sẽ đi theo nhánh fallback (backend cũ / local).
 */
export const supabase: SupabaseClient = createClient(
  url || 'http://localhost:54321',
  anonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'inventory-auth',
    },
  }
);
