import type { SpiritBeast, GameResources } from '../../types/game.types';

interface SpiritBeastPanelProps {
  spiritBeasts: Record<string, SpiritBeast>;
  resources: GameResources;
  unlockedTier2Upgrades: boolean;
}

export const SpiritBeastPanel = ({ spiritBeasts, resources, unlockedTier2Upgrades }: SpiritBeastPanelProps) => {
  const activeBeasts = Object.entries(spiritBeasts).filter(([_, beast]) => beast.isActive);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Spirit Beasts</h3>
      {activeBeasts.length === 0 ? (
        <p className="text-gray-400 text-sm">No spirit beasts activated yet...</p>
      ) : (
        activeBeasts.map(([beastId, beast]) => (
          <div key={beastId} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{beastId.replace('spirit_', '').replace('_', ' ')}</span>
              <span className="text-sm text-gray-400">Lv.{beast.level}</span>
            </div>
            <p className="text-xs text-green-400 mt-1">
              +{Math.round(beast.bonus * 100)}% bonus
            </p>
          </div>
        ))
      )}
    </div>
  );
};