// components/RecentUpdatesAndSocial.jsx
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBus, faIdCard, faPaperPlane, faTshirt } from "@fortawesome/free-solid-svg-icons";


export default function RecentUpdatesAndSocial() {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: "Sarah M.", text: "Qui vient au match ce soir ? 🔥", user: false },
    { id: 2, author: null, text: "J'ai mes billets ! Allez Paris ! ⚽", user: true },
    { id: 3, author: "Mike R.", text: "J'ai fait un don pour Amina aujourd'hui 💙", user: false },
    { id: 4, author: "Community Bot", text: "🎉 Nouveau défi: Équipons 10 enfants cette semaine !", user: false },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;
    setChatMessages([...chatMessages, { id: Date.now(), author: null, text: inputMessage, user: true }]);
    setInputMessage("");
  };

  return (
    <>
      {/* Recent Updates Feed */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Mises à Jour d'Impact Récentes</h3>
        <p className="text-lg text-gray-600 text-center mb-12">Les dernières nouvelles de nos projets</p>

        <div className="space-y-4 max-w-3xl mx-auto">
          <FeedCard
            bgColor="bg-orange-100"
            icon={faTshirt}
            iconColor="text-orange-600"
            title="Équipement livré à 25 enfants à Lagos"
            timeAgo="il y a 2h"
            description="Champion Equipment Pack"
            thanks="Merci, John D. !"
            thanksColor="text-orange-600"
          />
          <FeedCard
            bgColor="bg-blue-100"
            icon={faIdCard}
            iconColor="text-blue-600"
            title="15 nouveaux enfants inscrits pour la saison sportive"
            timeAgo="il y a 5h"
            description="License & Dream Pack"
            thanks="Merci à notre communauté !"
            thanksColor="text-blue-600"
          />
          <FeedCard
            bgColor="bg-purple-100"
            icon={faBus}
            iconColor="text-purple-600"
            title="L'équipe d'Accra a participé au tournoi régional"
            timeAgo="il y a 1 jour"
            description="Talent Journey Pack"
            thanks="Support incroyable !"
            thanksColor="text-purple-600"
          />
        </div>
      </section>

      {/* Social Features Section */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Fonctionnalités Réseau Social</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Connectez-vous avec la communauté sportive solidaire
        </p>

        <div className="grid lg:grid-cols-2 gap-8 ">
          {/* Chat Example */}
          <div className="bg-white p-6 rounded-xl shadow-lg ">
            <h4 className="text-xl font-bold mb-4">Chat Communauté Paris FC</h4>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto ">
              {chatMessages.map(({ id, author, text, user }) => (
                <div
                  key={id}
                  className={`chat-bubble rounded-lg p-3 ${
                    user ? "user" : ""
                  } `}
                  style={{ wordBreak: "break-word" }}
                >
                  {!user && author && <div className="font-medium text-sm mb-1">{author}</div>}
                  <div className="text-sm">{text}</div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-auto">
              <input
                type="text"
                placeholder="Tapez votre message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg "
                aria-label="Envoyer message"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {/* <span className="ml-2">Envoyer</span> */}
              </button>
            </div>
          </div>

          {/* Gamification */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h4 className="text-xl font-bold mb-4">Votre Progression</h4>
            <div className="space-y-4">
              <ProgressItem
                icon="⭐"
                iconBg="bg-yellow-100 text-yellow-600"
                title="Points de Générosité"
                subtitle="1,250 points"
                score="⭐"
                scoreColor="text-yellow-600"
              />
              <ProgressItem
                icon="❤️"
                iconBg="bg-blue-100 text-blue-600"
                title="Champion des Enfants"
                subtitle="Badge débloqué"
                score="🏆"
                scoreColor=""
              />
              <ProgressItem
                icon="👥"
                iconBg="bg-green-100 text-green-600"
                title="Rang Communauté"
                subtitle="#23 sur 892 donateurs"
                score="🥉"
                scoreColor=""
              />
              <div className="mt-6">
                <div className="text-sm text-gray-600 mb-2">Prochain niveau: Héros Argent</div>
                <div className="progress-bar bg-gray-200 rounded-full h-4">
                  <div
                    className="progress-fill bg-yellow-500 h-4 rounded-full"
                    style={{ width: "68%" }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">320 points manquants</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Sous-composant pour les cartes du feed
type FeedCardProps = {
  bgColor: string;
  icon: IconProp;
  iconColor: string;
  title: string;
  timeAgo: string;
  description: string;
  thanks: string;
  thanksColor: string;
};

function FeedCard({
  bgColor,
  icon,
  iconColor,
  title,
  timeAgo,
  description,
  thanks,
  thanksColor,
}: FeedCardProps) {
  return (
    <div className="feed-card p-6 border border-gray-100 rounded-lg shadow-sm">
      <div className="flex items-start space-x-4">
        <div className={`${bgColor} rounded-full w-12 h-12 flex items-center justify-center text-2xl`}>
          {/* <span className={iconColor}>{icon}</span> */}
            <FontAwesomeIcon icon={icon} className={iconColor}/>

        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">{title}</h4>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-gray-700 mb-2">{description}</p>
          <p className={`${thanksColor} font-medium`}>{thanks}</p>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les items de progression
type ProgressItemProps = {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  score: string;
  scoreColor: string;
};

function ProgressItem({ icon, iconBg, title, subtitle, score, scoreColor }: ProgressItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${iconBg}`}>
          {icon}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-600">{subtitle}</div>
        </div>
      </div>
      <div className={`text-2xl ${scoreColor}`}>{score}</div>
    </div>
  );
}
