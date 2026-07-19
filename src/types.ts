export interface ProductVariant {
  id: string;
  color: string;
  storage: string;
  costPrice: number;
  memberPrice: number;
  retailPrice: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  specifications: string[];
  freebies: string[];
  images: string[];
  variants: ProductVariant[];
  active: boolean;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopName: string;
  active: boolean;
  role: 'admin' | 'member';
  createdAt: string;
  creditDays?: 0 | 7 | 10 | 30; // 0 means no credit (cash-only), or 7, 10, 30 days
  password?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'completed' | 'canceled';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  color: string;
  storage: string;
  quantity: number;
  memberPrice: number;
  retailPrice: number;
  image: string;
}

export interface Order {
  id: string;
  memberId: string;
  memberName: string;
  memberShopName: string;
  items: OrderItem[];
  totalAmount: number;
  note: string;
  status: OrderStatus;
  createdAt: string;
  statusHistory: { status: OrderStatus; timestamp: string }[];
  deliveryType: 'delivery' | 'pickup';
  deliveryTime: string; // specified time for delivery/pickup
  paymentMethod: 'cash' | 'credit';
  creditDays?: 7 | 10 | 30; // selected credit terms
}

export interface PromoBanner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  active: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (productId-color-storage)
  product: Product;
  selectedColor: string;
  selectedStorage: string;
  quantity: number;
  memberPrice: number;
  retailPrice: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'promo' | 'alert' | 'news';
  createdAt: string;
  active: boolean;
}

