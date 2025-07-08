// pages/Game1.js
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

// --- Constants ---
const MAP_SIZE = 10;
const TILE_SIZE_PX = 32;
const RESOURCE_TYPES: any = ["metal", "wood", "water", "fire", "earth"];
const RESOURCE_ICONS: any = {
  metal: "💰",
  wood: "🌳",
  water: "💧",
  fire: "🔥",
  earth: "⛰️",
};
const SPIRIT_BEAST_ICONS: any = {
  spirit_metal: "🐉",
  spirit_wood: "🦌",
  spirit_water: "🐢",
  spirit_fire: "🦅",
  spirit_earth: "🐻",
};
const SOURCE_ICONS: any = {
  metal_mine: "⛏️",
  wood_forest: "🌲",
  water_spring: "🌊",
  fire_forge: "🌋",
  earth_field: "🌾",
};
const NGU_HANH_RELATIONS: any = {
  generates: {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  },
  overcomes: {
    metal: "wood",
    wood: "earth",
    earth: "water",
    water: "fire",
    fire: "metal",
  },
  elementMap: {
    metal_mine: "metal",
    wood_forest: "wood",
    water_spring: "water",
    fire_forge: "fire",
    earth_field: "earth",
    spirit_metal: "metal",
    spirit_wood: "wood",
    spirit_water: "water",
    spirit_fire: "fire",
    spirit_earth: "earth",
  },
};
const ELEMENT_TILE_BG_COLORS: any = {
  metal: "bg-gray-500",
  wood: "bg-lime-700",
  water: "bg-blue-700",
  fire: "bg-red-700",
  earth: "bg-amber-700",
  empty: "bg-gray-800",
};
const BASE_RESOURCE_YIELD = 10;
const BASE_HARVEST_COOLDOWN_MS = 10 * 1000;
const UPGRADE_COSTS: any = {
  source: {
    basePrimary: 50,
    baseOpposite: 20,
    multiplier: 1.5,
    tier2Multiplier: 1.8,
  },
  spiritBeast: {
    basePrimary: 40,
    baseGenerates: 15,
    multiplier: 1.4,
    tier2Multiplier: 1.7,
  },
};
const SPIRIT_BEAST_BONUS_PER_LEVEL = 0.05;
const DISCOVERY_COST_AMOUNT = 5;
const ACTIVATION_COST_AMOUNT = 5;
const MAX_LEVEL_INITIAL_TIER = 10;
const MAX_LEVEL_FINAL = 20;
const GAME_PHASE_INITIAL = "initial";
const GAME_PHASE_ADVANCED = "advanced";

// --- Game Logic ---
const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getIconForType = (type: string | number) => {
  return (
    RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS] ||
    SPIRIT_BEAST_ICONS[type as keyof typeof SPIRIT_BEAST_ICONS] ||
    SOURCE_ICONS[type as keyof typeof SOURCE_ICONS] ||
    ""
  );
};

const generateMapContent = (size: number) => {
  const newMap = Array.from({ length: size }, (_, r) =>
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

  const availablePositions: any = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      availablePositions.push({ r, c });
    }
  }

  const typesToPlace = [
    "metal_mine",
    "wood_forest",
    "water_spring",
    "fire_forge",
    "earth_field",
    "spirit_metal",
    "spirit_wood",
    "spirit_water",
    "spirit_fire",
    "spirit_earth",
  ];

  const sources: any = {};
  const spiritBeasts: any = {};

  typesToPlace.forEach((type) => {
    if (availablePositions.length === 0) return;
    const randomIndex = getRandomInt(0, availablePositions.length - 1);
    const { r, c } = availablePositions.splice(randomIndex, 1)[0];

    newMap[r][c].hiddenType = type;

    if (
      type.includes("_mine") ||
      type.includes("_forest") ||
      type.includes("_spring") ||
      type.includes("_forge") ||
      type.includes("_field")
    ) {
      sources[type] = {
        type,
        level: 1,
        lastHarvestTime: 0,
        cooldown: BASE_HARVEST_COOLDOWN_MS,
        yield: BASE_RESOURCE_YIELD,
        isActive: false,
        row: r,
        col: c,
      };
    } else if (type.includes("spirit_")) {
      spiritBeasts[type] = {
        type,
        level: 1,
        bonus: SPIRIT_BEAST_BONUS_PER_LEVEL,
        isActive: false,
        row: r,
        col: c,
      };
    }
  });

  return { map: newMap, sources, spiritBeasts };
};

const initializeGame = () => {
  const initialResources = { metal: 0, wood: 10, water: 0, fire: 0, earth: 0 };
  const initialMapContent = generateMapContent(MAP_SIZE);

  let woodForestTile = null;
  for (let r = 0; r < MAP_SIZE; r++) {
    for (let c = 0; c < MAP_SIZE; c++) {
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
    currentMapId: GAME_PHASE_INITIAL,
    maps: {
      [GAME_PHASE_INITIAL]: initialMapContent,
      [GAME_PHASE_ADVANCED]: null,
    },
    canHarvestOtherSources: false,
    unlockedTier2Upgrades: false,
    logs: [],
    lastPlayedTime: Date.now(),
    isAutoHarvestingOnLoad: false,
  };
};

const saveGame = (gameState: any, isAutoHarvesting: any) => {
  try {
    const serializedState = JSON.stringify({
      ...gameState,
      lastPlayedTime: Date.now(),
      isAutoHarvestingOnLoad: isAutoHarvesting,
    });
    localStorage.setItem("nguHanhGame", serializedState);
  } catch (error) {
    console.error("Error saving game:", error);
  }
};

const resetGame = () => {
  try {
    // Remove saved game from localStorage
    localStorage.removeItem("nguHanhGame");
    // Return a fresh game state
    return initializeGame();
  } catch (error) {
    console.error("Error resetting game:", error);
    return initializeGame();
  }
};

const loadGame = () => {
  try {
    if (typeof window === "undefined") return undefined;
    const serializedState = localStorage.getItem("nguHanhGame");
    if (!serializedState) return undefined;
    const loadedState = JSON.parse(serializedState);

    if (!loadedState.maps[GAME_PHASE_ADVANCED]) {
      loadedState.maps[GAME_PHASE_ADVANCED] = null;
    }
    if (typeof loadedState.unlockedTier2Upgrades === "undefined") {
      loadedState.unlockedTier2Upgrades = false;
    }

    const currentMapSources =
      loadedState.maps[loadedState.currentMapId]?.sources;
    if (
      currentMapSources &&
      currentMapSources.wood_forest &&
      currentMapSources.wood_forest.lastHarvestTime > 0
    ) {
      loadedState.canHarvestOtherSources = true;
    } else {
      loadedState.canHarvestOtherSources = false;
    }
    loadedState.logs = loadedState.logs || [];
    loadedState.lastPlayedTime = loadedState.lastPlayedTime || Date.now();
    loadedState.isAutoHarvestingOnLoad =
      loadedState.isAutoHarvestingOnLoad || false;

    return loadedState;
  } catch (error) {
    console.error("Error loading game:", error);
    return undefined;
  }
};

// --- Game Actions ---
const discoverTile = (gameState: any, row: any, col: any) => {
  const { currentMapId, maps, resources } = gameState;
  const currentMapData = maps[currentMapId];
  const newMap = currentMapData.map.map((rowArr: any) =>
    rowArr.map((tile: any) => ({ ...tile }))
  );
  const newResources = { ...resources };
  const tile = newMap[row][col];

  if (tile.isDiscovered) {
    return { success: false, message: "This tile is already discovered." };
  }

  let costType =
    tile.hiddenType === "empty"
      ? "wood"
      : (NGU_HANH_RELATIONS.elementMap[
          tile.hiddenType as keyof typeof NGU_HANH_RELATIONS.elementMap
        ] &&
          NGU_HANH_RELATIONS.generates[
            NGU_HANH_RELATIONS.elementMap[
              tile.hiddenType as keyof typeof NGU_HANH_RELATIONS.elementMap
            ] as keyof typeof NGU_HANH_RELATIONS.generates
          ]) ||
        "wood";
  const costAmount = DISCOVERY_COST_AMOUNT;

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
};

const activateTile = (gameState: any, row: any, col: any) => {
  const { currentMapId, maps, resources } = gameState;
  const currentMapData = {
    map: maps[currentMapId].map.map((r: any) => r.map((t: any) => ({ ...t }))),
    sources: { ...maps[currentMapId].sources },
    spiritBeasts: { ...maps[currentMapId].spiritBeasts },
  };
  const newResources = { ...resources };
  const tile = currentMapData.map[row][col];

  if (!tile.isDiscovered || tile.isActive || tile.type === "empty") {
    return { success: false, message: "Cannot activate this tile." };
  }

  let message = "";
  let newUnlockedTier2Upgrades = gameState.unlockedTier2Upgrades;

  if (currentMapData.sources[tile.type]) {
    const sourceResourceType =
      NGU_HANH_RELATIONS.elementMap[
        tile.type as keyof typeof NGU_HANH_RELATIONS.elementMap
      ];
    const generatingResource =
      NGU_HANH_RELATIONS.generates[
        sourceResourceType as keyof typeof NGU_HANH_RELATIONS.generates
      ];

    if (newResources[generatingResource] < ACTIVATION_COST_AMOUNT) {
      return {
        success: false,
        message: `Not enough resources. Need ${ACTIVATION_COST_AMOUNT} ${generatingResource}.`,
      };
    }

    newResources[generatingResource] -= ACTIVATION_COST_AMOUNT;
    currentMapData.sources[tile.type].isActive = true;
    tile.isActive = true;
    message = `Activated source ${tile.type
      .replace("_", " ")
      .replace("mine", "Mine")
      .replace("forest", "Forest")
      .replace("spring", "Spring")
      .replace("forge", "Forge")
      .replace(
        "field",
        "Field"
      )}! Cost ${ACTIVATION_COST_AMOUNT} ${generatingResource}.`;
  } else if (currentMapData.spiritBeasts[tile.type]) {
    currentMapData.spiritBeasts[tile.type].isActive = true;
    tile.isActive = true;
    message = `Activated spirit beast ${tile.type.replace(
      "spirit_",
      "Spirit Beast "
    )}!`;

    if (
      currentMapId === GAME_PHASE_ADVANCED &&
      !newUnlockedTier2Upgrades &&
      Object.values(currentMapData.spiritBeasts).every((sb: any) => sb.isActive)
    ) {
      newUnlockedTier2Upgrades = true;
      message += " Unlocked next tier upgrades (up to level 20)!";
    }
  }

  return {
    success: true,
    newState: {
      ...gameState,
      resources: newResources,
      maps: { ...maps, [currentMapId]: currentMapData },
      unlockedTier2Upgrades: newUnlockedTier2Upgrades,
    },
    message,
  };
};

const harvestSource = (gameState: any, sourceKey: any, isOffline = false) => {
  const { currentMapId, maps, resources } = gameState;
  const currentMapData = {
    map: maps[currentMapId].map,
    sources: { ...maps[currentMapId].sources },
    spiritBeasts: maps[currentMapId].spiritBeasts,
  };
  const newResources = { ...resources };
  const source = currentMapData.sources[sourceKey];

  if (!source || !source.isActive) {
    return {
      success: false,
      message: "This source is not activated or does not exist.",
    };
  }

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

  let canHarvestOthers = gameState.canHarvestOtherSources;
  if (
    currentMapId === GAME_PHASE_INITIAL &&
    sourceKey !== "wood_forest" &&
    !canHarvestOthers
  ) {
    return { success: false, message: "Harvest 'Wood Forest' first." };
  }
  if (sourceKey === "wood_forest" && !canHarvestOthers) {
    canHarvestOthers = true;
  }

  const primaryResourceType = NGU_HANH_RELATIONS.elementMap[source.type];
  const generatedResourceType =
    NGU_HANH_RELATIONS.generates[primaryResourceType];

  let actualYield = source.yield;
  const spiritBeastType = `spirit_${primaryResourceType}`;
  if (
    currentMapData.spiritBeasts[spiritBeastType] &&
    currentMapData.spiritBeasts[spiritBeastType].isActive
  ) {
    actualYield +=
      actualYield * currentMapData.spiritBeasts[spiritBeastType].bonus;
  }
  actualYield = Math.floor(actualYield);

  const generatedYield = Math.floor(actualYield / 5);

  newResources[primaryResourceType] =
    (newResources[primaryResourceType] || 0) + actualYield;
  newResources[generatedResourceType] =
    (newResources[generatedResourceType] || 0) + generatedYield;

  source.lastHarvestTime = now;

  return {
    success: true,
    newState: {
      ...gameState,
      resources: newResources,
      maps: { ...maps, [currentMapId]: currentMapData },
      canHarvestOtherSources: canHarvestOthers,
    },
    message: `Harvested ${actualYield} ${primaryResourceType} and ${generatedYield} ${generatedResourceType} from ${source.type
      .replace("_", " ")
      .replace("mine", "Mine")
      .replace("forest", "Forest")
      .replace("spring", "Spring")
      .replace("forge", "Forge")
      .replace("field", "Field")}!`,
    yieldedAmounts: {
      [primaryResourceType]: actualYield,
      [generatedResourceType]: generatedYield,
    },
  };
};

const upgradeSource = (gameState: any, sourceKey: any) => {
  const { currentMapId, maps, resources, unlockedTier2Upgrades } = gameState;
  const currentMapData = {
    map: maps[currentMapId].map,
    sources: { ...maps[currentMapId].sources },
    spiritBeasts: maps[currentMapId].spiritBeasts,
  };
  const newResources = { ...resources };
  const source = currentMapData.sources[sourceKey];

  if (!source || !source.isActive) {
    return {
      success: false,
      message: "This source is not activated or does not exist.",
    };
  }

  const maxLevelForThisUpgrade = unlockedTier2Upgrades
    ? MAX_LEVEL_FINAL
    : MAX_LEVEL_INITIAL_TIER;
  if (source.level >= maxLevelForThisUpgrade) {
    return {
      success: false,
      message: `Source at max level (${source.level}). ${
        source.level >= MAX_LEVEL_INITIAL_TIER && !unlockedTier2Upgrades
          ? "Activate all spirit beasts on the advanced map to continue upgrading."
          : ""
      }`,
    };
  }

  const primaryResourceType = NGU_HANH_RELATIONS.elementMap[source.type];
  const oppositeResourceType =
    NGU_HANH_RELATIONS.overcomes[primaryResourceType];
  const currentMultiplier =
    source.level < MAX_LEVEL_INITIAL_TIER
      ? UPGRADE_COSTS.source.multiplier
      : UPGRADE_COSTS.source.tier2Multiplier;

  const primaryCost = Math.floor(
    UPGRADE_COSTS.source.basePrimary *
      Math.pow(currentMultiplier, source.level - 1)
  );
  const oppositeCost = Math.floor(
    UPGRADE_COSTS.source.baseOpposite *
      Math.pow(currentMultiplier, source.level - 1)
  );

  if (
    newResources[primaryResourceType] < primaryCost ||
    newResources[oppositeResourceType] < oppositeCost
  ) {
    return {
      success: false,
      message: `Not enough resources. Need ${primaryCost} ${primaryResourceType} and ${oppositeCost} ${oppositeResourceType}.`,
    };
  }

  newResources[primaryResourceType] -= primaryCost;
  newResources[oppositeResourceType] -= oppositeCost;

  source.level += 1;
  source.yield += BASE_RESOURCE_YIELD * 0.5;
  source.cooldown = Math.max(
    BASE_HARVEST_COOLDOWN_MS * 0.8,
    source.cooldown * 0.9
  );

  return {
    success: true,
    newState: {
      ...gameState,
      resources: newResources,
      maps: { ...maps, [currentMapId]: currentMapData },
    },
    message: `Upgraded ${source.type
      .replace("_", " ")
      .replace("mine", "Mine")
      .replace("forest", "Forest")
      .replace("spring", "Spring")
      .replace("forge", "Forge")
      .replace("field", "Field")} to level ${source.level}!`,
  };
};

const upgradeSpiritBeast = (gameState: any, spiritBeastKey: any) => {
  const { currentMapId, maps, resources, unlockedTier2Upgrades } = gameState;
  const currentMapData = {
    map: maps[currentMapId].map,
    sources: maps[currentMapId].sources,
    spiritBeasts: { ...maps[currentMapId].spiritBeasts },
  };
  const newResources = { ...resources };
  const spiritBeast = currentMapData.spiritBeasts[spiritBeastKey];

  if (!spiritBeast || !spiritBeast.isActive) {
    return {
      success: false,
      message: "This spirit beast is not activated or does not exist.",
    };
  }

  const maxLevelForThisUpgrade = unlockedTier2Upgrades
    ? MAX_LEVEL_FINAL
    : MAX_LEVEL_INITIAL_TIER;
  if (spiritBeast.level >= maxLevelForThisUpgrade) {
    return {
      success: false,
      message: `Spirit beast at max level (${spiritBeast.level}). ${
        spiritBeast.level >= MAX_LEVEL_INITIAL_TIER && !unlockedTier2Upgrades
          ? "Activate all spirit beasts on the advanced map to continue upgrading."
          : ""
      }`,
    };
  }

  const primaryResourceType = NGU_HANH_RELATIONS.elementMap[spiritBeast.type];
  const generatesResourceType =
    NGU_HANH_RELATIONS.generates[primaryResourceType];
  const currentMultiplier =
    spiritBeast.level < MAX_LEVEL_INITIAL_TIER
      ? UPGRADE_COSTS.spiritBeast.multiplier
      : UPGRADE_COSTS.spiritBeast.tier2Multiplier;

  const primaryCost = Math.floor(
    UPGRADE_COSTS.spiritBeast.basePrimary *
      Math.pow(currentMultiplier, spiritBeast.level - 1)
  );
  const generatesCost = Math.floor(
    UPGRADE_COSTS.spiritBeast.baseGenerates *
      Math.pow(currentMultiplier, spiritBeast.level - 1)
  );

  if (
    newResources[primaryResourceType] < primaryCost ||
    newResources[generatesResourceType] < generatesCost
  ) {
    return {
      success: false,
      message: `Not enough resources. Need ${primaryCost} ${primaryResourceType} and ${generatesCost} ${generatesResourceType}.`,
    };
  }

  newResources[primaryResourceType] -= primaryCost;
  newResources[generatesResourceType] -= generatesCost;

  spiritBeast.level += 1;
  spiritBeast.bonus += SPIRIT_BEAST_BONUS_PER_LEVEL;

  return {
    success: true,
    newState: {
      ...gameState,
      resources: newResources,
      maps: { ...maps, [currentMapId]: currentMapData },
    },
    message: `Upgraded ${spiritBeast.type.replace(
      "spirit_",
      "Spirit Beast "
    )} to level ${spiritBeast.level}!`,
  };
};

// --- Components ---
const NotificationSystem = ({ notifications, setNotifications }: any) => {
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev: any) => prev.slice(1));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notif: any, index: any) => (
        <div
          key={index}
          className={`p-3 rounded-lg shadow-md text-sm ${
            notif.type === "error" ? "bg-red-600" : "bg-green-600"
          } text-white animate-fade-in-up`}
        >
          {notif.message}
        </div>
      ))}
    </div>
  );
};

const ResourceItem = ({ type, amount, icon, lastChange, hasBonus }: any) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const animationValueRef = useRef(0);

  useEffect(() => {
    if (lastChange > 0) {
      animationValueRef.current = lastChange;
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        animationValueRef.current = 0;
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [lastChange]);

  return (
    <div className="relative flex flex-col justify-center items-center gap-2 p-1 bg-gray-600 rounded-md overflow-hidden">
      <span className="text-base">{icon}</span>
      <span className="font-bold text-green-300 text-xs">{amount.toLocaleString('vi-VN')}</span>
      {hasBonus && (
        <span className="text-green-400 font-bold ml-1 text-sm">+</span>
      )}
      {showAnimation && animationValueRef.current > 0 && (
        <span className="absolute text-green-400 font-bold text-xl opacity-0 animate-resource-gain">
          +{animationValueRef.current}
        </span>
      )}
    </div>
  );
};

const ResourcePanel = ({
  resources,
  animatedResourceChanges,
  activeSpiritBeastBonuses,
  toggleAutoHarvest,
  isAutoHarvesting,
  setGameState,
  setLogs,
  setIsAutoHarvesting,
  addLog,
}: any) => {
  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-yellow-300">Resources</h3>
        <div className="flex gap-2">
          <button
            onClick={toggleAutoHarvest}
            className={`p-2 rounded-lg text-sm font-bold transition-colors duration-200 shadow-lg ${
              isAutoHarvesting
                ? "bg-red-700 hover:bg-red-800"
                : "bg-green-700 hover:bg-green-800"
            } text-white`}
          >
            {isAutoHarvesting ? "🤖 Stop Auto" : "🤖 Start Auto"}
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to reset your game? All progress will be lost!"
                )
              ) {
                const newGameState = resetGame();
                setGameState(newGameState);
                setLogs([]);
                setIsAutoHarvesting(false);
                addLog("Game has been reset!", "info");
              }
            }}
            className="p-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 shadow-lg"
          >
            🔄 Reset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 text-xs">
        {RESOURCE_TYPES.map((type: any) => (
          <ResourceItem
            key={type}
            type={type}
            amount={resources[type]}
            icon={RESOURCE_ICONS[type]}
            lastChange={animatedResourceChanges[type] || 0}
            hasBonus={activeSpiritBeastBonuses[type] || false}
          />
        ))}
      </div>
    </div>
  );
};

const Tile = ({ tile, onClick }: any) => {
  const { row, col, type, isDiscovered, isActive } = tile;
  const icon = getIconForType(type);
  const isSpecialTile = type !== "empty" && type !== "undiscovered";
  let tileBgClass = "bg-gray-700 hover:bg-gray-600";

  if (isDiscovered) {
    if (isActive && isSpecialTile) {
      tileBgClass = "bg-green-700";
    } else {
      const elementType =
        NGU_HANH_RELATIONS.elementMap[type] ||
        (type === "empty" ? "empty" : null);
      tileBgClass = ELEMENT_TILE_BG_COLORS[elementType] || "bg-gray-800";
    }
  }

  return (
    <div
      className={`relative border border-gray-600 flex items-center justify-center cursor-pointer transition-all duration-200 ${tileBgClass} rounded-md`}
      style={{ width: TILE_SIZE_PX, height: TILE_SIZE_PX }}
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

const Map = ({ map, onTileClick }: any) => {
  return (
    <div
      className="grid gap-0.5 p-2 bg-gray-700 rounded-lg shadow-inner"
      style={{
        gridTemplateColumns: `repeat(${MAP_SIZE}, ${TILE_SIZE_PX}px)`,
        gridTemplateRows: `repeat(${MAP_SIZE}, ${TILE_SIZE_PX}px)`,
      }}
    >
      {map.map((row: any) =>
        row.map((tile: any) => (
          <Tile key={tile.id} tile={tile} onClick={onTileClick} />
        ))
      )}
    </div>
  );
};

const SourcePanel = ({
  sources,
  onHarvest,
  onUpgrade,
  canHarvestOtherSources,
  resources,
  unlockedTier2Upgrades,
}: any) => {
  const sortedSources = Object.values(sources).sort((a: any, b: any) =>
    a.type.localeCompare(b.type)
  );

  const getUpgradeCosts = useCallback((source: any) => {
    const primaryResourceType = NGU_HANH_RELATIONS.elementMap[source.type];
    const oppositeResourceType =
      NGU_HANH_RELATIONS.overcomes[primaryResourceType];
    const currentMultiplier =
      source.level < MAX_LEVEL_INITIAL_TIER
        ? UPGRADE_COSTS.source.multiplier
        : UPGRADE_COSTS.source.tier2Multiplier;

    const primaryCost = Math.floor(
      UPGRADE_COSTS.source.basePrimary *
        Math.pow(currentMultiplier, source.level - 1)
    );
    const oppositeCost = Math.floor(
      UPGRADE_COSTS.source.baseOpposite *
        Math.pow(currentMultiplier, source.level - 1)
    );
    return {
      primaryResourceType,
      oppositeResourceType,
      primaryCost,
      oppositeCost,
    };
  }, []);

  return (
    <div className="p-3 bg-gray-700 rounded-lg shadow-inner">
      <h3 className="text-lg font-semibold mb-2 text-cyan-300">Sources</h3>
      <div className="grid grid-cols-1 gap-2">
        {sortedSources.map((source: any) => {
          const {
            primaryResourceType,
            oppositeResourceType,
            primaryCost,
            oppositeCost,
          } = getUpgradeCosts(source);
          const maxLevelForThisUpgrade = unlockedTier2Upgrades
            ? MAX_LEVEL_FINAL
            : MAX_LEVEL_INITIAL_TIER;
          const canUpgrade =
            source.level < maxLevelForThisUpgrade &&
            resources[primaryResourceType] >= primaryCost &&
            resources[oppositeResourceType] >= oppositeCost;
          const now = Date.now();
          const cooldownRemaining =
            source.lastHarvestTime + source.cooldown > now
              ? Math.ceil(
                  (source.lastHarvestTime + source.cooldown - now) / 1000
                )
              : 0;
          const canHarvest =
            cooldownRemaining === 0 &&
            source.isActive &&
            (source.type === "wood_forest" || canHarvestOtherSources);

          return (
            <div
              key={source.type}
              className="bg-gray-600 p-2 rounded-md flex flex-col gap-1"
            >
              <div className="flex flex-row gap-1 text-xs">
                <span className={`font-bold flex items-center gap-1 ${
                    source.isActive ? "text-green-400 grayscale-0" : "text-red-400 grayscale"
                  }`}>
                  {SOURCE_ICONS[source.type]} ({source.level})
                </span>
                {/* <span
                  className={`text-xs ${
                    source.isActive ? "text-green-400 grayscale" : "text-red-400 grayscale-0"
                  }`}
                >
                  {source.isActive ? "Active" : "Inactive"}
                </span> */}
                <span>
                  + {Math.floor(source.yield)}{" "}
                  {RESOURCE_ICONS[primaryResourceType]}
                </span>
                <span>
                  + {Math.floor(source.yield / 5)}{" "}
                  {
                    RESOURCE_ICONS[
                      NGU_HANH_RELATIONS.generates[primaryResourceType]
                    ]
                  }
                </span>
                {/* <span>🕒 {Math.ceil(source.cooldown / 1000)}s</span> */}
              </div>

              {/* <div className="flex flex-col text-xs">
                <span>
                  + {Math.floor(source.yield)} {RESOURCE_ICONS[primaryResourceType]}
                </span>
                <span>
                  + {Math.floor(source.yield / 5)}{" "}
                  {RESOURCE_ICONS[NGU_HANH_RELATIONS.generates[primaryResourceType]]}
                </span>
                <span>🕒 {Math.ceil(source.cooldown / 1000)}s</span>
              </div> */}

              <div className="flex flex-row gap-2 mt-1">
                <button
                  onClick={() => onHarvest(source.type)}
                  disabled={!canHarvest}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors duration-200 ${
                    canHarvest
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                  title="Harvest"
                >
               🕒 {cooldownRemaining > 0 ? `(${cooldownRemaining}s)` : "👐"}
                </button>
                <button
                  onClick={() => onUpgrade(source.type)}
                  disabled={!canUpgrade || !source.isActive}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors duration-200 ${
                    canUpgrade && source.isActive
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                  title="Upgrade"
                >
                  ⬆️({source.level}) 
                </button>
              </div>
              {!canUpgrade &&
                source.isActive &&
                source.level < maxLevelForThisUpgrade && (
                  <p className="text-xs text-red-300 mt-0.5">
                    -: {primaryCost} {RESOURCE_ICONS[primaryResourceType]},{" "}
                    {oppositeCost} {RESOURCE_ICONS[oppositeResourceType]}
                  </p>
                )}
              {source.level >= maxLevelForThisUpgrade && (
                <p className="text-xs text-blue-300 mt-0.5">Max Level!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SpiritBeastPanel = ({
  spiritBeasts,
  onUpgrade,
  resources,
  unlockedTier2Upgrades,
}: any) => {
  const sortedSpiritBeasts = Object.values(spiritBeasts).sort(
    (a: any, b: any) => a.type.localeCompare(b.type)
  );

  const getUpgradeCosts = useCallback((beast: any) => {
    const primaryResourceType = NGU_HANH_RELATIONS.elementMap[beast.type];
    const generatesResourceType =
      NGU_HANH_RELATIONS.generates[primaryResourceType];
    const currentMultiplier =
      beast.level < MAX_LEVEL_INITIAL_TIER
        ? UPGRADE_COSTS.spiritBeast.multiplier
        : UPGRADE_COSTS.spiritBeast.tier2Multiplier;

    const primaryCost = Math.floor(
      UPGRADE_COSTS.spiritBeast.basePrimary *
        Math.pow(currentMultiplier, beast.level - 1)
    );
    const generatesCost = Math.floor(
      UPGRADE_COSTS.spiritBeast.baseGenerates *
        Math.pow(currentMultiplier, beast.level - 1)
    );
    return {
      primaryResourceType,
      generatesResourceType,
      primaryCost,
      generatesCost,
    };
  }, []);

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
      <h3 className="text-lg font-semibold mb-2 text-cyan-300">
        Spirit Beasts
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {sortedSpiritBeasts.map((beast: any) => {
          const {
            primaryResourceType,
            generatesResourceType,
            primaryCost,
            generatesCost,
          } = getUpgradeCosts(beast);
          const maxLevelForThisUpgrade = unlockedTier2Upgrades
            ? MAX_LEVEL_FINAL
            : MAX_LEVEL_INITIAL_TIER;
          const canUpgrade =
            beast.level < maxLevelForThisUpgrade &&
            resources[primaryResourceType] >= primaryCost &&
            resources[generatesResourceType] >= generatesCost;

          return (
            <div
              key={beast.type}
              className="bg-gray-600 p-3 rounded-md flex flex-col gap-2"
            >
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-lg font-bold flex items-center gap-1">
                  {SPIRIT_BEAST_ICONS[beast.type]} ({beast.level})
                </span>
                <span
                  className={beast.isActive ? "text-green-400" : "text-red-400"}
                >
                  {beast.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                onClick={() => onUpgrade(beast.type)}
                disabled={!canUpgrade || !beast.isActive}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 mt-2 ${
                  canUpgrade && beast.isActive
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
              >
                ⬆️
              </button>
              {!canUpgrade &&
                beast.isActive &&
                beast.level < maxLevelForThisUpgrade && (
                  <p className="text-xs text-red-300 mt-1">
                    -: {primaryCost} {RESOURCE_ICONS[primaryResourceType]},{" "}
                    {generatesCost} {RESOURCE_ICONS[generatesResourceType]}
                  </p>
                )}
              {beast.level >= maxLevelForThisUpgrade && (
                <p className="text-xs text-blue-300 mt-0.5">Max Level!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ActivityLog = ({ logs }: any) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-48 overflow-auto w-full bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-700 flex flex-col">
      <h3 className="text-xl font-semibold mb-3 text-white">Activity Log</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {logs.map((log: any, index: any) => (
          <p
            key={index}
            className={`text-xs mb-1 ${
              log.type === "error"
                ? "text-red-300"
                : log.type === "success"
                ? "text-green-300"
                : "text-gray-300"
            }`}
          >
            <span className="text-gray-500">
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>{" "}
            {log.message}
          </p>
        ))}
        <div ref={logEndRef} />
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
      `}</style>
    </div>
  );
};

// --- Main Component ---
export default function Game1() {
  const [gameState, setGameState] = useState(
    () => loadGame() || initializeGame()
  );
  const {
    currentMapId,
    maps,
    resources,
    canHarvestOtherSources,
    unlockedTier2Upgrades,
  } = gameState;
  const currentMapData = maps[currentMapId];
  const [notifications, setNotifications] = useState<any[]>([]);
  const [logs, setLogs] = useState(() => loadGame()?.logs || []);
  const [isAutoHarvesting, setIsAutoHarvesting] = useState(
    gameState.isAutoHarvestingOnLoad || false
  );
  const [animatedResourceChanges, setAnimatedResourceChanges] = useState({});
  const [activeSpiritBeastBonuses, setActiveSpiritBeastBonuses] = useState({});

  const addLog = useCallback((message: any, type = "info") => {
    const logEntry = { timestamp: Date.now(), message, type };
    setNotifications((prev: any[]) => [...prev, logEntry]);
    setLogs((prev: any[]) => [...prev, logEntry]);
  }, []);

  useEffect(() => {
    saveGame(gameState, isAutoHarvesting);

    if (gameState.lastPlayedTime && gameState.isAutoHarvestingOnLoad) {
      const offlineDuration = Date.now() - gameState.lastPlayedTime;
      if (offlineDuration > 0) {
        setGameState((prevGameState: any) => {
          let updatedGameState = { ...prevGameState };
          let totalOfflineYield: any = {};
          let harvestedAnyOffline = false;
          const currentMap =
            updatedGameState.maps[updatedGameState.currentMapId];
          const sourcesToProcess = { ...currentMap.sources };

          for (const sourceKey in sourcesToProcess) {
            const source = sourcesToProcess[sourceKey];
            if (source.isActive) {
              const elapsedTimeSinceLastHarvest =
                Date.now() - source.lastHarvestTime;
              const numHarvests = Math.floor(
                elapsedTimeSinceLastHarvest / source.cooldown
              );

              if (numHarvests > 0) {
                const primaryResourceType =
                  NGU_HANH_RELATIONS.elementMap[source.type];
                const generatedResourceType =
                  NGU_HANH_RELATIONS.generates[primaryResourceType];
                let actualYield = source.yield;
                const spiritBeastType = `spirit_${primaryResourceType}`;
                if (
                  currentMap.spiritBeasts[spiritBeastType] &&
                  currentMap.spiritBeasts[spiritBeastType].isActive
                ) {
                  actualYield +=
                    actualYield *
                    currentMap.spiritBeasts[spiritBeastType].bonus;
                }
                actualYield = Math.floor(actualYield);

                const generatedYield = Math.floor(actualYield / 5);
                const totalPrimaryYield = numHarvests * actualYield;
                const totalGeneratedYield = numHarvests * generatedYield;

                updatedGameState.resources[primaryResourceType] =
                  (updatedGameState.resources[primaryResourceType] || 0) +
                  totalPrimaryYield;
                updatedGameState.resources[generatedResourceType] =
                  (updatedGameState.resources[generatedResourceType] || 0) +
                  totalGeneratedYield;

                sourcesToProcess[sourceKey].lastHarvestTime +=
                  numHarvests * source.cooldown;
                totalOfflineYield[primaryResourceType] =
                  (totalOfflineYield[primaryResourceType] || 0) +
                  totalPrimaryYield;
                totalOfflineYield[generatedResourceType] =
                  (totalOfflineYield[generatedResourceType] || 0) +
                  totalGeneratedYield;
                harvestedAnyOffline = true;
              }
            }
          }

          if (harvestedAnyOffline) {
            addLog(
              `Offline harvest: ${Object.entries(totalOfflineYield)
                .map(([type, amount]) => `${amount} ${type}`)
                .join(", ")}`,
              "success"
            );
            updatedGameState.maps[updatedGameState.currentMapId].sources =
              sourcesToProcess;
          }

          updatedGameState.lastPlayedTime = Date.now();
          return updatedGameState;
        });
      }
    }

    const handleBeforeUnload = () => {
      saveGame(gameState, isAutoHarvesting);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameState, isAutoHarvesting, addLog]);

  useEffect(() => {
    const newActiveBonuses: any = {};
    if (currentMapData?.spiritBeasts) {
      for (const key in currentMapData.spiritBeasts) {
        const beast = currentMapData.spiritBeasts[key];
        if (beast.isActive) {
          const primaryResourceType = NGU_HANH_RELATIONS.elementMap[beast.type];
          if (primaryResourceType) {
            newActiveBonuses[primaryResourceType] = true;
          }
        }
      }
    }
    setActiveSpiritBeastBonuses(newActiveBonuses);
  }, [currentMapData?.spiritBeasts]);

  useEffect(() => {
    if (currentMapId === GAME_PHASE_INITIAL && maps[GAME_PHASE_INITIAL]) {
      const initialSources = maps[GAME_PHASE_INITIAL].sources;
      const initialSpiritBeasts = maps[GAME_PHASE_INITIAL].spiritBeasts;
      const allSourcesMaxedInitialTier = Object.values(initialSources).every(
        (s: any) => s.level >= MAX_LEVEL_INITIAL_TIER
      );
      const allSpiritBeastsMaxedInitialTier = Object.values(
        initialSpiritBeasts
      ).every((sb: any) => sb.level >= MAX_LEVEL_INITIAL_TIER);

      if (
        allSourcesMaxedInitialTier &&
        allSpiritBeastsMaxedInitialTier &&
        !maps[GAME_PHASE_ADVANCED]
      ) {
        addLog(
          "All sources and spirit beasts at initial max level! Unlocking new map...",
          "info"
        );
        const advancedMapContent = generateMapContent(MAP_SIZE);

        setGameState((prev: any) => ({
          ...prev,
          currentMapId: GAME_PHASE_ADVANCED,
          maps: {
            ...prev.maps,
            [GAME_PHASE_ADVANCED]: advancedMapContent,
          },
          canHarvestOtherSources: true,
        }));
        addLog(
          "New map unlocked! Explore and activate Spirit Beasts to unlock next tier upgrades (up to level 20)!",
          "success"
        );
      }
    }
  }, [currentMapId, maps, addLog]);

  const performAutoHarvest = useCallback(() => {
    setGameState((prevGameState: any) => {
      let currentGameState = { ...prevGameState };
      let harvestedCount = 0;
      let totalYieldedAmounts: any = {};
      const currentSources =
        currentGameState.maps[currentGameState.currentMapId].sources;

      for (const sourceKey in currentSources) {
        const source = currentSources[sourceKey];
        const now = Date.now();
        let canHarvest =
          source.isActive &&
          source.lastHarvestTime + source.cooldown <= now &&
          (currentGameState.currentMapId === GAME_PHASE_ADVANCED ||
            sourceKey === "wood_forest" ||
            currentGameState.canHarvestOtherSources);

        if (canHarvest) {
          const harvestResult: any = harvestSource(currentGameState, sourceKey);
          if (harvestResult.success) {
            currentGameState = harvestResult.newState;
            addLog(harvestResult.message, "success");
            harvestedCount++;
            for (const resType in harvestResult.yieldedAmounts) {
              totalYieldedAmounts[resType] =
                (totalYieldedAmounts[resType] || 0) +
                harvestResult.yieldedAmounts[resType];
            }
          }
        }
      }

      if (Object.keys(totalYieldedAmounts).length > 0) {
        setAnimatedResourceChanges(totalYieldedAmounts);
        setTimeout(() => setAnimatedResourceChanges({}), 800);
      }

      return harvestedCount > 0 ? currentGameState : prevGameState;
    });
  }, [addLog]);

  useEffect(() => {
    let intervalId: any;
    if (isAutoHarvesting) {
      intervalId = setInterval(performAutoHarvest, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoHarvesting, performAutoHarvest]);

  const handleTileClick = useCallback(
    (row: any, col: any) => {
      const tile = currentMapData.map[row][col];
      if (!tile.isDiscovered) {
        const result = discoverTile(gameState, row, col);
        if (result.success) {
          setGameState(result.newState);
          addLog(result.message, "info");
        } else {
          addLog(result.message, "error");
        }
      } else if (tile.isDiscovered && !tile.isActive && tile.type !== "empty") {
        const result = activateTile(gameState, row, col);
        if (result.success) {
          setGameState(result.newState);
          addLog(result.message, "success");
        } else {
          addLog(result.message, "error");
        }
      }
    },
    [gameState, currentMapData, addLog]
  );

  const handleHarvest = useCallback(
    (sourceId: any) => {
      const result: any = harvestSource(gameState, sourceId);
      if (result.success) {
        setGameState(result.newState);
        addLog(result.message, "success");
        setAnimatedResourceChanges(result.yieldedAmounts);
        setTimeout(() => setAnimatedResourceChanges({}), 800);
      } else {
        addLog(result.message, "error");
      }
    },
    [gameState, addLog]
  );

  const handleUpgradeSource = useCallback(
    (sourceId: any) => {
      const result: any = upgradeSource(gameState, sourceId);
      if (result.success) {
        setGameState(result.newState);
        addLog(result.message, "success");
      } else {
        addLog(result.message, "error");
      }
    },
    [gameState, addLog]
  );

  const handleUpgradeSpiritBeast = useCallback(
    (spiritBeastId: any) => {
      const result: any = upgradeSpiritBeast(gameState, spiritBeastId);
      if (result.success) {
        setGameState(result.newState);
        addLog(result.message, "success");
      } else {
        addLog(result.message, "error");
      }
    },
    [gameState, addLog]
  );

  const toggleAutoHarvest = () => {
    setIsAutoHarvesting((prev: any) => !prev);
    addLog(
      isAutoHarvesting ? "Auto-harvest disabled." : "Auto-harvest enabled.",
      "info"
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4 font-inter">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");
        body {
          font-family: "Inter", sans-serif;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes resource-gain {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          20% {
            transform: translateY(-15px);
            opacity: 1;
          }
          80% {
            transform: translateY(-25px);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-30px);
            opacity: 0;
          }
        }
        .animate-resource-gain {
          animation: resource-gain 0.7s ease-out forwards;
        }
      `}</style>
      <h1 className="text-2xl font-extrabold mb-4 text-yellow-500 drop-shadow-lg text-center">
        Five Elements Exploration
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 w-full max-w-7xl gap-4 mx-auto">
        <div className="lg:col-span-2 w-full bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-700 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-gray-200">
            Exploration Map (
            {currentMapId === GAME_PHASE_INITIAL ? "Initial" : "Advanced"})
          </h2>
          <ResourcePanel
              resources={resources}
              animatedResourceChanges={animatedResourceChanges}
              activeSpiritBeastBonuses={activeSpiritBeastBonuses}
              toggleAutoHarvest={toggleAutoHarvest}
              isAutoHarvesting={isAutoHarvesting}
            />
          {currentMapData && (
            <Map map={currentMapData.map} onTileClick={handleTileClick} />
          )}
          <p className="text-sm text-gray-400 mt-4 text-center">
            Click an undiscovered tile to reveal it. Click a discovered tile to
            activate its source or spirit beast.
          </p>
          <ActivityLog logs={logs} />
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* <div className="bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-700">
            <ResourcePanel
              resources={resources}
              animatedResourceChanges={animatedResourceChanges}
              activeSpiritBeastBonuses={activeSpiritBeastBonuses}
              toggleAutoHarvest={toggleAutoHarvest}
              isAutoHarvesting={isAutoHarvesting}
            />
          </div> */}
          <div className="bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-700 overflow-y-auto">
            {currentMapData && (
              <SourcePanel
                sources={currentMapData.sources}
                onHarvest={handleHarvest}
                onUpgrade={handleUpgradeSource}
                canHarvestOtherSources={canHarvestOtherSources}
                resources={resources}
                unlockedTier2Upgrades={unlockedTier2Upgrades}
              />
            )}
          </div>
          <div className="bg-gray-800 p-2 rounded-xl shadow-2xl border border-gray-700 overflow-y-auto">
            {currentMapData && (
              <SpiritBeastPanel
                spiritBeasts={currentMapData.spiritBeasts}
                onUpgrade={handleUpgradeSpiritBeast}
                resources={resources}
                unlockedTier2Upgrades={unlockedTier2Upgrades}
              />
            )}
          </div>
        </div>
      </div>
      <NotificationSystem
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}
