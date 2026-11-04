import { createClient } from "@supabase/supabase-js";

function getCleanSupabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lzolacsenyxfhperuysn.supabase.co";
  // Strip trailing /rest/v1/ or / if present
  return rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

const supabaseUrl = getCleanSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseAnonKey !== "your-supabase-anon-key"
);

// Client-side & server-side shared public client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "dummy-key-for-build",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Server-side admin client with service role key if needed
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
