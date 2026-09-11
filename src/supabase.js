import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sdorqgigsmcwdedjwxjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LhPGbFEQCB33cB3DDle48Q_My6XCGrD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
