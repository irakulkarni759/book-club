import { createClient } from "@supabase/supabase-js";

// One shared connection to the database, used by every page.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);
