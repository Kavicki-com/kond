import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://nooggzakadyzgaaujjur.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vb2dnemFrYWR5emdhYXVqanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI0NTgsImV4cCI6MjA4NjMwODQ1OH0.GIRTFizlwJs-8J4M2QretTT38WCiDm2yD9aDCJ1X8gA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
