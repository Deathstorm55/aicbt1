import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Lightweight Supabase client for Realtime subscriptions only.
 * The main authenticated client uses a custom fetch wrapper for Clerk tokens,
 * which doesn't work with WebSocket-based Realtime channels.
 * This client uses the anon key and is only used for listening to DB changes.
 */
let _realtimeClient = null;

export function getRealtimeClient(token = null) {
    if (!_realtimeClient) {
        _realtimeClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        });
    }

    if (token) {
        // Set the JWT token so Realtime uses it for RLS checks
        _realtimeClient.realtime.setAuth(token);
    }

    return _realtimeClient;
}
