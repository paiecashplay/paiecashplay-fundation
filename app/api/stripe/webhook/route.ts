import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`Webhook received: ${event.type} - ${event.id}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed: ${session.id}`);
        await handleSuccessfulPayment(session);
        console.log(`Successfully processed session: ${session.id}`);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ 
      received: true, 
      eventId: event.id, 
      eventType: event.type,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Webhook handler error for event ${event.id}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      eventType: event.type,
      eventId: event.id
    });
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        eventId: event.id,
        eventType: event.type,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const {
    donationType,
    packName,
    childId,
    childName,
    isAnonymous,
    donorId
  } = session.metadata!;

  // Validation des données essentielles
  if (!childId || !packName || !session.amount_total) {
    throw new Error(`Données essentielles manquantes: childId=${childId}, packName=${packName}, amount=${session.amount_total}`);
  }

  const montant = session.amount_total / 100;
  const joueurOAuthId = childId;
  const isAnon = isAnonymous === 'true';
  
  console.log('Webhook processing started:', {
    sessionId: session.id,
    metadata: session.metadata,
    customer_details: session.customer_details,
    amount: montant,
    isAnonymous: isAnon,
    timestamp: new Date().toISOString()
  });

  // Récupérer les infos du donateur depuis Stripe avec fallbacks
  let donateurEmail = session.customer_details?.email || session.customer_email || null;
  let donateurNom = session.customer_details?.name || null;
  
  // Si on a un customer ID, récupérer les infos depuis Stripe
  if (session.customer && typeof session.customer === 'string') {
    try {
      const customer = await stripe.customers.retrieve(session.customer) as Stripe.Customer;
      if (customer && !customer.deleted) {
        donateurEmail = donateurEmail || customer.email;
        donateurNom = donateurNom || customer.name || null;
      }
    } catch (error) {
      console.error('Error retrieving customer:', error);
    }
  }

  // Fallbacks pour données donateur
  const finalDonateurId = donorId || `anonymous_${session.id}`;
  const finalDonateurEmail = donateurEmail || `${finalDonateurId}@anonymous.paiecashplay.com`;
  const finalDonateurNom = donateurNom || (isAnon ? 'Donateur Anonyme' : 'Donateur');

  console.log('Processed donor data:', {
    originalDonorId: donorId,
    finalDonateurId,
    finalDonateurEmail,
    finalDonateurNom,
    isAnonymous: isAnon
  });

  // Utiliser une transaction pour garantir la cohérence
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Trouver ou créer le joueur local
      let joueur = await tx.joueur.findUnique({
        where: { oauth_id: joueurOAuthId }
      });
      
      if (!joueur) {
        const childNameParts = childName.split(' ');
        joueur = await tx.joueur.create({
          data: {
            oauth_id: joueurOAuthId,
            prenom: childNameParts[0] || 'Prénom',
            nom: childNameParts.slice(1).join(' ') || 'Nom',
            total_dons_recus: 0,
            nombre_donateurs: 0
          }
        });
        console.log('Created new joueur:', joueur.id);
      }
      
      const joueurId = joueur.id;

      // 2. Créer ou mettre à jour le parrain (TOUJOURS, même pour dons anonymes)
      const parrain = await tx.parrain.upsert({
        where: {
          donateur_id_joueur_id: {
            donateur_id: finalDonateurId,
            joueur_id: joueurId
          }
        },
        update: {
          total_donne: { increment: montant },
          nombre_dons: { increment: 1 },
          date_dernier_don: new Date(),
          donateur_email: finalDonateurEmail,
          donateur_nom: finalDonateurNom
        },
        create: {
          donateur_id: finalDonateurId,
          donateur_email: finalDonateurEmail,
          donateur_nom: finalDonateurNom,
          joueur_id: joueurId,
          total_donne: montant,
          nombre_dons: 1,
          is_anonymous: isAnon
        }
      });
      
      console.log('Upserted parrain:', {
        id: parrain.id,
        donateur_id: parrain.donateur_id,
        total_donne: Number(parrain.total_donne),
        nombre_dons: parrain.nombre_dons
      });

      // 3. Créer la donation
      const donation = await tx.donation.create({
        data: {
          montant,
          type_recurrence: donationType || 'Don unique',
          statut: 'completed',
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string,
          donateur_id: isAnon ? null : donorId,
          donateur_email: finalDonateurEmail,
          donateur_nom: finalDonateurNom,
          joueur_id: joueurId,
          pack_nom: packName,
          is_anonymous: isAnon,
          parrain_id: parrain.id,
          date_paiement: new Date()
        }
      });
      
      console.log('Created donation:', {
        id: donation.id,
        montant: Number(donation.montant),
        joueur_id: donation.joueur_id,
        parrain_id: donation.parrain_id
      });

      // 4. Mettre à jour les statistiques du joueur
      const updatedJoueur = await tx.joueur.update({
        where: { id: joueurId },
        data: {
          total_dons_recus: { increment: montant }
        }
      });
      
      // 5. Recalculer le nombre exact de parrains uniques
      const nombreParrainsUniques = await tx.parrain.count({
        where: { joueur_id: joueurId }
      });
      
      await tx.joueur.update({
        where: { id: joueurId },
        data: {
          nombre_donateurs: nombreParrainsUniques
        }
      });
      
      console.log('Updated joueur stats:', {
        joueur_id: joueurId,
        total_dons_recus: Number(updatedJoueur.total_dons_recus) + montant,
        nombre_parrains: nombreParrainsUniques
      });

      return { donation, parrain, joueur: updatedJoueur };
    });

    // 6. Programmer les notifications email (en dehors de la transaction)
    await scheduleEmailNotifications(
      result.donation.id, 
      finalDonateurEmail, 
      result.joueur.id, 
      montant, 
      packName, 
      childName
    );

    console.log('Donation processed successfully:', {
      donationId: result.donation.id,
      parrainId: result.parrain.id,
      joueurId: result.joueur.id,
      montant,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Error in transaction:', error);
    throw error;
  }
}

async function scheduleEmailNotifications(donationId: string, donateurEmail: string, joueurId: number, montant: number, packName: string, childName: string) {
  try {
    const { generateThankYouEmail, generatePlayerNotificationEmail, generateClubNotificationEmail, generateAdminNotificationEmail, sendEmail, getPlayerInfo, getClubInfo } = await import('@/lib/email');
    const notifications = [];

    // Récupérer les détails de la donation
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { joueur: true }
    });

    if (!donation) {
      console.error('Donation non trouvée pour les notifications:', donationId);
      return;
    }

    // Récupérer les infos du joueur depuis OAuth
    const playerInfo = donation.joueur.oauth_id ? await getPlayerInfo(donation.joueur.oauth_id) : null;
    let clubInfo = null;
    
    if (playerInfo?.club?.id) {
      clubInfo = await getClubInfo(playerInfo.club.id);
    }

    const donorName = donation.donateur_nom || 'Donateur';
    const isAnonymous = donation.is_anonymous;

    // 1. Email de remerciement au donateur (sauf si email anonyme généré)
    if (donateurEmail && !donateurEmail.includes('@anonymous.paiecashplay.com')) {
      const emailContent = generateThankYouEmail('Cher donateur', montant, childName, packName);
      
      notifications.push({
        type: 'donation_thank_you',
        destinataire: donateurEmail,
        sujet: 'Merci pour votre don - PaieCashPlay',
        contenu: emailContent,
        donation_id: donationId
      });
    }

    // 2. Email au joueur (si il a un email configuré)
    if (playerInfo?.email) {
      const playerEmailContent = generatePlayerNotificationEmail(
        childName,
        montant,
        donorName,
        packName,
        isAnonymous
      );
      
      notifications.push({
        type: 'player_notification',
        destinataire: playerInfo.email,
        sujet: `Nouveau don reçu - ${montant}€ - PaieCashPlay`,
        contenu: playerEmailContent,
        donation_id: donationId
      });
    }

    // 3. Email au club (si le joueur est attaché à un club avec email)
    if (clubInfo?.email && clubInfo?.name) {
      const clubEmailContent = generateClubNotificationEmail(
        clubInfo.name,
        childName,
        montant,
        donorName,
        packName,
        isAnonymous
      );
      
      notifications.push({
        type: 'club_notification',
        destinataire: clubInfo.email,
        sujet: `Nouveau don pour ${childName} - ${montant}€ - PaieCashPlay`,
        contenu: clubEmailContent,
        donation_id: donationId
      });
    }

    // 4. Email à l'administrateur
    const adminEmailContent = generateAdminNotificationEmail({
      donationId: donation.id,
      amount: Number(donation.montant),
      childName,
      packName: donation.pack_nom,
      donorEmail: donation.donateur_email,
      donorName: donation.donateur_nom,
      isAnonymous: donation.is_anonymous,
      stripeSessionId: donation.stripe_session_id || '',
      stripePaymentId: donation.stripe_payment_id || '',
      type: donation.type_recurrence,
      clubName: clubInfo?.name,
      playerEmail: playerInfo?.email,
      clubEmail: clubInfo?.email
    });

    notifications.push({
      type: 'admin_notification',
      destinataire: 'info@paiecashplay.com',
      sujet: `Nouvelle donation reçue - ${montant}€ pour ${childName}`,
      contenu: adminEmailContent,
      donation_id: donationId
    });

    // Créer les notifications en base
    if (notifications.length > 0) {
      await prisma.notificationEmail.createMany({
        data: notifications
      });
      
      console.log(`Created ${notifications.length} email notifications for donation ${donationId}:`);
      notifications.forEach(n => console.log(`- ${n.type} to ${n.destinataire}`));
      
      // Envoyer immédiatement les emails
      for (const notification of notifications) {
        try {
          await sendEmail(notification.destinataire, notification.sujet, notification.contenu);
          console.log(`✓ Email ${notification.type} sent to ${notification.destinataire}`);
        } catch (emailError) {
          console.error(`✗ Failed to send ${notification.type} email to ${notification.destinataire}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling email notifications:', error);
    // Ne pas faire échouer le webhook si les emails échouent
  }
}