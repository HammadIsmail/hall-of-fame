export type Tier = 'Campus' | 'National' | 'International';
export type PlaqueStatus = 'pending' | 'approved' | 'rejected';

export interface Wing {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  icon_path: string;
  display_order: number;
  plaque_count?: number;
  created_at?: string;
}

export interface Plaque {
  id: number;
  reference_id: string;
  name: string;
  initials: string;
  dept_batch: string;
  title: string;
  wing_id: string;
  wing_name: string;
  tier: Tier;
  year: string;
  story: string;
  photo_url?: string | null;
  proof_url?: string | null;
  submitter_name?: string | null;
  submitter_contact?: string | null;
  status: PlaqueStatus;
  rejection_note?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CuratorUser {
  id: number;
  email: string;
  name: string;
}

