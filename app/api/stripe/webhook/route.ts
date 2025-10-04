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

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const {
      donationType,
      packName,
      childId,
      childName,
      isAnonymous,
      donorId
    } = session.metadata!;

    const montant = session.amount_total! / 100;
    const joueurOAuthId = childId;
    const isAnon = isAnonymous === 'true';
    
    // Trouver ou créer le joueur local
    let joueur = await prisma.joueur.findUnique({
      where: { oauth_id: joueurOAuthId }
    });
    
    if (!joueur) {
      // Créer le joueur s'il n'existe pas
      const childNameParts = childName.split(' ');
      joueur = await prisma.joueur.create({
        data: {
          oauth_id: joueurOAuthId,
          prenom: childNameParts[0] || 'Prénom',
          nom: childNameParts.slice(1).join(' ') || 'Nom',
          total_dons_recus: 0,
          nombre_donateurs: 0
        }
      });
    }
    
    const joueurId = joueur.id;

    // Récupérer les infos du donateur depuis Stripe
    let donateurEmail = null;
    let donateurNom = null;
    
    console.log('Session details:', {
      customer_details: session.customer_details,
      customer_email: session.customer_email,
      customer: session.customer,
      isAnon,
      donorId,
      metadata: session.metadata
    });
    
    // Essayer plusieurs sources pour l'email
    if (!isAnon) {
      donateurEmail = session.customer_details?.email || session.customer_email || null;
      donateurNom = session.customer_details?.name || null;
      
      // Si on a un customer ID, récupérer les infos depuis Stripe
      if (session.customer && typeof session.customer === 'string') {
        try {
          const customer = await stripe.customers.retrieve(session.customer);
          if (customer && !customer.deleted) {
            donateurEmail = donateurEmail || customer.email;
            donateurNom = donateurNom || customer.name;
          }
        } catch (error) {
          console.error('Error retrieving customer:', error);
        }
      }
    }

    // Gérer le parrainage
    let parrainId = null;
    if (!isAnon && donorId) {
      const parrain = await prisma.parrain.upsert({
        where: {
          donateur_id_joueur_id: {
            donateur_id: donorId,
            joueur_id: joueurId
          }
        },
        update: {
          total_donne: { increment: montant },
          nombre_dons: { increment: 1 },
          date_dernier_don: new Date(),
          donateur_email: donateurEmail || undefined,
          donateur_nom: donateurNom || undefined
        },
        create: {
          donateur_id: donorId,
          donateur_email: donateurEmail || '',
          donateur_nom: donateurNom,
          joueur_id: joueurId,
          total_donne: montant,
          nombre_dons: 1,
          is_anonymous: false
        }
      });
      parrainId = parrain.id;
    }

    // Créer la donation
    const donationData = {
      montant,
      type_recurrence: donationType,
      statut: 'completed',
      stripe_session_id: session.id,
      stripe_payment_id: session.payment_intent as string,
      donateur_id: isAnon ? null : donorId,
      donateur_email: donateurEmail,
      donateur_nom: donateurNom,
      joueur_id: joueurId,
      pack_nom: packName,
      is_anonymous: isAnon,
      parrain_id: parrainId,
      date_paiement: new Date()
    };
    
    console.log('Creating donation with data:', donationData);
    console.log('Parrain data:', {
      parrainId,
      donateurEmail,
      donateurNom,
      isAnon,
      donorId
    });
    
    const donation = await prisma.donation.create({
      data: donationData
    });

    // Mettre à jour les statistiques du joueur
    await prisma.joueur.update({
      where: { id: joueurId },
      data: {
        total_dons_recus: { increment: montant }
      }
    });
    
    // Recalculer le nombre exact de donateurs uniques
    const nombreDonateurUniques = await prisma.parrain.count({
      where: { joueur_id: joueurId }
    });
    
    await prisma.joueur.update({
      where: { id: joueurId },
      data: {
        nombre_donateurs: nombreDonateurUniques
      }
    });

    // Programmer les notifications email
    await scheduleEmailNotifications(donation.id, donateurEmail, joueurId, montant, packName, childName);

    console.log('Donation processed successfully:', donation.id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function scheduleEmailNotifications(donationId: string, donateurEmail: string | null, joueurId: number, montant: number, packName: string, childName: string) {
  try {
    const { generateThankYouEmail, generateAdminNotificationEmail, sendEmail } = await import('@/lib/email');
    const notifications = [];

    // Email de remerciement au donateur
    if (donateurEmail) {
      const emailContent = generateThankYouEmail('Cher donateur', montant, childName, packName);
      
      notifications.push({
        type: 'donation_thank_you',
        destinataire: donateurEmail,
        sujet: 'Merci pour votre don - PaieCashPlay',
        contenu: emailContent,
        donation_id: donationId
      });
    }

    // Récupérer les détails de la donation pour l'admin
    const donation = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (donation) {
      // Email de notification à l'administrateur
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
        type: donation.type_recurrence
      });

      notifications.push({
        type: 'admin_notification',
        destinataire: 'info@paiecashplay.com',
        sujet: `Nouvelle donation reçue - ${montant}€ pour ${childName}`,
        contenu: adminEmailContent,
        donation_id: donationId
      });
    }

    // Créer les notifications en base
    if (notifications.length > 0) {
      await prisma.notificationEmail.createMany({
        data: notifications
      });
      
      // Envoyer immédiatement les emails
      for (const notification of notifications) {
        await sendEmail(notification.destinataire, notification.sujet, notification.contenu);
      }
    }
  } catch (error) {
    console.error('Error scheduling email notifications:', error);
  }
}