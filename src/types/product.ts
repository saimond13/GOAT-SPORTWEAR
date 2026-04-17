export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  sizes: string[];
  /** Si es false, el producto no requiere talle (ej: accesorios) */
  has_sizes?: boolean;
  /** Stock por talle: { S: 5, M: 10, L: 0 }. Si está vacío/undefined, stock ilimitado */
  stock_by_size?: Record<string, number>;
  /** Métodos de pago habilitados. Si es null/undefined, se usan todos */
  payment_methods?: string[];
  badge?: string;
  image_url?: string;
  image_path?: string;
  images?: string[];
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
  paymentMethod: string;
}

export const CATEGORIES = ["Remeras", "Buzos", "Pantalones", "Camperas", "Shorts", "Conjuntos", "Calza", "Top", "Accesorios"];
export const PAYMENT_METHODS = ["Efectivo", "Transferencia", "Mercado Pago", "Tarjeta de crédito", "Tarjeta de débito"];
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export const BADGES = ["", "NUEVO", "OFERTA", "BESTSELLER", "PACK"];
