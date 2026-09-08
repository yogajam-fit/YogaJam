const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, date, created_at')
    .order('date', { ascending: true })
    .limit(10);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Events sorted by date ASC:");
    console.table(data);
  }
}

main();
