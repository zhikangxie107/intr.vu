// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// These come from your .env.local
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

// Create a single Supabase client for use in your app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);