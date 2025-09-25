export default function CallToAction() {
  const handleDonationClick = () => {
    const donationSection = document.getElementById('donation-packs');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="text-center mb-16">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
        <h3 className="text-3xl font-bold mb-4">Commencez à Faire la Différence Aujourd&apos;hui</h3>
        <p className="text-xl mb-8">
          Rejoignez des milliers de supporters qui aident les enfants africains à réaliser leurs rêves de football
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleDonationClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition flex items-center justify-center"
          >
            <span className="mr-2 text-red-500" aria-hidden="true">❤️</span>
            Faire un Don
          </button>
          {/* <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition flex items-center justify-center">
            <span className="mr-2" aria-hidden="true">⬇️</span>
            Télécharger l&apos;App
          </button> */}
        </div>
      </div>
    </section>
  );
}
