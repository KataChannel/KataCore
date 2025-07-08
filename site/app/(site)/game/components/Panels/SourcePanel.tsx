import type { GameSource, GameResources } from '../../types/game.types';

interface SourcePanelProps {
  sources: Record<string, GameSource>;
  resources: GameResources;
  unlockedTier2Upgrades: boolean;
  onHarvestSource: (sourceId: string) => void;
}

export const SourcePanel = ({ sources, resources, unlockedTier2Upgrades, onHarvestSource }: SourcePanelProps) => {
  const activeSources = Object.entries(sources).filter(([_, source]) => source.isActive);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Active Sources</h3>
      {activeSources.length === 0 ? (
        <p className="text-gray-400 text-sm">No active sources yet...</p>
      ) : (
        activeSources.map(([sourceId, source]) => (
          <div key={sourceId} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{sourceId.replace('_', ' ')}</span>
              <span className="text-sm text-gray-400">Lv.{source.level}</span>
            </div>
            <button
              onClick={() => onHarvestSource(sourceId)}
              className="w-full px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Harvest
            </button>
          </div>
        ))
      )}
    </div>
  );
};