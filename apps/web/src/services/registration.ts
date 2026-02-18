import { supabase } from '../lib/supabase';

interface RegisterData {
    condoName: string;
    address: string;
    units: string;
    managerName: string;
    managerEmail: string;
    managerPhone: string;
    managerCpf: string;
    plan: string;
    password?: string;
}

export const registerCondoManager = async (data: RegisterData) => {
    // 1. Sign Up User with Metadata
    // The Database Trigger 'on_auth_user_created' (defined in supabase_setup.sql) 
    // will handle the creation of: Profile, Condominium, Staff (Admin) and Subscription

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.managerEmail,
        password: data.password || 'mudar123',
        options: {
            emailRedirectTo: `${window.location.origin}/confirm-email`,
            data: {
                full_name: data.managerName,
                phone: data.managerPhone,
                condo_name: data.condoName,
                plan_name: data.plan.charAt(0).toUpperCase() + data.plan.slice(1),
                address: data.address,
                units: data.units
            }
        }
    });

    if (authError) throw new Error(`Erro no cadastro: ${authError.message}`);

    return authData;
};
