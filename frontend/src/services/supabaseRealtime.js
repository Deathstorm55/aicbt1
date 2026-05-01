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

export function getRealtimeClient() {
    if (_realtimeClient) return _realtimeClient;

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

    return _realtimeClient;
}
