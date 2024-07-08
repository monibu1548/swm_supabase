import {
  supabaseProjectURL,
  supabaseServiceRoleKey,
} from "../../environments.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  supabaseProjectURL,
  supabaseServiceRoleKey,
);
