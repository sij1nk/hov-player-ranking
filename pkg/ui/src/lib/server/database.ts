import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_KEY } from "$env/static/private";

const database = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export { database };
