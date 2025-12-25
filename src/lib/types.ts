export type BusinessStatus = 'pending' | 'approved' | 'rejected';
export type AppRole = 'admin' | 'user';

export interface PlatformSettings {
  id: string;
  app_name: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}

export interface IndianState {
  id: string;
  name: string;
  code: string;
}

export interface BusinessTag {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
}

export interface BusinessTagAssignment {
  id: string;
  business_id: string;
  tag_id: string | null;
  custom_tag: string | null;
  created_at: string;
  tag?: BusinessTag;
}

export interface BusinessHour {
  id: string;
  business_id: string;
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string | null;
  status: BusinessStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: BusinessImage[];
  tags?: BusinessTagAssignment[];
  hours?: BusinessHour[];
}

export interface BusinessImage {
  id: string;
  business_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected';
export type TransferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface BusinessClaim {
  id: string;
  business_id: string;
  claimant_id: string;
  status: ClaimStatus;
  proof_document: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  business?: Business;
  claimant?: Profile;
}

export interface BusinessTransfer {
  id: string;
  business_id: string;
  from_user_id: string;
  to_user_email: string;
  to_user_id: string | null;
  status: TransferStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
  business?: Business;
  from_user?: Profile;
  to_user?: Profile;
}
