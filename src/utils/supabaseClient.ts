import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://atesltsjzzoqcbmhylis.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_wemHVfkppgP6X8iWLUbQGg_7Dj5JncX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
