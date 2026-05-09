const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojibuhaovoohpzmorsek.supabase.co',
  'sb_publishable_bCVStqQKXoxLmDZngGhQUg_EW1ZohXf'
);

async function testSupabase() {
  console.log('Testing Supabase REST API Connection...');
  const { data, error } = await supabase.from('experts').select('*');
  
  if (error) {
    console.error('Error fetching experts:', error.message);
  } else {
    console.log('Success! Supabase Connection is working.');
    console.log('Experts count:', data.length);
    if (data.length === 0) {
      console.log('Database is empty. We need to seed it.');
    } else {
      console.log('Sample Data:', data[0]);
    }
  }
}

testSupabase();
