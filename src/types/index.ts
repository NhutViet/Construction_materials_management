// Common types for the application

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface GrowthData {
  period: string;
  value: number;
  percentage: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}
