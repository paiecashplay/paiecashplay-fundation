import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const licenseId = params.id;

    const license = await prisma.licence.findUnique({
      where: { id: licenseId },
      include: { pack: true }
    });

    if (!license) {
      return NextResponse.json({ error: 'Licence non trouvée' }, { status: 404 });
    }

    // Générer le contenu HTML pour le PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; color: #4FBA73; margin-bottom: 40px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #4FBA73; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LICENCE SPORTIVE</h1>
          <h3>PaieCashPlay Foundation</h3>
        </div>
        
        <div class="section">
          <div class="label">Numéro de licence:</div>
          <div>${license.numero_licence}</div>
        </div>
        
        <div class="section">
          <div class="label">INFORMATIONS DU JOUEUR</div>
          <div>Nom: ${license.joueur_nom}</div>
          <div>Prénom: ${license.joueur_prenom}</div>
        </div>
        
        <div class="section">
          <div class="label">INFORMATIONS DU CLUB</div>
          <div>Club: ${license.club_nom}</div>
        </div>
        
        <div class="section">
          <div class="label">DÉTAILS DE LA LICENCE</div>
          <div>Pack: ${license.pack.nom}</div>
          <div>Montant payé: ${license.montant_paye}€</div>
          <div>Saison: ${license.saison}</div>
          <div>Date d'émission: ${license.date_emission.toLocaleDateString('fr-FR')}</div>
          <div>Date d'expiration: ${license.date_expiration.toLocaleDateString('fr-FR')}</div>
          <div>Statut: ${license.statut}</div>
        </div>
        
        <div class="footer">
          <p>Cette licence est valide uniquement pour la saison et le club mentionnés.</p>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="licence-${license.numero_licence}.html"`
      }
    });
  } catch (error) {
    console.error('Erreur génération licence:', error);
    return NextResponse.json({ error: 'Erreur génération licence' }, { status: 500 });
  }
}