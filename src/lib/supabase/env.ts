// Server-only env loader for Supabase. Throws early if misconfigured.
const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
};

export const supabaseEnv = {
  url: () => requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: () => requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceRoleKey: () => requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
};
