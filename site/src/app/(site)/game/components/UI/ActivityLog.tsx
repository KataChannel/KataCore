import type { LogEntry } from '../../types/game.types';

interface ActivityLogProps {
  logs: LogEntry[];
}

export const ActivityLog = ({ logs }: ActivityLogProps) => {
  const recentLogs = logs.slice(-50).reverse(); // Show last 50 logs, most recent first

  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-3">Activity Log</h3>
      {recentLogs.length === 0 ? (
        <p className="text-gray-400 text-sm">No activity yet...</p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {recentLogs.map((log, index) => (
            <div
              key={`${log.timestamp}-${index}`}
              className={`text-xs p-2 rounded ${
                log.type === 'success' ? 'bg-green-900/30 text-green-300' :
                log.type === 'error' ? 'bg-red-900/30 text-red-300' :
                'bg-gray-700/50 text-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="flex-1">{log.message}</span>
                <span className="text-gray-500 ml-2 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};