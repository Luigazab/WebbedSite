import { Award, PartyPopper, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const BadgeEarnedModal = ({ isOpen, onClose, badge, tutorialTitle }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg border-4 border-yellow-400 drop-shadow-[12px_12px_0_rgba(0,0,0,1)] max-w-md w-full overflow-hidden transition-all duration-500 ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        {/* Confetti Background */}
        <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-8 text-center">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20 p-2 rounded-full transition z-10"
          >
            <X size={24} />
          </button>

          <div className="relative z-10">
            <div className={`inline-block mb-4 transition-all duration-700 ${animate ? 'rotate-0 scale-100' : 'rotate-180 scale-0'}`}>
              <PartyPopper size={64} className="text-white" />
            </div>

            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Congratulations!
            </h2>
            <p className="text-xl text-white/90 font-semibold">
              Tutorial Complete!
            </p>
          </div>
        </div>

        {/* Badge Display */}
        <div className="p-8 text-center">
          <div className={`inline-block mb-4 transition-all duration-700 delay-300 ${animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-yellow-600 shadow-lg">
              {badge?.icon_url ? (
                <img 
                  src={badge.icon_url} 
                  alt={badge.title}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <Award size={64} className="text-white" />
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {badge?.title || 'Achievement Unlocked!'}
          </h3>
          
          <p className="text-gray-600 mb-1">
            You've earned this badge for completing:
          </p>
          <p className="text-lg font-semibold text-purple-600 mb-4">
            "{tutorialTitle}"
          </p>

          {badge?.description && (
            <p className="text-sm text-gray-500 mb-6 italic">
              {badge.description}
            </p>
          )}

          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg border-2 border-black drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeEarnedModal;