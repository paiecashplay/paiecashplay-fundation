// components/ChildrenSupported.jsx
import { faAppleAlt, faIdCard, faTshirt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function ChildrenSupported() {
  const children = [
    {
      id: 'amina',
      name: 'Amina',
      age: 12,
      city: 'Lagos, Nigeria',
      emoji: '👧🏿',
      bgGradient: 'from-pink-100 to-purple-100',
      icon: faIdCard,
      iconColor: 'text-blue-600',
      title: 'Du Rêve à la Réalité',
      quote:
        "Grâce au pack License & Dream, je peux maintenant m'entraîner avec le club local et rêver de jouer professionnellement un jour !",
      supportersCount: 25,
      supportersColorBg: 'bg-blue-100',
      supportersColorText: 'text-blue-600',
    },
    {
      id: 'kwame',
      name: 'Kwame',
      age: 14,
      city: 'Accra, Ghana',
      emoji: '👦🏿',
      bgGradient: 'from-orange-100 to-red-100',
      icon: faTshirt,
      iconColor: 'text-orange-600',
      title: 'Nouvel Équipement, Nouvelle Confiance',
      quote:
        "Mes nouvelles chaussures et mon uniforme me font me sentir comme un vrai champion. Merci de croire en moi !",
      supportersCount: 18,
      supportersColorBg: 'bg-orange-100',
      supportersColorText: 'text-orange-600',
    },
    {
      id: 'fatima',
      name: 'Fatima',
      age: 13,
      city: 'Dakar, Sénégal',
      emoji: '👧🏿',
      bgGradient: 'from-green-100 to-teal-100',
      icon: faAppleAlt,
      iconColor: 'text-green-600',
      title: 'Plus Forte Chaque Jour',
      quote:
        "Le programme de nutrition quotidienne m'aide à m'entraîner plus dur et jouer mieux. J'ai tellement plus d'énergie maintenant !",
      supportersCount: 32,
      supportersColorBg: 'bg-green-100',
      supportersColorText: 'text-green-600',
    },
  ];

  return (
    <section className="mb-16">
      <h3 className="text-3xl font-bold text-center mb-4">Visages de l&apos;Avenir</h3>
      <p className="text-lg text-gray-600 text-center mb-12">
        Rencontrez les enfants dont vous transformez la vie
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {children.map((child) => (
          <div key={child.id} className="child-card rounded-lg shadow overflow-hidden">
            <div
              className={`bg-gradient-to-br ${child.bgGradient} h-48 flex items-center justify-center`}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{backgroundColor: child.bgGradient.includes('pink') ? '#f9a8d4' : child.bgGradient.includes('orange') ? '#fb923c' : '#4ade80'}}>
                {/* On adapte la couleur en dur pour le cercle emoji */}
                <span className="text-2xl">{child.emoji}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">
                    {child.name}, {child.age} ans
                  </h4>
                  <p className="text-gray-600">{child.city}</p>
                </div>
                <div className={child.iconColor}>
                  <FontAwesomeIcon icon={child.icon} />
                </div>
              </div>
              <h5 className="font-bold mb-2">{child.title}</h5>
              <p className="text-gray-700 text-sm mb-4">{child.quote}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Soutenue{child.supportersCount > 1 ? 's' : ''} par:</span>
                <span
                  className={`${child.supportersColorBg} ${child.supportersColorText} px-3 py-1 rounded-full text-xs`}
                >
                  {child.supportersCount} donateur{child.supportersCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
