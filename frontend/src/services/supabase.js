import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Singleton Supabase client with Clerk token injection.
 * Only ONE instance is ever created, eliminating GoTrueClient duplication warnings.
 * Auth listeners are disabled since Clerk handles all authentication.
 */
let _client = null;

export function getAuthenticatedClient(getToken) {
    if (_client) return _client;

    _client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
        global: {
            fetch: async (url, options = {}) => {
                const clerkToken = await getToken({ template: 'supabase' });
                const headers = new Headers(options?.headers);
                headers.set('Authorization', `Bearer ${clerkToken}`);
                return fetch(url, { ...options, headers });
            },
        },
    });

    return _client;
}
