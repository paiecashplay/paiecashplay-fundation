import supabase from './supabaseClient.js';

async function testConnexion() {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('Erreur de connexion :', error);
  } else {
    console.log('Connexion réussie ! Données :', data);
  }
}

testConnexion();
