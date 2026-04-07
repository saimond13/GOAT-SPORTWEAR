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
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  target_product_id?: string;
  target_category?: string;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  source: string;
  created_at: string;
}
