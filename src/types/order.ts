export type OrderStatus = "pending" | "pending_whatsapp" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Order {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  status: OrderStatus;
  payment_method?: string;
  payment_status: PaymentStatus;
  notes?: string;
  total: number;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  size: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}
