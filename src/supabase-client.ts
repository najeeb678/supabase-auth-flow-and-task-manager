import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;//this value won’t be null or undefined so treat it as a non-nullable string.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error("❌ Missing Supabase environment variables");
// }
export const supabase = createClient(supabaseUrl, supabaseKey);


// NEXT_PUBLIC_SUPABASE_URL=https://vannabdnnslosolymnyr.supabase.co
// NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbm5hYmRubnNsb3NvbHltbnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MTkyMjEsImV4cCI6MjA3NjQ5NTIyMX0.dftWaIo1G1L2VuUjsG3b_HxYJwvjp04yEu-AXM5lDek

