import { useState, useEffect, useRef } from 'react';

interface ResourceItemProps {
  type: string;
  amount: number;
  icon: string;
  lastChange: number;
  hasBonus: boolean;
}

export const ResourceItem = ({ type, amount, icon, lastChange, hasBonus }: ResourceItemProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(amount);
  const animationValueRef = useRef(0);
  
  // Effect to update the state when amount prop changes
  useEffect(() => {
    setCurrentAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (lastChange > 0) {
      animationValueRef.current = lastChange;
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        animationValueRef.current = 0;
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [lastChange]);

  return (
    <div className="relative flex flex-col justify-center items-center gap-2 p-1 bg-gray-600 rounded-md overflow-hidden">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-green-300">{currentAmount}</span>
      {hasBonus && <span className="text-green-400 font-bold ml-1 text-sm">+</span>}
      {showAnimation && animationValueRef.current > 0 && (
        <span className="absolute text-green-400 font-bold text-xl opacity-0 animate-resource-gain">
          +{animationValueRef.current}
        </span>
      )}
    </div>
  );
};