import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Key starts with:', supabaseKey?.slice(0, 20));

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Missing Supabase env vars.\n' +
        'Copy .env.example → .env and fill in your project URL and anon key.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession:    true,
        autoRefreshToken:  true,
        detectSessionInUrl: false,
    },
});
