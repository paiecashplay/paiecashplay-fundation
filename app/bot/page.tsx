'use client';

import { Header } from '@/components/layout/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useContactModal } from '@/hooks/useContactModal';

export default function Bot() {
  const { onOpen } = useContactModal();
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="max-w-[798px] mx-auto text-center lg:text-left">
              <h1 className="mb-6 md:mb-8">
                <span className="text-[#2fae43] marko-one">PaieCash</span>
                <span className="text-[#006a36] marko-one">Bot</span>
                <span className="text-[#006a36] marko-one"> : </span>
                <span className="text-[#352e2e] marko-one">Réinventez l'expérience de vos fans avec un Agent alimenté par l'IA</span>
              </h1>
              <h2 className="text-[#373639] text-xl md:text-2xl font-semibold mb-4 md:mb-6">
                Une Valeur Ajoutée Inestimable pour Votre Club
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Avec PaieCashBot, transformez la manière dont vos fans interagissent avec votre club. 
                Disponible 24h/24 et 7j/7, cet agent virtuel alimenté par l'intelligence artificielle 
                offre des réponses personnalisées à toutes leurs questions. Que ce soit pour la billetterie, 
                les prochains matchs, le classement du club, ou la boutique en ligne, PaieCashBot assure 
                une expérience utilisateur révolutionnaire tout en soulageant votre équipe des tâches répétitives.
              </p>
            </div>

            {/* Right Image */}
            <div className="relative flex justify-center items-center">
              <div className="w-full max-w-[622px] h-auto md:h-[622px] flex items-center justify-center">
                <Image
                  src="/bot/chatbotIcon.jpg"
                  alt="PaieCash Bot Icon"
                  width={400}
                  height={400}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose PaieCashBot Section */}
        <section className="container mx-auto px-4 py-12 md:py-24 bg-[#006A36]/10">
          {/* Title */}
          <div className="text-center mb-8 md:mb-16">
            <h2 className="marko-one">
              <span className="text-[#180808]">Pourquoi choisir </span>
              <span className="text-[#2fae43]">PaieCash</span>
              <span className="text-[#006A36]">Bot</span>
              <span className="text-[#006A36]"> ?</span>
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative h-[180px] md:h-[240px] mb-6">
                <Image
                  src="/bot/disp 24h24.jpg"
                  alt="Disponibilite 24h/24"
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <h3 className="text-center text-lg md:text-xl font-bold font-['Noto Sans'] mb-4">
                Disponibilité 24h/24 et 7j/7
              </h3>
              <p className="text-[#373639] text-base md:text-lg font-medium font-['Noto Sans']">
                Vos fans obtiennent des réponses instantanées, à tout moment, sans attendre.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative h-[180px] md:h-[240px] mb-6">
                <Image
                  src="/bot/interaction.jpg"
                  alt="Interaction"
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <h3 className="text-center text-lg md:text-xl font-bold font-['Noto Sans'] mb-4">
                Interactions personnalisées
              </h3>
              <p className="text-[#373639] text-base md:text-lg font-medium font-['Noto Sans']">
               L'agent virtuel s'adapte à chaque supporter, offrant des informations ciblées en fonction de leurs besoins.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative h-[180px] md:h-[240px] mb-6">
                <Image
                  src="/bot/service polyvalent.jpg"
                  alt="Polyvalence"
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <h3 className="text-center text-lg md:text-xl font-bold font-['Noto Sans'] mb-4">
                Un service polyvalent
              </h3>
              <p className="text-[#373639] text-base md:text-lg font-medium font-['Noto Sans']">
                De la billetterie au classement en passant par les produits disponibles en boutique, PaieCashBot couvre tous les aspects de la relation supporter.
              </p>
            </div>
            
            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative h-[180px] md:h-[240px] mb-6">
                <Image
                  src="/bot/engagement fans.jpg"
                  alt="Engagement"
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <h3 className="text-center text-lg md:text-xl font-bold font-['Noto Sans'] mb-4">
                Amélioration de l'engagement des Fans
              </h3>
              <p className="text-[#373639] text-base md:text-lg font-medium font-['Noto Sans']">
               Une réponse rapide et précise renforce leur lien avec votre club.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative h-[180px] md:h-[240px] mb-6">
                <Image
                  src="/bot/reduction couts.jpg"
                  alt="Reduction couts"
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <h3 className="text-center text-lg md:text-xl font-bold font-['Noto Sans'] mb-4">
               Réduction des charges opérationnelles
              </h3>
              <p className="text-[#373639] text-base md:text-lg font-medium font-['Noto Sans']">
                Automatisez les tâches courantes et concentrez vos ressources sur d'autres priorités.
              </p>
            </div>
          </div>
        </section>

        {/* Ce que PaieCashBot peut faire Section */}
        <section className="container mx-auto px-4 py-12 md:py-24">
          {/* Title */}
          <div className="w-full text-center mb-8 md:mb-16">
            <h2 className="marko-one">
              <span className="text-[#180808]">Ce que </span>
              <span className="text-[#2fae43]">PaieCash</span>
              <span className="text-[#006a36]">Bot</span>
              <span className="text-[#bc7af9]"> </span>
              <span className="text-[#180808]">peut faire</span>
            </h2>
          </div>

          <div className="relative max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-[392px_582px_392px] gap-8 items-center justify-center">
              {/* Left Column */}
              <div className="space-y-8 md:space-y-32">
                {/* Billeterie Card */}
                <div className="relative">
                  <div className="rounded-[10px] border-2 border-dashed border-[#006a36] p-6">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[372px] bg-[#006a36] rounded-[10px] p-2">
                      <div className="text-center text-white text-lg md:text-xl font-semibold font-['Open Sans'] leading-snug">
                        Billeterie
                      </div>
                    </div>
                    <div className="mt-6 text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                      Informations sur les matchs à venir, réservations et disponibilités des places, ainsi que la gestion des abonnements
                    </div>
                  </div>
                </div>

                {/* Boutique en Ligne Card */}
                <div className="relative">
                  <div className="rounded-[10px] border-2 border-dashed border-[#006a36] p-6">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[372px] bg-[#006a36] rounded-[10px] p-2">
                      <div className="text-center text-white text-lg md:text-xl font-semibold font-['Open Sans'] leading-snug">
                        Boutique en Ligne
                      </div>
                    </div>
                    <div className="mt-6 text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                      Grâce à nos agents, vos fans auront toutes les informations sur les produits vendus et réponses aux questions sur les commandes, disponibilités et promotions.
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column - Robot Image */}
              <div className="w-full max-w-[582px] h-auto md:h-[651px] flex justify-center">
                <Image
                  src="/bot/robot.png"
                  alt="PaieCash Bot Features"
                  width={582}
                  height={651}
                  className="object-contain"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-8 md:space-y-32">
                {/* Classement et Statistiques Card */}
                <div className="relative">
                  <div className="rounded-[10px] border-2 border-dashed border-[#006a36] p-6">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[372px] bg-[#006a36] rounded-[10px] p-2">
                      <div className="text-center text-white text-lg md:text-xl font-semibold font-['Open Sans'] leading-snug">
                        Classement et Statistiques
                      </div>
                    </div>
                    <div className="mt-6 text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                      Permettez à vos fans de se tenir informés sur la position du club, les scores et les performances de l'équipe.
                    </div>
                  </div>
                </div>

                {/* Actualités du Club Card */}
                <div className="relative">
                  <div className="rounded-[10px] border-2 border-dashed border-[#006a36] p-6">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[372px] bg-[#006a36] rounded-[10px] p-2">
                      <div className="text-center text-white text-lg md:text-xl font-semibold font-['Open Sans'] leading-snug">
                        Actualités du Club
                      </div>
                    </div>
                    <div className="mt-6 text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                      Informez vos supporters sur les transferts, les événements, et les dernières nouvelles de la vie du club.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-12 md:py-24 relative">
          {/* Decorative Circles */}
          <div className="absolute left-0 top-0 w-[150px] h-[150px] md:w-[336px] md:h-[337px] bg-[#006a36]/20 rounded-full" />
          <div className="absolute right-0 bottom-0 w-[150px] h-[150px] md:w-[336px] md:h-[337px] bg-[#006a36]/20 rounded-full" />
          
          {/* Title and Description */}
          <div className="text-center mb-8 md:mb-16 relative z-10">
            <h2 className="marko-one text-3xl md:text-[50px] leading-tight md:leading-[55px] mb-4 md:mb-8">
              Formules et Tarifs
            </h2>
            <p className="max-w-[1200px] mx-auto text-base md:text-xl text-[#373639] font-['Noto Sans'] font-medium">
              Nous proposons des formules adaptées aux besoins et budgets de chaque club, avec un retour sur investissement garanti grâce à l'amélioration de l'engagement des fans et à l'optimisation des ressources.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {/* Essential Plan */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg transition-transform duration-300 hover:scale-105">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-[#2fae43] text-3xl md:text-4xl font-bold mb-2">500€</h3>
                <span className="text-gray-600">/mois</span>
                <h4 className="text-xl md:text-2xl font-bold mt-4">Essentielle</h4>
              </div>
              
              <div className="space-y-4 mb-6 md:mb-8">
                <p className="text-gray-600 mb-4">Fonctionnalités incluses :</p>
                <div className="space-y-3">
                  {[
                    'Assistance billeterie',
                    'Informations sur les matchs et le classement',
                    'Support basique pour la boutique en ligne',
                    'Accès à un tableau de base pour suivre les intéraction'
                  ].map((feature) => (
                    <div key={feature} className="flex items-start">
                      <svg className="w-5 h-5 text-[#2fae43] mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[#373639]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Link
                href="/contact"
                className="block w-full py-3 px-6 text-center text-white bg-[#2fae43] rounded-full hover:bg-[#006a36] transition-colors duration-300"
              >
                Démarrer
              </Link>
            </div>

            {/* Advanced Plan */}
            <div className="bg-[#2fae43] rounded-2xl p-6 md:p-8 shadow-lg transform md:translate-y-[-1rem] transition-transform duration-300 hover:scale-105 relative">
              <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-white text-[#2fae43] px-4 py-1 rounded-full text-sm font-semibold">
                LE PLUS POPULAIRE
              </div>
              
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-white text-3xl md:text-4xl font-bold mb-2">1 000€</h3>
                <span className="text-white/80">/mois</span>
                <h4 className="text-xl md:text-2xl font-bold mt-4 text-white">Avancée</h4>
              </div>
              
              <div className="space-y-4 mb-6 md:mb-8">
                <p className="text-white mb-4">Fonctionnalités incluses :</p>
                <div className="space-y-3">
                  {[
                    'Toutes les fonctionnalités de la formule Essentielle',
                    'Personnalisation aux couleurs du club',
                    'Intégration à vos réseaux sociaux',
                    'Statistiques détaillées sur les ineractions et engagements'
                  ].map((feature) => (
                    <div key={feature} className="flex items-start">
                      <svg className="w-5 h-5 text-white mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Link
                href="/contact"
                className="block w-full py-3 px-6 text-center text-[#2fae43] bg-white rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                Démarrer
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg transition-transform duration-300 hover:scale-105">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-[#2fae43] text-3xl md:text-4xl font-bold mb-2">2 000€</h3>
                <span className="text-gray-600">/mois</span>
                <h4 className="text-xl md:text-2xl font-bold mt-4">Premium</h4>
              </div>
              
              <div className="space-y-4 mb-6 md:mb-8">
                <p className="text-gray-600 mb-4">Fonctionnalités incluses :</p>
                <div className="space-y-3">
                  {[
                    'Toutes les fonctionnalités des formules précédentes',
                    'Back-office complet pour suivre les performances en temps réel',
                    'Analyse prédictive des comportements des fans',
                    'Assistance prioritaire et support dédié'
                  ].map((feature) => (
                    <div key={feature} className="flex items-start">
                      <svg className="w-5 h-5 text-[#2fae43] mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[#373639]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Link
                href="/contact"
                className="block w-full py-3 px-6 text-center text-white bg-[#2fae43] rounded-full hover:bg-[#006a36] transition-colors duration-300"
              >
                Démarrer
              </Link>
            </div>
          </div>
        </section>
        
         {/* How it works Section */}
        <section className="container mx-auto px-4 py-12 md:py-24 relative min-h-0 md:min-h-screen flex flex-col mb-8 md:mb-24">
          {/* Decorative Circles */}
          <div className="absolute left-0 top-0 w-[150px] h-[150px] md:w-[273px] md:h-[274px] bg-[#006a36]/20 rounded-full" />
          <div className="absolute right-0 bottom-0 w-[150px] h-[150px] md:w-[273px] md:h-[274px] bg-[#006a36]/20 rounded-full" />
          
          {/* Title */}
          <div className="text-center mb-8 md:mb-16">
            <h2 className="marko-one">
              <span className="text-[#1809099]">Comment mettre en place </span>
               <span className="text-[#2fae43]">PaieCash</span>
              <span className="text-[#006a36]">Bot ?</span>
            </h2>
          </div>

          {/* Steps Grid with exact specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* Step 1 */}
            <div className="w-full max-w-[550px] px-4 md:px-[39px] py-6 md:py-[109px] bg-[#006A36]/20 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] justify-center items-center inline-flex overflow-hidden">
              <div className="self-stretch flex-col justify-start items-start gap-4 md:gap-[30px] inline-flex">
                <div className="w-full max-w-[445px]">
                  <span className="text-[#006A36] text-xl md:text-3xl font-bold font-['Noto Sans'] leading-normal md:leading-[33px]">Contactez-nous </span>
                </div>
                <div className="w-full max-w-[472px] text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                  Nous évaluons vos besoins et déterminons la formule qui convient le mieux à votre club.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="w-full max-w-[550px] px-4 md:px-[39px] py-6 md:py-[109px] bg-[#006A36]/20 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] justify-center items-center inline-flex overflow-hidden md:translate-y-12">
              <div className="self-stretch flex-col justify-start items-start gap-4 md:gap-[30px] inline-flex">
                <div className="w-full max-w-[445px]">
                  <span className="text-[#006A36] text-xl md:text-3xl font-bold font-['Noto Sans'] leading-normal md:leading-[33px]">Personnalisation </span>
                </div>
                <div className="w-full max-w-[472px] text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                  PaieCashBot est configuré aux couleurs, logos et préférences de votre club.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="w-full max-w-[550px] px-4 md:px-[39px] py-6 md:py-[109px] bg-[#006A36]/20 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] justify-center items-center inline-flex overflow-hidden md:translate-y-12">
              <div className="self-stretch flex-col justify-start items-start gap-4 md:gap-[30px] inline-flex">
                <div className="w-full max-w-[445px]">
                  <span className="text-[#006A36] text-xl md:text-3xl font-bold font-['Noto Sans'] leading-normal md:leading-[33px]">Lancement </span>
                </div>
                <div className="w-full max-w-[472px] text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                 Nous intégrons l'agent sur vos plateformes digitales (site web, applications, messageries).
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="w-full max-w-[550px] px-4 md:px-[39px] py-6 md:py-[109px] bg-[#006A36]/20 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] justify-center items-center inline-flex overflow-hidden md:translate-y-24">
              <div className="self-stretch flex-col justify-start items-start gap-4 md:gap-[30px] inline-flex">
                <div className="w-full max-w-[445px]">
                  <span className="text-[#006A36] text-xl md:text-3xl font-bold font-['Noto Sans'] leading-normal md:leading-[33px]">Support continu</span>
                </div>
                <div className="w-full max-w-[472px] text-[#373639] text-base md:text-xl font-medium font-['Noto Sans']">
                  Notre équipe reste à vos côtés pour assurer un fonctionnement optimal.
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Final Call-to-Action Section */}
        <section className="container mx-auto px-4 py-12 md:py-24 bg-[#006A36]/20">
          {/* Revolution Title */}
          <div className="marko-one">
            <h2 className="text-center font-bold text-3xl md:text-[50px] leading-tight md:leading-[55px]">
              <span className="text-[#352e2e]">Rejoignez la révolution </span>
              <span className="text-[#2fae43]">PaieCash</span>
              <span className="text-[#006A36]">Bot</span>
            </h2>
          </div>

          {/* Integrated Title Container */}
          <div className="pl-4 md:pl-[140px] pt-8 md:pt-[105px]">
            <div className="w-full max-w-[719px] rounded-[30px] border-2 border-[#006A36] p-4 md:p-8 mb-6 md:mb-8">
              <div className="text-[#006A36] text-3xl md:text-[70px] font-bold font-['Paytone One'] leading-tight md:leading-[57px] text-center">
                Intégré à votre site
              </div>
            </div>

            {/* Description Text */}
            <div className="w-full max-w-[719px] text-[#00000] text-xl md:text-2xl font-semibold font-['Open Sans'] mb-6 md:mb-8">
             Ne laissez plus vos fans attendre. Avec PaieCashBot, offrez-leur une expérience connectée, fluide et immersive tout en augmentant la valeur ajoutée de votre club.
            </div>

            {/* Contact Text */}
            <div className="w-full max-w-[481px] text-[#006A36] text-2xl md:text-3xl font-semibold font-['Open Sans'] mb-6 md:mb-8">
             Contactez-nous dès aujourd'hui pour discuter de vos besoins et choisir la formule adaptée à votre club !
            </div>

            {/* Contact Button */}
             <button
              onClick={onOpen}
             className="w-[250px] h-[52px] bg-[#006A36] rounded-[10px] flex justify-center items-center hover:bg-[#2fae43] transition-colors duration-200"
              >
              <span className="text-white text-[19px] font-bold font-['Open Sans'] leading-loose">
              Contactez-nous
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}