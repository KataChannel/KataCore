import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, LogEntry } from '../types/game.types';
import { GameStorageService } from '../services/storage.service';
import { MapGeneratorService } from '../services/mapGenerator.service';
import { GAME_CONFIG, GAME_PHASES } from '../constants/game.constants';
import { GameActionsService } from '../services/gameActions.service';

const initializeGame = (): GameState => {
  const initialResources = { metal: 0, wood: 10, water: 0, fire: 0, earth: 0 };
  const initialMapContent = MapGeneratorService.generateMapContent(GAME_CONFIG.MAP_SIZE);

  // Auto-discover and activate wood forest
  let woodForestTile = null;
  for (let r = 0; r < GAME_CONFIG.MAP_SIZE; r++) {
    for (let c = 0; c < GAME_CONFIG.MAP_SIZE; c++) {
      if (initialMapContent.map[r][c].hiddenType === "wood_forest") {
        woodForestTile = initialMapContent.map[r][c];
        break;
      }
    }
    if (woodForestTile) break;
  }

  if (woodForestTile) {
    woodForestTile.isDiscovered = true;
    woodForestTile.isActive = true;
    woodForestTile.type = woodForestTile.hiddenType;
    initialMapContent.sources["wood_forest"].isActive = true;
  }

  return {
    resources: initialResources,
    currentMapId: GAME_PHASES.INITIAL,
    maps: {
      [GAME_PHASES.INITIAL]: initialMapContent,
      [GAME_PHASES.ADVANCED]: null,
    },
    canHarvestOtherSources: false,
    unlockedTier2Upgrades: false,
    logs: [],
    lastPlayedTime: Date.now(),
    isAutoHarvestingOnLoad: false,
  };
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => 
    GameStorageService.loadGame() || initializeGame()
  );
  
  const [notifications, setNotifications] = useState<LogEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>(() => 
    GameStorageService.loadGame()?.logs || []
  );
  
  const [isAutoHarvesting, setIsAutoHarvesting] = useState(
    gameState.isAutoHarvestingOnLoad || false
  );
  
  const [animatedResourceChanges, setAnimatedResourceChanges] = useState({});
  const [activeSpiritBeastBonuses, setActiveSpiritBeastBonuses] = useState({});
  
  const autoHarvestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = "info") => {
    const logEntry: LogEntry = { timestamp: Date.now(), message, type };
    setNotifications(prev => [...prev, logEntry]);
    setLogs(prev => [...prev, logEntry]);
  }, []);

  // Save game when state changes
  useEffect(() => {
    GameStorageService.saveGame(gameState, isAutoHarvesting);
  }, [gameState, isAutoHarvesting]);

  // Game actions
  const actions = {
    discoverTile: useCallback((row: number, col: number) => {
      const result = GameActionsService.discoverTile(gameState, row, col);
      if (result.success && result.newState) {
        setGameState(result.newState);
        addLog(result.message, "info");
      } else {
        addLog(result.message, "error");
      }
    }, [gameState, addLog]),

    activateTile: useCallback((row: number, col: number) => {
      const result = GameActionsService.activateTile(gameState, row, col);
      if (result.success && result.newState) {
        setGameState(result.newState);
        addLog(result.message, "success");
      } else {
        addLog(result.message, "error");
      }
    }, [gameState, addLog]),

    harvestSource: useCallback((sourceId: string) => {
      const result = GameActionsService.harvestSource(gameState, sourceId);
      if (result.success && result.newState) {
        setGameState(result.newState);
        addLog(result.message, "success");
        
        if (result.yieldedAmounts) {
          setAnimatedResourceChanges(result.yieldedAmounts);
          setTimeout(() => setAnimatedResourceChanges({}), 800);
        }
      } else {
        addLog(result.message, "error");
      }
    }, [gameState, addLog]),

    toggleAutoHarvest: useCallback(() => {
      setIsAutoHarvesting(prev => {
        const newValue = !prev;
        addLog(
          newValue ? "Auto-harvest enabled." : "Auto-harvest disabled.",
          "info"
        );
        return newValue;
      });
    }, [addLog]),
  };

  return {
    gameState,
    notifications,
    setNotifications,
    logs,
    isAutoHarvesting,
    animatedResourceChanges,
    activeSpiritBeastBonuses,
    actions,
    addLog,
  };
};