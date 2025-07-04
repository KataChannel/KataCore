import type { GameState, ActionResult, GameResources } from '../types/game.types';
import { 
  GAME_CONFIG, 
  NGU_HANH_RELATIONS,
  GAME_PHASES 
} from '../constants/game.constants';
import { calculateUpgradeCosts, canAffordUpgrade } from '../utils/game.utils';

export class GameActionsService {
  static discoverTile(gameState: GameState, row: number, col: number): ActionResult {
    const { currentMapId, maps, resources } = gameState;
    const currentMapData = maps[currentMapId];
    if (!currentMapData) {
      return { success: false, message: "No map data available." };
    }

    const newMap = currentMapData.map.map(rowArr =>
      rowArr.map(tile => ({ ...tile }))
    );
    const newResources = { ...resources };
    const tile = newMap[row][col];

    if (tile.isDiscovered) {
      return { success: false, message: "This tile is already discovered." };
    }

    const costType = this.getDiscoveryCostType(tile.hiddenType);
    const costAmount = GAME_CONFIG.DISCOVERY_COST_AMOUNT;

    if (newResources[costType] < costAmount) {
      return {
        success: false,
        message: `Not enough resources. Need ${costAmount} ${costType}.`,
      };
    }

    newResources[costType] -= costAmount;
    tile.isDiscovered = true;
    tile.type = tile.hiddenType;

    return {
      success: true,
      newState: {
        ...gameState,
        resources: newResources,
        maps: {
          ...maps,
          [currentMapId]: { ...currentMapData, map: newMap },
        },
      },
      message: `Discovered tile at (${row}, ${col}). Cost ${costAmount} ${costType}.`,
    };
  }

  static activateTile(gameState: GameState, row: number, col: number): ActionResult {
    const { currentMapId, maps, resources } = gameState;
    const currentMapData = maps[currentMapId];
    if (!currentMapData) {
      return { success: false, message: "No map data available." };
    }

    const newMapData = {
      map: currentMapData.map.map(r => r.map(t => ({ ...t }))),
      sources: { ...currentMapData.sources },
      spiritBeasts: { ...currentMapData.spiritBeasts },
    };
    const newResources = { ...resources };
    const tile = newMapData.map[row][col];

    if (!tile.isDiscovered || tile.isActive || tile.type === "empty") {
      return { success: false, message: "Cannot activate this tile." };
    }

    let message = "";
    let newUnlockedTier2Upgrades = gameState.unlockedTier2Upgrades;

    if (newMapData.sources[tile.type]) {
      const activationResult = this.activateSource(newMapData, newResources, tile);
      if (!activationResult.success) return activationResult;
      message = activationResult.message;
    } else if (newMapData.spiritBeasts[tile.type]) {
      const activationResult = this.activateSpiritBeast(
        newMapData, 
        tile, 
        currentMapId, 
        newUnlockedTier2Upgrades
      );
      message = activationResult.message;
      newUnlockedTier2Upgrades = activationResult.newUnlockedTier2Upgrades;
    }

    return {
      success: true,
      newState: {
        ...gameState,
        resources: newResources,
        maps: { ...maps, [currentMapId]: newMapData },
        unlockedTier2Upgrades: newUnlockedTier2Upgrades,
      },
      message,
    };
  }

  static harvestSource(
    gameState: GameState, 
    sourceKey: string, 
    isOffline = false
  ): ActionResult {
    const { currentMapId, maps, resources } = gameState;
    const currentMapData = maps[currentMapId];
    if (!currentMapData) {
      return { success: false, message: "No map data available." };
    }

    const newMapData = {
      map: currentMapData.map,
      sources: { ...currentMapData.sources },
      spiritBeasts: currentMapData.spiritBeasts,
    };
    const newResources = { ...resources };
    const source = newMapData.sources[sourceKey];

    if (!source?.isActive) {
      return {
        success: false,
        message: "This source is not activated or does not exist.",
      };
    }

    // Check cooldown
    const now = Date.now();
    if (!isOffline && source.lastHarvestTime + source.cooldown > now) {
      const remainingTime = Math.ceil(
        (source.lastHarvestTime + source.cooldown - now) / 1000
      );
      return {
        success: false,
        message: `Source on cooldown. Wait ${remainingTime} seconds.`,
      };
    }

    // Check harvest permissions
    let canHarvestOthers = gameState.canHarvestOtherSources;
    if (currentMapId === GAME_PHASES.INITIAL && sourceKey !== "wood_forest" && !canHarvestOthers) {
      return { success: false, message: "Harvest 'Wood Forest' first." };
    }
    if (sourceKey === "wood_forest" && !canHarvestOthers) {
      canHarvestOthers = true;
    }

    const yieldResult = this.calculateHarvestYield(source, newMapData.spiritBeasts);
    
    newResources[yieldResult.primaryType] = 
      (newResources[yieldResult.primaryType] || 0) + yieldResult.actualYield;
    newResources[yieldResult.generatedType] = 
      (newResources[yieldResult.generatedType] || 0) + yieldResult.generatedYield;

    source.lastHarvestTime = now;

    return {
      success: true,
      newState: {
        ...gameState,
        resources: newResources,
        maps: { ...maps, [currentMapId]: newMapData },
        canHarvestOtherSources: canHarvestOthers,
      },
      message: `Harvested ${yieldResult.actualYield} ${yieldResult.primaryType} and ${yieldResult.generatedYield} ${yieldResult.generatedType} from ${this.formatSourceName(source.type)}!`,
      yieldedAmounts: {
        [yieldResult.primaryType]: yieldResult.actualYield,
        [yieldResult.generatedType]: yieldResult.generatedYield,
      },
    };
  }

  private static getDiscoveryCostType(hiddenType: string): keyof GameResources {
    if (hiddenType === "empty") return "wood";
    
    const elementType = NGU_HANH_RELATIONS.elementMap[hiddenType as keyof typeof NGU_HANH_RELATIONS.elementMap];
    const generatesType = NGU_HANH_RELATIONS.generates[elementType as keyof typeof NGU_HANH_RELATIONS.generates];
    
    return (generatesType as keyof GameResources) || "wood";
  }

  private static activateSource(mapData: any, resources: GameResources, tile: any) {
    const sourceResourceType = NGU_HANH_RELATIONS.elementMap[tile.type as keyof typeof NGU_HANH_RELATIONS.elementMap];
    const generatingResource = NGU_HANH_RELATIONS.generates[sourceResourceType as keyof typeof NGU_HANH_RELATIONS.generates];

    if (resources[generatingResource as keyof GameResources] < GAME_CONFIG.ACTIVATION_COST_AMOUNT) {
      return {
        success: false,
        message: `Not enough resources. Need ${GAME_CONFIG.ACTIVATION_COST_AMOUNT} ${generatingResource}.`,
      };
    }

    resources[generatingResource as keyof GameResources] -= GAME_CONFIG.ACTIVATION_COST_AMOUNT;
    mapData.sources[tile.type].isActive = true;
    tile.isActive = true;

    return {
      success: true,
      message: `Activated source ${this.formatSourceName(tile.type)}! Cost ${GAME_CONFIG.ACTIVATION_COST_AMOUNT} ${generatingResource}.`,
    };
  }

  private static activateSpiritBeast(mapData: any, tile: any, currentMapId: string, unlockedTier2: boolean) {
    mapData.spiritBeasts[tile.type].isActive = true;
    tile.isActive = true;
    
    let message = `Activated spirit beast ${tile.type.replace("spirit_", "Spirit Beast ")}!`;
    let newUnlockedTier2Upgrades = unlockedTier2;

    if (
      currentMapId === GAME_PHASES.ADVANCED &&
      !unlockedTier2 &&
      Object.values(mapData.spiritBeasts).every((sb: any) => sb.isActive)
    ) {
      newUnlockedTier2Upgrades = true;
      message += " Unlocked next tier upgrades (up to level 20)!";
    }

    return { message, newUnlockedTier2Upgrades };
  }

  private static calculateHarvestYield(source: any, spiritBeasts: any) {
    const primaryResourceType = NGU_HANH_RELATIONS.elementMap[source.type as keyof typeof NGU_HANH_RELATIONS.elementMap];
    const generatedResourceType = NGU_HANH_RELATIONS.generates[primaryResourceType as keyof typeof NGU_HANH_RELATIONS.generates];

    let actualYield = source.yield;
    const spiritBeastType = `spirit_${primaryResourceType}`;
    
    if (spiritBeasts[spiritBeastType]?.isActive) {
      actualYield += actualYield * spiritBeasts[spiritBeastType].bonus;
    }
    
    actualYield = Math.floor(actualYield);
    const generatedYield = Math.floor(actualYield / 5);

    return {
      primaryType: primaryResourceType,
      generatedType: generatedResourceType,
      actualYield,
      generatedYield,
    };
  }

  private static formatSourceName(type: string): string {
    return type
      .replace("_", " ")
      .replace("mine", "Mine")
      .replace("forest", "Forest")
      .replace("spring", "Spring")
      .replace("forge", "Forge")
      .replace("field", "Field");
  }
}