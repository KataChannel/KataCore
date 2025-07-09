import type { GameResources } from '../../types/game.types';
import { RESOURCE_ICONS, RESOURCE_TYPES } from '../../constants/game.constants';
import { ResourceItem } from '../UI/ResourceItem';

interface ResourcePanelProps {
  resources: GameResources;
  animatedResourceChanges: Record<string, number>;
  activeSpiritBeastBonuses: Record<string, number>;
}

export const ResourcePanel = ({ 
  resources, 
  animatedResourceChanges, 
  activeSpiritBeastBonuses 
}: ResourcePanelProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Resources</h2>
      <div className="grid grid-cols-5 gap-2">
        {RESOURCE_TYPES.map(resourceType => (
          <ResourceItem
            key={resourceType}
            type={resourceType}
            amount={resources[resourceType]}
            icon={RESOURCE_ICONS[resourceType]}
            lastChange={animatedResourceChanges[resourceType] || 0}
            hasBonus={!!activeSpiritBeastBonuses[resourceType]}
          />
        ))}
      </div>
    </div>
  );
};