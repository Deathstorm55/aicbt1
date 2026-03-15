import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Default unauthenticated client (only used for public operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a Supabase client that fetches a fresh Clerk token on every request.
 * This avoids token expiration issues by using the accessToken callback.
 */
export function createClerkSupabaseClient(getToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: async (url, options = {}) => {
                const clerkToken = await getToken({ template: 'supabase' });
                const headers = new Headers(options?.headers);
                headers.set('Authorization', `Bearer ${clerkToken}`);
                return fetch(url, { ...options, headers });
            }
        }
    });
}
