export interface GameTile {
  id: string;
  row: number;
  col: number;
  type: string;
  isDiscovered: boolean;
  isActive: boolean;
  hiddenType: string;
}

export interface GameSource {
  type: string;
  level: number;
  lastHarvestTime: number;
  cooldown: number;
  yield: number;
  isActive: boolean;
  row: number;
  col: number;
}

export interface SpiritBeast {
  type: string;
  level: number;
  bonus: number;
  isActive: boolean;
  row: number;
  col: number;
}

export interface GameResources {
  metal: number;
  wood: number;
  water: number;
  fire: number;
  earth: number;
}

export interface GameMap {
  map: GameTile[][];
  sources: Record<string, GameSource>;
  spiritBeasts: Record<string, SpiritBeast>;
}

export interface GameState {
  resources: GameResources;
  currentMapId: string;
  maps: Record<string, GameMap | null>;
  canHarvestOtherSources: boolean;
  unlockedTier2Upgrades: boolean;
  logs: LogEntry[];
  lastPlayedTime: number;
  isAutoHarvestingOnLoad: boolean;
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface ActionResult<T = GameState> {
  success: boolean;
  message: string;
  newState?: T;
  yieldedAmounts?: Partial<GameResources>;
}

export type ResourceType = keyof GameResources;

export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  icon?: string;
  maxCapacity?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: 'basic' | 'advanced' | 'special';
}