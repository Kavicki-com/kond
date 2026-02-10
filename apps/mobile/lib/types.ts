// ============================================
// Kond Types
// ============================================

export type UserRole = 'admin' | 'doorman' | 'janitor' | 'resident';

export type Plan = 'free' | 'basic' | 'pro' | 'enterprise';

export type VolumeType = 'box_s' | 'box_m' | 'box_l' | 'envelope' | 'bag' | 'tube' | 'other';

export type PackageStatus = 'pending' | 'picked_up' | 'expired';

export interface Profile {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    push_token: string | null;
    created_at: string;
}

export interface Condominium {
    id: string;
    name: string;
    cnpj: string | null;
    address: string | null;
    plan: Plan;
    unit_limit: number | null;
    created_at: string;
}

export interface Block {
    id: string;
    condominium_id: string;
    name: string;
    sort_order: number;
}

export interface Unit {
    id: string;
    block_id: string;
    number: string;
    sort_order: number;
}

export interface Resident {
    id: string;
    unit_id: string;
    profile_id: string;
    is_primary: boolean;
    receives_notifications: boolean;
    created_at: string;
    // Joined
    profile?: Profile;
    unit?: Unit & { block?: Block };
}

export interface Staff {
    id: string;
    condominium_id: string;
    profile_id: string;
    role: 'admin' | 'doorman' | 'janitor';
    is_active: boolean;
    created_at: string;
    // Joined
    profile?: Profile;
    condominium?: Condominium;
}

export interface Package {
    id: string;
    unit_id: string;
    registered_by: string;
    recipient_name: string | null;
    carrier: string | null;
    volume_type: VolumeType;
    tracking_code: string | null;
    notes: string | null;
    photo_url: string | null;
    status: PackageStatus;
    picked_up_by: string | null;
    registered_at: string;
    picked_up_at: string | null;
    // Joined
    unit?: Unit & { block?: Block };
    registered_by_profile?: Profile;
    picked_up_by_profile?: Profile;
}

export interface CarrierSuggestion {
    id: string;
    name: string;
    icon: string | null;
    sort_order: number;
}

export interface Invite {
    id: string;
    condominium_id: string;
    unit_id: string | null;
    code: string;
    role: UserRole;
    email: string | null;
    used_by: string | null;
    used_at: string | null;
    expires_at: string;
    created_at: string;
}
