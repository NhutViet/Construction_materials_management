/**
 * Giữ file này làm điểm tương thích ngược.
 * Các slice vẫn import `AxiosInstance` nhưng thực tế đã đi qua apiClient
 * (Supabase khi đã cấu hình, backend cũ khi chưa có).
 */
export { default } from './apiClient';
