// This file sets up the Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kqpqrlgsvglaetzthqxr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcHFybGdzdmdsYWV0enRocXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NzI1MTgsImV4cCI6MjA2MjQ0ODUxOH0.WB_OHgbUjM6HQPK3BWd46QzNGbH2TlqQ0ErCpctZCZE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
