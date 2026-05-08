export type AdminRole = "owner" | "editor";

export interface AdminProfile {
  id: string;
  email: string;
  full_name?: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  image_path?: string;
  images?: string[];
  cta_url?: string;
  cta_label?: string;
  countdown_ends_at?: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  target_product_id?: string;
  target_category?: string;
  // Preventa / seña
  is_preventa?: boolean;
  unit_price?: number;
  deposit_percentage?: number;
  preventa_closes_at?: string;
  // Tabla de talles del drop
  size_chart?: Array<{ talle: string; largo: string; ancho: string }>;
  created_at: string;
}

export interface PreventaRegistration {
  id: string;
  campaign_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  product_name: string;
  size: string;
  quantity: number;
  deposit_amount: number;
  status: "pending" | "deposit_paid" | "cancelled";
  notes?: string;
  created_at: string;
}

export interface CampaignProduct {
  id: string;
  campaign_id: string;
  product_id: string;
  stock_limit: number;
  sort_order: number;
  available?: number;
  product?: {
    id: string;
    name: string;
    images?: string[];
    image_url?: string;
    price: number;
  };
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  source: string;
  created_at: string;
}
