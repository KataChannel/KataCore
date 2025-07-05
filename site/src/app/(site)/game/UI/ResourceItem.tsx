import React from 'react';
import { Resource } from '../types/game.types';

interface ResourceItemProps {
  resource: Resource;
  amount: number;
  showChange?: boolean;
  changeAmount?: number;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ 
  resource, 
  amount, 
  showChange = false, 
  changeAmount = 0 
}) => {
  // Icon mapping cho các loại resource
  const getResourceIcon = (resourceType: string) => {
    const icons = {
      wood: '🌲',
      stone: '🪨', 
      food: '🍖',
      water: '💧',
      metal: '⚔️',
      gem: '💎',
      energy: '⚡',
      gold: '🪙'
    };
    return icons[resourceType as keyof typeof icons] || '📦';
  };

  // Format số với dấu phẩy
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Tính phần trăm thay đổi
  const getChangePercentage = () => {
    if (amount === 0) return 0;
    return ((changeAmount / amount) * 100).toFixed(1);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Icon và tên resource */}
      <div className="flex items-center space-x-3">
        <span className="text-2xl" role="img" aria-label={resource.name}>
          {getResourceIcon(resource.type)}
        </span>
        <div>
          <h3 className="text-white font-medium">{resource.name}</h3>
          <p className="text-gray-400 text-sm">{resource.description}</p>
        </div>
      </div>

      {/* Số lượng và thống kê */}
      <div className="text-right">
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold text-lg">
            {formatNumber(amount)}
          </span>
          {resource.maxCapacity && (
            <span className="text-gray-400 text-sm">
              / {formatNumber(resource.maxCapacity)}
            </span>
          )}
        </div>
        
        {/* Hiển thị thay đổi nếu có */}
        {showChange && changeAmount !== 0 && (
          <div className={`text-sm flex items-center justify-end space-x-1 ${
            changeAmount > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{changeAmount > 0 ? '↗' : '↘'}</span>
            <span>
              {changeAmount > 0 ? '+' : ''}{formatNumber(changeAmount)} 
              ({getChangePercentage()}%)
            </span>
          </div>
        )}

        {/* Progress bar cho capacity nếu có */}
        {resource.maxCapacity && (
          <div className="mt-2 w-20">
            <div className="bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  (amount / resource.maxCapacity) > 0.8 ? 'bg-red-500' :
                  (amount / resource.maxCapacity) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((amount / resource.maxCapacity) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceItem;