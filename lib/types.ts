export type UserRole = 'client' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  storeName?: string;
  storeDescription?: string;
  storeImage?: string;
  totalSales?: number;
  totalRevenue?: number;
  badges?: string[];
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  brand: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  promotion?: {
    type: 'percentage' | 'fixed';
    discountPercent: number;
    validUntil: string;
  };
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  clientId: string;
  vendorId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Promotion {
  id: string;
  productId: string;
  discountPercent: number;
  description: string;
  validUntil: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredAchievement: string;
}
