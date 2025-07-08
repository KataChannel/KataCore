import type { GameMap } from '../../types/game.types';
import { Tile } from './Tile';

interface MapDisplayProps {
  mapData: GameMap;
  onTileClick: (row: number, col: number) => void;
}

export const MapDisplay = ({ mapData, onTileClick }: MapDisplayProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Exploration Map</h2>
      <div className="grid grid-cols-10 gap-1 justify-center">
        {mapData.map.map((row, rowIndex) =>
          row.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              onClick={onTileClick}
            />
          ))
        )}
      </div>
      <div className="mt-4 text-xs text-gray-400 text-center">
        Click undiscovered tiles (?) to explore • Click discovered tiles to activate
      </div>
    </div>
  );
};