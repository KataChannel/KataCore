import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemContent
} from '@mui/joy';
import {
  RefreshRounded,
  AccessTimeRounded,
  ErrorRounded,
  CheckCircleRounded,
  StopRounded
} from '@mui/icons-material';
import { SyncStatus } from '../types';

interface SyncStatusComponentProps {
  syncStatus: SyncStatus;
  onCancelSync: () => void;
}

export const SyncStatusComponent: React.FC<SyncStatusComponentProps> = ({
  syncStatus,
  onCancelSync
}) => {
  const formatDuration = (startTime: Date, endTime?: Date): string => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const getStatusColor = () => {
    if (syncStatus.isActive) return 'warning';
    if (syncStatus.errors.length > 0) return 'danger';
    if (syncStatus.lastSyncTime) return 'success';
    return 'neutral';
  };

  const getStatusText = () => {
    if (syncStatus.isActive) return '🔄 Active';
    if (syncStatus.errors.length > 0) return '❌ Error';
    if (syncStatus.lastSyncTime) return '✅ Completed';
    return '⏸️ Idle';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RefreshRounded />
            <Typography level="title-md">Sync Status</Typography>
            <Chip color={getStatusColor()} variant="soft" size="sm">
              {getStatusText()}
            </Chip>
          </Box>
          
          {syncStatus.isActive && (
            <Button
              size="sm"
              variant="outlined"
              color="danger"
              startDecorator={<StopRounded />}
              onClick={onCancelSync}
            >
              Cancel
            </Button>
          )}
        </Box>

        {syncStatus.isActive && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography level="body-sm">{syncStatus.message}</Typography>
              <Typography level="body-sm">
                {syncStatus.processedCount}/{syncStatus.totalCount || '?'}
              </Typography>
            </Box>
            <LinearProgress
              determinate={syncStatus.totalCount > 0}
              value={syncStatus.progress}
              sx={{ mb: 1 }}
            />
            {syncStatus.startTime && (
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                Running for: {formatDuration(syncStatus.startTime)}
                {syncStatus.estimatedTimeRemaining && (
                  <> • ETA: {Math.round(syncStatus.estimatedTimeRemaining / 1000)}s</>
                )}
              </Typography>
            )}
          </Box>
        )}

        {!syncStatus.isActive && syncStatus.lastSyncTime && (
          <Box sx={{ mb: 2 }}>
            <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeRounded fontSize="small" />
              Last sync: {syncStatus.lastSyncTime.toLocaleString()}
            </Typography>
          </Box>
        )}

        {syncStatus.errors.length > 0 && (
          <Alert color="danger" sx={{ mb: 2 }}>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorRounded fontSize="small" />
              Sync Errors ({syncStatus.errors.length})
            </Typography>
            <List size="sm">
              {syncStatus.errors.slice(0, 3).map((error, index) => (
                <ListItem key={index}>
                  <ListItemContent>
                    <Typography level="body-xs">{error}</Typography>
                  </ListItemContent>
                </ListItem>
              ))}
              {syncStatus.errors.length > 3 && (
                <ListItem>
                  <ListItemContent>
                    <Typography level="body-xs" sx={{ fontStyle: 'italic' }}>
                      ... and {syncStatus.errors.length - 3} more errors
                    </Typography>
                  </ListItemContent>
                </ListItem>
              )}
            </List>
          </Alert>
        )}

        {syncStatus.syncHistory.length > 0 && (
          <Box>
            <Typography level="title-sm" sx={{ mb: 1 }}>Recent Sync History</Typography>
            <List size="sm">
              {syncStatus.syncHistory.slice(0, 5).map((sync, index) => (
                <ListItem key={index}>
                  <ListItemContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {sync.success ? (
                          <CheckCircleRounded color="success" fontSize="small" />
                        ) : (
                          <ErrorRounded color="error" fontSize="small" />
                        )}
                        <Typography level="body-xs">
                          {sync.type} sync • {sync.itemsProcessed} items
                        </Typography>
                      </Box>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        {formatDuration(sync.startTime, sync.endTime)}
                      </Typography>
                    </Box>
                    <Typography level="body-xs" sx={{ color: 'text.secondary', ml: 3 }}>
                      {sync.startTime.toLocaleString()}
                    </Typography>
                  </ListItemContent>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
