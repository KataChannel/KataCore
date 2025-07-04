import { 
  RESOURCE_ICONS, 
  SPIRIT_BEAST_ICONS, 
  SOURCE_ICONS, 
  NGU_HANH_RELATIONS,
  UPGRADE_COSTS,
  GAME_CONFIG
} from '../constants/game.constants';
import type { GameSource, SpiritBeast, GameResources } from '../types/game.types';

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getIconForType = (type: string): string => {
  return (
    RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS] ||
    SPIRIT_BEAST_ICONS[type as keyof typeof SPIRIT_BEAST_ICONS] ||
    SOURCE_ICONS[type as keyof typeof SOURCE_ICONS] ||
    ""
  );
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export const calculateUpgradeCosts = (
  item: GameSource | SpiritBeast,
  itemType: 'source' | 'spiritBeast',
  unlockedTier2: boolean
) => {
  const config:any = UPGRADE_COSTS[itemType];
  const isSource = itemType === 'source';
  
  const primaryResourceType = NGU_HANH_RELATIONS.elementMap[item.type as keyof typeof NGU_HANH_RELATIONS.elementMap];
  const secondaryResourceType = isSource 
    ? NGU_HANH_RELATIONS.overcomes[primaryResourceType as keyof typeof NGU_HANH_RELATIONS.overcomes]
    : NGU_HANH_RELATIONS.generates[primaryResourceType as keyof typeof NGU_HANH_RELATIONS.generates];

  const currentMultiplier = item.level < GAME_CONFIG.MAX_LEVEL_INITIAL_TIER
    ? config.multiplier
    : config.tier2Multiplier;

  const primaryCost = Math.floor(
    (isSource ? config.basePrimary : config.basePrimary) * 
    Math.pow(currentMultiplier, item.level - 1)
  );
  
  const secondaryCost = Math.floor(
    (isSource ? config.baseOpposite : config.baseGenerates) * 
    Math.pow(currentMultiplier, item.level - 1)
  );

  return {
    primaryResourceType,
    secondaryResourceType,
    primaryCost,
    secondaryCost,
  };
};

export const canAffordUpgrade = (
  resources: GameResources,
  costs: ReturnType<typeof calculateUpgradeCosts>
): boolean => {
  return resources[costs.primaryResourceType as keyof GameResources] >= costs.primaryCost &&
         resources[costs.secondaryResourceType as keyof GameResources] >= costs.secondaryCost;
};

export const formatSourceName = (type: string): string => {
  return type
    .replace("_", " ")
    .replace("mine", "Mine")
    .replace("forest", "Forest")
    .replace("spring", "Spring")
    .replace("forge", "Forge")
    .replace("field", "Field");
};