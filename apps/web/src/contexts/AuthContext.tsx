import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile, Staff, Condominium, UserRole } from '../lib/types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    staff: Staff | null;
    condominium: Condominium | null;
    role: UserRole | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserData(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserData(session.user.id);
            } else {
                resetState();
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const resetState = () => {
        setProfile(null);
        setStaff(null);
        setCondominium(null);
        setRole(null);
    };

    const loadUserData = async (userId: string) => {
        try {
            // Load profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileData) setProfile(profileData);

            // Load staff record - simple query first (RLS: "Staff can view their own record")
            const { data: staffRows, error: staffError } = await supabase
                .from('staff')
                .select('*')
                .eq('profile_id', userId)
                .eq('is_active', true)
                .eq('role', 'admin');

            console.log('Staff query result:', staffRows, staffError);

            const staffData = staffRows && staffRows.length > 0 ? staffRows[0] : null;

            if (staffData) {
                setStaff(staffData as Staff);
                setRole(staffData.role as UserRole);

                // Now load condominium separately
                const { data: condoData } = await supabase
                    .from('condominiums')
                    .select('*')
                    .eq('id', staffData.condominium_id)
                    .single();

                if (condoData) {
                    setCondominium(condoData as Condominium);
                }
            } else {
                setRole(null);
            }
        } catch (err) {
            console.error('Error loading user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshUserData = async () => {
        if (user) {
            setLoading(true);
            await loadUserData(user.id);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? new Error(error.message) : null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        resetState();
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                staff,
                condominium,
                role,
                loading,
                signIn,
                signOut,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
