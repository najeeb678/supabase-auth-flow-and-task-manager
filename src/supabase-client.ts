import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;//this value won’t be null or undefined so treat it as a non-nullable string.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error("❌ Missing Supabase environment variables");
// }
export const supabase = createClient(supabaseUrl, supabaseKey);
