export async function sendContactForm(data: any) {
  // Simulation d'envoi d'email - remplacer par vraie implémentation EmailJS
  console.log('Envoi formulaire contact:', data);
  
  // Simuler un délai
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simuler succès
  return { success: true };
}