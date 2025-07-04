'use client';

import { useState } from 'react';
import type { GameState, LogEntry } from '../types/game.types';
import { ResourcePanel } from './Panels/ResourcePanel';

import { GAME_PHASES } from '../constants/game.constants';
import { MapDisplay } from './Map/MapDisplay';
import { SourcePanel } from './Panels/SourcePanel';
import { SpiritBeastPanel } from './Panels/SpiritBeastPanel';
import { ActivityLog } from './UI/ActivityLog';

interface GameLayoutProps {
  gameState: GameState;
  logs: LogEntry[];
  isAutoHarvesting: boolean;
  animatedResourceChanges: Record<string, number>;
  activeSpiritBeastBonuses: Record<string, number>;
  actions: {
    discoverTile: (row: number, col: number) => void;
    activateTile: (row: number, col: number) => void;
    harvestSource: (sourceId: string) => void;
    toggleAutoHarvest: () => void;
  };
}

export const GameLayout = ({
  gameState,
  logs,
  isAutoHarvesting,
  animatedResourceChanges,
  activeSpiritBeastBonuses,
  actions
}: GameLayoutProps) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'spirits' | 'logs'>('sources');

  const currentMapData = gameState.maps[gameState.currentMapId];
  const isAdvancedPhase = gameState.currentMapId === GAME_PHASES.ADVANCED;

  if (!currentMapData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">No map data available</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Left Panel - Resources & Controls */}
      <div className="lg:w-80 space-y-4">
        {/* Resource Panel */}
        <ResourcePanel
          resources={gameState.resources}
          animatedResourceChanges={animatedResourceChanges}
          activeSpiritBeastBonuses={activeSpiritBeastBonuses}
        />

        {/* Auto Harvest Control */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Auto Harvest</span>
            <button
              onClick={actions.toggleAutoHarvest}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isAutoHarvesting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {isAutoHarvesting ? 'ON' : 'OFF'}
            </button>
          </div>
          {isAutoHarvesting && (
            <p className="text-xs text-gray-400 mt-2">
              Automatically harvesting ready sources every second
            </p>
          )}
        </div>

        {/* Phase Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current Phase</h3>
          <p className="text-sm text-gray-300">
            {isAdvancedPhase ? 'Advanced Exploration' : 'Initial Discovery'}
          </p>
          {gameState.unlockedTier2Upgrades && (
            <p className="text-xs text-green-400 mt-1">
              ✨ Tier 2 upgrades unlocked!
            </p>
          )}
        </div>
      </div>

      {/* Center Panel - Map */}
      <div className="flex-1">
        <MapDisplay
          mapData={currentMapData}
          onTileClick={(row, col) => {
            const tile = currentMapData.map[row][col];
            if (!tile.isDiscovered) {
              actions.discoverTile(row, col);
            } else if (!tile.isActive && tile.type !== 'empty') {
              actions.activateTile(row, col);
            }
          }}
        />
      </div>

      {/* Right Panel - Tabs */}
      <div className="lg:w-80">
        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-t-lg">
          {[
            { key: 'sources', label: 'Sources', icon: '⛏️' },
            { key: 'spirits', label: 'Spirits', icon: '🐉' },
            { key: 'logs', label: 'Logs', icon: '📜' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-b-lg p-4 h-96 overflow-y-auto">
          {activeTab === 'sources' && (
            <SourcePanel
              sources={currentMapData.sources}
              resources={gameState.resources}
              unlockedTier2Upgrades={gameState.unlockedTier2Upgrades}
              onHarvestSource={actions.harvestSource}
            />
          )}

          {activeTab === 'spirits' && (
            <SpiritBeastPanel
              spiritBeasts={currentMapData.spiritBeasts}
              resources={gameState.resources}
              unlockedTier2Upgrades={gameState.unlockedTier2Upgrades}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityLog logs={logs} />
          )}
        </div>
      </div>
    </div>
  );
};