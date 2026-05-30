/**
 * AuthContext — PawSecure org-only authentication.
 * Only NGOs / SPCA / volunteer organisations can register.
 * Uses Supabase Auth for credentials + `organizations` table for profile.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Organization } from '../lib/supabaseTypes';

// What the rest of the app sees about the current logged-in org
export interface OrgUser {
    id:              string;   // = Supabase auth user UUID
    email:           string;
    name:            string;   // organisation name
    phone:           string | null;
    registrationNo:  string | null;
    address:         string | null;
    latitude:        number | null;
    longitude:       number | null;
    isVerified:      boolean;
    profileComplete: boolean;
}

interface AuthContextType {
    user:            OrgUser | null;
    isLoading:       boolean;
    isAuthenticated: boolean;
    login:           (email: string, password: string) => Promise<void>;
    register:        (params: RegisterParams) => Promise<void>;
    updateProfile:   (updates: Partial<OrgUser>) => Promise<void>;
    logout:          () => Promise<void>;
}

export interface RegisterParams {
    email:      string;
    password:   string;
    name:       string;        // organisation name
    phone:      string;
    regNumber?: string;
    country?:   string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function profileFromRow(row: Organization): OrgUser {
    return {
        id:             row.id,
        email:          row.email,
        name:           row.name,
        phone:          row.phone,
        registrationNo: row.registration_no,
        address:        row.address,
        latitude:       row.latitude,
        longitude:      row.longitude,
        isVerified:     row.is_verified,
        profileComplete: !!(row.name && row.phone),
    };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser]       = useState<OrgUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load session on mount
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) await fetchProfile(session.user.id);
            setIsLoading(false);
        });

        // Keep in sync when auth state changes (tab focus, token refresh)
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    // Returns true if org profile found, false if not
    const fetchProfile = async (authId: string): Promise<boolean> => {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', authId)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') {
                console.error('[fetchProfile] error:', JSON.stringify(error));
            }
            // PGRST116 = no org row yet — normal during registration, don't sign out
            return false;
        }
        if (data) setUser(profileFromRow(data));
        return true;
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            console.log('[login] step 1 — signInWithPassword start');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });
            console.log('[login] step 1 done — error:', error?.message ?? 'none', '| userId:', data.user?.id ?? 'null');
            if (error) throw error;
            if (!data.user) throw new Error('Login failed — no user returned.');

            console.log('[login] step 2 — fetchProfile start');
            const found = await fetchProfile(data.user.id);
            console.log('[login] step 2 done — found:', found);
            if (!found) {
                await supabase.auth.signOut();
                throw new Error('No organisation profile found for this email. Please sign up first.');
            }
        } catch (e: any) {
            console.error('[login] error:', e.message);
            throw e;
        } finally {
            console.log('[login] finally — setIsLoading false');
            setIsLoading(false);
        }
    };

    const register = async ({ email, password, name, phone, regNumber, country }: RegisterParams) => {
        setIsLoading(true);
        try {
            // 1. Create Supabase Auth account
            console.log('[register] step 1 — signUp start');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
            });
            console.log('[register] step 1 done — authError:', authError?.message ?? 'none', '| userId:', authData.user?.id ?? 'null');
            if (authError) throw authError;
            if (!authData.user) throw new Error('Signup failed — no user returned.');

            // 2. Insert org profile using the auth UUID as primary key
            console.log('[register] step 2 — insert organizations start');
            const { data: org, error: insertError } = await supabase
                .from('organizations')
                .insert({
                    id:              authData.user.id,
                    email:           email.trim(),
                    name:            name.trim(),
                    phone:           phone.trim() || null,
                    registration_no: regNumber?.trim() || null,
                    address:         country?.trim() || null,
                    is_verified:     false,
                })
                .select()
                .single();

            console.log('[register] step 2 done — insertError:', insertError?.message ?? 'none');
            if (insertError) {
                console.error('[register] insert error full:', JSON.stringify(insertError));
                throw new Error(insertError.message);
            }
            console.log('[register] step 3 — setUser');
            setUser(profileFromRow(org));
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<OrgUser>) => {
        if (!user) return;
        const { error } = await supabase
            .from('organizations')
            .update({
                name:            updates.name,
                phone:           updates.phone,
                registration_no: updates.registrationNo,
                address:         updates.address,
                latitude:        updates.latitude,
                longitude:       updates.longitude,
            })
            .eq('id', user.id);

        if (error) throw new Error(error.message);
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    };

    const logout = async () => {
        setUser(null); // clear user immediately → tab layout redirects to landing right away
        supabase.auth.signOut().catch(() => {}); // fire and forget — don't wait for network
    };

    return (
        <AuthContext.Provider value={{
            user, isLoading,
            isAuthenticated: !!user,
            login, register, updateProfile, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
