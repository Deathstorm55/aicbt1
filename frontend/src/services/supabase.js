import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL loaded:", !!supabaseUrl, supabaseUrl);
console.log("Supabase Key loaded:", !!supabaseAnonKey, supabaseAnonKey?.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createClerkSupabaseClient(clerkToken) {
    if (!clerkToken) return supabase;

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${clerkToken}`
            }
        }
    });
}
