import { GameTile } from '../../types/game.types';
import { getIconForType } from '../../utils/game.utils';
import { NGU_HANH_RELATIONS, ELEMENT_TILE_BG_COLORS, GAME_CONFIG } from '../../constants/game.constants';

interface TileProps {
  tile: GameTile;
  onClick: (row: number, col: number) => void;
}

export const Tile = ({ tile, onClick }: TileProps) => {
  const { row, col, type, isDiscovered, isActive } = tile;
  const icon = getIconForType(type);
  const isSpecialTile = type !== "empty" && type !== "undiscovered";
  let tileBgClass = "bg-gray-700 hover:bg-gray-600";

  if (isDiscovered) {
    if (isActive && isSpecialTile) {
      tileBgClass = "bg-green-700";
    } else {
      const elementType =
        NGU_HANH_RELATIONS.elementMap[type as keyof typeof NGU_HANH_RELATIONS.elementMap] || 
        (type === "empty" ? "empty" : null);
      tileBgClass = ELEMENT_TILE_BG_COLORS[elementType as keyof typeof ELEMENT_TILE_BG_COLORS] || "bg-gray-800";
    }
  }

  return (
    <div 
      className={`relative border border-gray-600 flex items-center justify-center cursor-pointer transition-all duration-200 ${tileBgClass} rounded-md`}
      style={{ width: GAME_CONFIG.TILE_SIZE_PX, height: GAME_CONFIG.TILE_SIZE_PX }}
      onClick={() => onClick(row, col)}
    >
      {isDiscovered ? (
        isSpecialTile && (
          <span
            className="text-xl"
            style={{ filter: isActive ? "grayscale(0%)" : "grayscale(100%)" }}
          >
            {icon}
          </span>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-200">
          ?
        </div>
      )}
    </div>
  );
};