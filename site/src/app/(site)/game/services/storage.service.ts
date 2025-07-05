import type { GameState } from '../types/game.types';
import { GAME_PHASES } from '../constants/game.constants';

export class GameStorageService {
  private static readonly STORAGE_KEY = 'nguHanhGame';

  static saveGame(gameState: GameState, isAutoHarvesting: boolean): void {
    try {
      if (typeof window === 'undefined') return;
      
      const serializedState = JSON.stringify({
        ...gameState,
        lastPlayedTime: Date.now(),
        isAutoHarvestingOnLoad: isAutoHarvesting,
      });
      
      localStorage.setItem(this.STORAGE_KEY, serializedState);
    } catch (error) {
      console.error('Error saving game:', error);
    }
  }

  static loadGame(): GameState | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const serializedState = localStorage.getItem(this.STORAGE_KEY);
      if (!serializedState) return null;
      
      const loadedState: GameState = JSON.parse(serializedState);
      
      // Validate and migrate old save data
      this.validateAndMigrateState(loadedState);
      
      return loadedState;
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  }

  private static validateAndMigrateState(state: GameState): void {
    // Ensure advanced map exists
    if (!state.maps[GAME_PHASES.ADVANCED]) {
      state.maps[GAME_PHASES.ADVANCED] = null;
    }
    
    // Ensure tier2 upgrades flag exists
    if (typeof state.unlockedTier2Upgrades === 'undefined') {
      state.unlockedTier2Upgrades = false;
    }
    
    // Set canHarvestOtherSources based on wood forest progress
    const currentMapSources:any = state.maps[state.currentMapId]?.sources;
    if (currentMapSources?.wood_forest?.lastHarvestTime > 0) {
      state.canHarvestOtherSources = true;
    } else {
      state.canHarvestOtherSources = false;
    }
    
    // Ensure logs and timestamps exist
    state.logs = state.logs || [];
    state.lastPlayedTime = state.lastPlayedTime || Date.now();
    state.isAutoHarvestingOnLoad = state.isAutoHarvestingOnLoad || false;
  }

  static clearSave(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing save:', error);
    }
  }
}