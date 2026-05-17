import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://tmupwayqeciafmhptkpg.supabase.co";

const supabaseAnonKey =
  "sb_publishable_Iw7eRRriGrJztSQ3QnAJzw_7bPvEiII";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);