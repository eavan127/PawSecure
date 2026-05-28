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

    const fetchProfile = async (authId: string) => {
        console.log('[fetchProfile] fetching for', authId);
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', authId)
            .single();

        if (error) {
            console.error('[fetchProfile] error:', JSON.stringify(error));
            if (error.code === 'PGRST116') {
                console.warn('[fetchProfile] No org profile found — signing out');
                await supabase.auth.signOut();
            }
            return;
        }
        console.log('[fetchProfile] success, name:', data?.name);
        if (data) setUser(profileFromRow(data));
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            console.log('[login] signInWithPassword start');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });
            console.log('[login] signInWithPassword done, error:', error?.message ?? 'none');
            if (error) throw error;
            if (!data.user) throw new Error('Login failed — no user returned.');
            console.log('[login] fetchProfile start');
            await fetchProfile(data.user.id);
            console.log('[login] fetchProfile done');
        } finally {
            setIsLoading(false);
            console.log('[login] isLoading set to false');
        }
    };

    const register = async ({ email, password, name, phone, regNumber, country }: RegisterParams) => {
        setIsLoading(true);
        try {
            // 1. Create Supabase Auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
            });
            if (authError) throw authError;
            if (!authData.user) throw new Error('Signup failed — no user returned.');

            // 2. Insert org profile using the auth UUID as primary key
            //    so we can always find it with auth.uid()
            const { data: org, error: insertError } = await supabase
                .from('organizations')
                .insert({
                    id:              authData.user.id,   // ← links auth ↔ profile
                    email:           email.trim(),
                    name:            name.trim(),
                    phone:           phone.trim() || null,
                    registration_no: regNumber?.trim() || null,
                    address:         country?.trim() || null,
                    is_verified:     false,
                })
                .select()
                .single();

            if (insertError) {
                console.error('[register] insert error:', JSON.stringify(insertError));
                throw insertError;
            }
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
        await supabase.auth.signOut();
        setUser(null);
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
