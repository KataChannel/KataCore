import type { GameMap, GameTile, GameSource, SpiritBeast } from '../types/game.types';
import { 
  GAME_CONFIG, 
  NGU_HANH_RELATIONS 
} from '../constants/game.constants';
import { getRandomInt } from '../utils/game.utils';

export class MapGeneratorService {
  static generateMapContent(size: number): GameMap {
    const newMap = this.generateEmptyMap(size);
    const { sources, spiritBeasts } = this.placeTilesRandomly(newMap, size);
    
    return { map: newMap, sources, spiritBeasts };
  }

  private static generateEmptyMap(size: number): GameTile[][] {
    return Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => ({
        id: `${r}-${c}`,
        row: r,
        col: c,
        type: "undiscovered",
        isDiscovered: false,
        isActive: false,
        hiddenType: "empty",
      }))
    );
  }

  private static placeTilesRandomly(map: GameTile[][], size: number) {
    const availablePositions = this.getAvailablePositions(size);
    const sources: Record<string, GameSource> = {};
    const spiritBeasts: Record<string, SpiritBeast> = {};

    const typesToPlace = [
      "metal_mine", "wood_forest", "water_spring", "fire_forge", "earth_field",
      "spirit_metal", "spirit_wood", "spirit_water", "spirit_fire", "spirit_earth",
    ];

    typesToPlace.forEach((type) => {
      if (availablePositions.length === 0) return;
      
      const randomIndex = getRandomInt(0, availablePositions.length - 1);
      const { r, c } = availablePositions.splice(randomIndex, 1)[0];
      
      map[r][c].hiddenType = type;

      if (this.isSourceType(type)) {
        sources[type] = this.createSource(type, r, c);
      } else if (type.includes("spirit_")) {
        spiritBeasts[type] = this.createSpiritBeast(type, r, c);
      }
    });

    return { sources, spiritBeasts };
  }

  private static getAvailablePositions(size: number) {
    const positions = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        positions.push({ r, c });
      }
    }
    return positions;
  }

  private static isSourceType(type: string): boolean {
    return type.includes("_mine") || type.includes("_forest") || 
           type.includes("_spring") || type.includes("_forge") || 
           type.includes("_field");
  }

  private static createSource(type: string, row: number, col: number): GameSource {
    return {
      type,
      level: 1,
      lastHarvestTime: 0,
      cooldown: GAME_CONFIG.BASE_HARVEST_COOLDOWN_MS,
      yield: GAME_CONFIG.BASE_RESOURCE_YIELD,
      isActive: false,
      row,
      col,
    };
  }

  private static createSpiritBeast(type: string, row: number, col: number): SpiritBeast {
    return {
      type,
      level: 1,
      bonus: GAME_CONFIG.SPIRIT_BEAST_BONUS_PER_LEVEL,
      isActive: false,
      row,
      col,
    };
  }
}