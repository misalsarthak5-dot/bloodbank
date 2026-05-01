import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzknikvqjyswoxdhannv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6a25pa3Zxanlzd294ZGhhbm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU0NjYsImV4cCI6MjA5MzIwMTQ2Nn0.bJ3lQCZZPqM-2D0IbgkraU3MMIb5BGW9hX33Wj1PvKY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
