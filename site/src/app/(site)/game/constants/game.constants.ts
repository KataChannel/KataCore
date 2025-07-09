export const GAME_CONFIG = {
  MAP_SIZE: 10,
  TILE_SIZE_PX: 32,
  BASE_RESOURCE_YIELD: 10,
  BASE_HARVEST_COOLDOWN_MS: 10 * 1000,
  SPIRIT_BEAST_BONUS_PER_LEVEL: 0.05,
  DISCOVERY_COST_AMOUNT: 5,
  ACTIVATION_COST_AMOUNT: 5,
  MAX_LEVEL_INITIAL_TIER: 10,
  MAX_LEVEL_FINAL: 20,
  AUTO_HARVEST_INTERVAL: 1000,
} as const;

export const GAME_PHASES = {
  INITIAL: "initial",
  ADVANCED: "advanced",
} as const;

export const RESOURCE_TYPES = ["metal", "wood", "water", "fire", "earth"] as const;

export const RESOURCE_ICONS = {
  metal: "💰",
  wood: "🌳",
  water: "💧",
  fire: "🔥",
  earth: "⛰️",
} as const;

export const SPIRIT_BEAST_ICONS = {
  spirit_metal: "🐉",
  spirit_wood: "🦌",
  spirit_water: "🐢",
  spirit_fire: "🦅",
  spirit_earth: "🐻",
} as const;

export const SOURCE_ICONS = {
  metal_mine: "⛏️",
  wood_forest: "🌲",
  water_spring: "🌊",
  fire_forge: "🌋",
  earth_field: "🌾",
} as const;

export const NGU_HANH_RELATIONS = {
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
} as const;

export const ELEMENT_TILE_BG_COLORS = {
  metal: "bg-gray-500",
  wood: "bg-lime-700",
  water: "bg-blue-700",
  fire: "bg-red-700",
  earth: "bg-amber-700",
  empty: "bg-gray-800",
} as const;

export const UPGRADE_COSTS = {
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
} as const;