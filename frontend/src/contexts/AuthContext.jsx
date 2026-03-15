/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '../services/supabase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { getToken, signOut } = useClerkAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        if (!clerkUser) return;
        try {
            const token = await getToken({ template: 'supabase' });
            const supabase = createClerkSupabaseClient(token);

            const { data: profile, error } = await supabase
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
    }, [clerkUser, getToken]);

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
    };

    const value = {
        currentUser: clerkUser,
        userData,
        logout,
        refreshUserData: fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && clerkLoaded && children}
        </AuthContext.Provider>
    );
}
