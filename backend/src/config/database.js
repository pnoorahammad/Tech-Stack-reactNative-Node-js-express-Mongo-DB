const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === 'production') {
    logger.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_ANON_KEY missing in production.');
    console.error('You must configure Supabase credentials in your Render dashboard.');
    process.exit(1);
  } else {
    logger.warn('Supabase credentials missing. Ensure .env is configured.');
  }
}

// Create a single supabase client for interacting with your database
const supabase = createClient(
  supabaseUrl || 'https://ojibuhaovoohpzmorsek.supabase.co',
  supabaseKey || 'sb_publishable_bCVStqQKXoxLmDZngGhQUg_EW1ZohXf'
);

module.exports = { supabase };
