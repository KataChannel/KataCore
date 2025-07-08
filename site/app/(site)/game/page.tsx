// pages/Game1.js
'use client';
import { useGame } from './hooks/useGame';
import { GameLayout } from './components/GameLayout';
import { NotificationSystem } from './components/UI/NotificationSystem';
import { useEffect, useState } from 'react';
export default function GamePage() {
  const {
    gameState,
    notifications,
    setNotifications,
    logs,
    isAutoHarvesting,
    animatedResourceChanges,
    activeSpiritBeastBonuses,
    actions,
  } = useGame();
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
      setIsClient(true);
    }, []);
  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4 font-inter">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");
          body {
            font-family: "Inter", sans-serif;
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes resource-gain {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            20% {
              transform: translateY(-15px);
              opacity: 1;
            }
            80% {
              transform: translateY(-25px);
              opacity: 0.5;
            }
            100% {
              transform: translateY(-30px);
              opacity: 0;
            }
          }
          .animate-resource-gain {
            animation: resource-gain 0.7s ease-out forwards;
          }
        `}</style>
        
        <h1 className="text-5xl font-extrabold mb-4 text-yellow-500 drop-shadow-lg text-center">
          Five Elements Exploration
        </h1>
        
        <GameLayout
          gameState={gameState}
          logs={logs}
          isAutoHarvesting={isAutoHarvesting}
          animatedResourceChanges={animatedResourceChanges}
          activeSpiritBeastBonuses={activeSpiritBeastBonuses}
          actions={actions}
        />
      </div>
      
      <NotificationSystem 
        notifications={notifications} 
        setNotifications={setNotifications} 
      />
    </>
  );
}