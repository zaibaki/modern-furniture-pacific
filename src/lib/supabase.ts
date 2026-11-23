// Supabase client for the Modern Furniture Pacific backend.
//
// The backend lives in its own repo (zaibaki/modern-furniture-pacific-backend)
// and, once its live project exists, holds the same catalogue the site
// currently reads from src/data/products.json.
//
// The client is created ONLY when both public env vars are set:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// Otherwise `supabase` is null and the site keeps reading the local JSON
// (see src/lib/data.ts). The anon key is publishable by design — the RLS
// policies only allow public reads — but it still belongs in Vercel env
// vars / a local .env, never in git.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
