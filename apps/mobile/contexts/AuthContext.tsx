import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, Staff, Resident, Condominium } from '../lib/types';

type UserRole = 'admin' | 'doorman' | 'janitor' | 'resident' | null;

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    role: UserRole;
    staff: Staff | null;
    resident: Resident | null;
    condominium: Condominium | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [resident, setResident] = useState<Resident | null>(null);
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                loadUserData(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
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
        setRole(null);
        setStaff(null);
        setResident(null);
        setCondominium(null);
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

            // Check if staff
            const { data: staffData } = await supabase
                .from('staff')
                .select('*, condominium:condominiums(*)')
                .eq('profile_id', userId)
                .eq('is_active', true)
                .limit(1)
                .single();

            if (staffData) {
                setStaff(staffData);
                setRole(staffData.role);
                setCondominium(staffData.condominium || null);
            } else {
                // Check if resident
                const { data: residentData } = await supabase
                    .from('residents')
                    .select(`
            *,
            unit:units(
              *,
              block:blocks(
                *,
                condominium:condominiums(*)
              )
            )
          `)
                    .eq('profile_id', userId)
                    .limit(1)
                    .single();

                if (residentData) {
                    setResident(residentData);
                    setRole('resident');
                    const condo = residentData.unit?.block?.condominium || null;
                    setCondominium(condo);
                } else {
                    // New user with no role yet
                    setRole(null);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshUserData = async () => {
        if (session?.user) {
            setLoading(true);
            await loadUserData(session.user.id);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error as Error | null };
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        resetState();
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                profile,
                role,
                staff,
                resident,
                condominium,
                loading,
                signIn,
                signUp,
                signOut,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
