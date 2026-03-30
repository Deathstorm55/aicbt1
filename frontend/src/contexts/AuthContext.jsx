/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { getAuthenticatedClient } from '../services/supabase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { getToken, signOut } = useClerkAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Singleton Supabase client — same instance returned every time
    const authenticatedSupabase = useMemo(() => {
        if (!clerkUser) return null;
        return getAuthenticatedClient(getToken);
    }, [clerkUser, getToken]);

    const fetchUserProfile = useCallback(async () => {
        if (!clerkUser || !authenticatedSupabase) return;
        try {
            const { data: profile, error } = await authenticatedSupabase
                .from('users')
                .select('*')
                .eq('clerk_user_id', clerkUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching user profile:", error);
            }

            setUserData(profile || null);
        } catch (err) {
            console.error("Error resolving Clerk token:", err);
            setUserData(null);
        }
    }, [clerkUser, authenticatedSupabase]);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            if (clerkLoaded) {
                if (clerkUser) {
                    await fetchUserProfile();
                    if (mounted) setLoading(false);
                } else {
                    if (mounted) {
                        setUserData(null);
                        setLoading(false);
                    }
                }
            }
        };
        init();
        return () => { mounted = false; };
    }, [clerkUser, clerkLoaded, fetchUserProfile]);

    const logout = async () => {
        await signOut();
        setUserData(null);
    };

    const value = {
        currentUser: clerkUser,
        userData,
        logout,
        refreshUserData: fetchUserProfile,
        supabase: authenticatedSupabase
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && clerkLoaded && children}
        </AuthContext.Provider>
    );
}
