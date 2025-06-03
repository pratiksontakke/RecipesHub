
import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Heart, Sparkles, Trophy } from 'lucide-react';

interface CelebrationAnimationProps {
  onComplete?: () => void;
}

export const CelebrationAnimation = ({ onComplete }: CelebrationAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const celebrations = [
    "🎉 Recipe Complete! 🎉",
    "✨ Delicious Creation! ✨",
    "🏆 Cooking Master! 🏆",
    "💫 Taste Perfection! 💫"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative">
        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-bounce bg-gradient-to-r ${
              i % 4 === 0 ? 'from-orange-400 to-red-500' :
              i % 4 === 1 ? 'from-yellow-400 to-orange-500' :
              i % 4 === 2 ? 'from-green-400 to-blue-500' :
              'from-purple-400 to-pink-500'
            }`}
            style={{
              left: `${Math.random() * 400 - 200}px`,
              top: `${Math.random() * 400 - 200}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}

        {/* Main celebration card */}
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-scale-in">
          {/* Trophy icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Celebration text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 animate-fade-in">
            {celebrations[Math.floor(Math.random() * celebrations.length)]}
          </h2>

          {/* Achievement message */}
          <p className="text-gray-600 mb-6 text-lg">
            You've successfully completed this recipe! 
            <br />
            Time to enjoy your delicious creation! 🍽️
          </p>

          {/* Floating icons */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="animate-bounce" style={{ animationDelay: '0s' }}>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.6s' }}>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          {/* Rating stars animation */}
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6 text-yellow-400 fill-current animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Click anywhere to continue...
          </p>
        </div>
      </div>
    </div>
  );
};
