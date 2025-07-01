# Guide pour la configuration des templates EmailJS

Pour utiliser EmailJS avec ce site, vous devez créer un compte sur [EmailJS](https://www.emailjs.com/) et configurer les templates suivants.

## 1. Créer un compte EmailJS

1. Rendez-vous sur [EmailJS](https://www.emailjs.com/) et créez un compte
2. Configurez un service email (Gmail, Outlook, SMTP personnalisé, etc.)

## 2. Configurer les templates

### Template de formulaire de contact

Créez un nouveau template avec l'ID `template_contact` contenant les variables suivantes :

```
from_name - Nom de l'expéditeur
from_email - Email de l'expéditeur
phone - Téléphone
company - Entreprise
source - Source (comment ils ont connu PaieCash)
solutions - Solutions souhaitées
message - Message
reply_to - Email pour la réponse
```

Exemple de contenu HTML pour le template de contact:

```html
<h1>Nouveau message de contact</h1>
<h2>Informations du contact</h2>
<ul>
  <li><strong>Nom et prénom :</strong> {{from_name}}</li>
  <li><strong>Email :</strong> {{from_email}}</li>
  <li><strong>Téléphone :</strong> {{phone}}</li>
  <li><strong>Entreprise :</strong> {{company}}</li>
  <li><strong>Source :</strong> {{source}}</li>
</ul>

<h2>Solutions souhaitées</h2>
<p>{{solutions}}</p>

<h2>Message</h2>
<p>{{message}}</p>

<p><em>Ce message a été envoyé depuis le formulaire de contact du site web PaieCash.</em></p>
```

### Template de newsletter

Créez un nouveau template avec l'ID `template_newsletter` contenant les variables suivantes :

```
subscriber_email - Email de l'abonné
subscription_date - Date d'inscription
```

Exemple de contenu HTML pour le template de newsletter:

```html
<h1>Nouvelle inscription à la newsletter</h1>
<p>Un utilisateur s'est inscrit à la newsletter avec l'adresse email suivante :</p>
<p><strong>{{subscriber_email}}</strong></p>
<p>Date d'inscription : {{subscription_date}}</p>
```

## 3. Configurer les variables d'environnement

Mettez à jour le fichier `.env.local` avec vos identifiants EmailJS :

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=votre_service_id
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_contact
NEXT_PUBLIC_EMAILJS_NEWSLETTER_TEMPLATE_ID=template_newsletter
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=votre_cle_publique
```

## 4. Tester les formulaires

Une fois la configuration terminée, testez le formulaire de contact et l'inscription à la newsletter pour vérifier que les emails sont bien envoyés.