import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test de la connexion
const { data, error } = await supabase.from('your_table').select('*');
if (error) {
  console.error('Erreur de connexion à Supabase:', error);
} else {
  console.log('Données récupérées:', data);
}
