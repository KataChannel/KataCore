import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  Option,
  Box,
  Divider,
  Alert,
  ButtonGroup
} from '@mui/joy';
import {
  SyncRounded,
  RefreshRounded,
  FacebookRounded,
  PostAddRounded,
  ChatBubbleRounded,
  EmailRounded
} from '@mui/icons-material';
import { FacebookPage } from '../types';

interface SyncControlsProps {
  pages: FacebookPage[];
  isConfigured: boolean;
  isSyncing: boolean;
  onSync: (pageId: string, syncType: 'posts' | 'comments' | 'messages' | 'all') => void;
  onRefreshPages: () => void;
}

export const SyncControls: React.FC<SyncControlsProps> = ({
  pages,
  isConfigured,
  isSyncing,
  onSync,
  onRefreshPages
}) => {
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [selectedSyncType, setSelectedSyncType] = useState<'posts' | 'comments' | 'messages' | 'all'>('all');

  const handleSync = () => {
    onSync(selectedPage, selectedSyncType);
  };

  const getSyncTypeIcon = (type: string) => {
    switch (type) {
      case 'posts': return <PostAddRounded />;
      case 'comments': return <ChatBubbleRounded />;
      case 'messages': return <EmailRounded />;
      default: return <SyncRounded />;
    }
  };

  const getSyncTypeLabel = (type: string) => {
    switch (type) {
      case 'posts': return '📝 Posts';
      case 'comments': return '💬 Comments';
      case 'messages': return '✉️ Messages';
      default: return '🔄 All Data';
    }
  };

  const activePages = pages.filter(p => p.isActive);

  return (
    <Card>
      <CardContent>
        <Typography level="title-md" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FacebookRounded color="primary" />
          Sync Controls
        </Typography>

        {!isConfigured && (
          <Alert color="warning" sx={{ mb: 2 }}>
            Facebook API is not configured. Please configure API settings first to enable sync functionality.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Page Selection */}
          <Box>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Select Facebook Page:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Select
                value={selectedPage}
                onChange={(_, value) => setSelectedPage(value as string)}
                disabled={!isConfigured || isSyncing}
                sx={{ flexGrow: 1 }}
              >
                <Option value="all">
                  🌐 All Pages ({activePages.length})
                </Option>
                {pages.map(page => (
                  <Option key={page.id} value={page.id} disabled={!page.isActive}>
                    📘 {page.name} {!page.isActive && '(Inactive)'}
                  </Option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="outlined"
                onClick={onRefreshPages}
                disabled={!isConfigured || isSyncing}
                startDecorator={<RefreshRounded />}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Sync Type Selection */}
          <Box>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Select Data Type to Sync:
            </Typography>
            <ButtonGroup
              variant="outlined"
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
            >
              <Button
                variant={selectedSyncType === 'all' ? 'solid' : 'outlined'}
                onClick={() => setSelectedSyncType('all')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<SyncRounded />}
                sx={{ flex: 1, minWidth: '140px' }}
              >
                All Data
              </Button>
              <Button
                variant={selectedSyncType === 'posts' ? 'solid' : 'outlined'}
                onClick={() => setSelectedSyncType('posts')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<PostAddRounded />}
                sx={{ flex: 1, minWidth: '140px' }}
              >
                Posts Only
              </Button>
              <Button
                variant={selectedSyncType === 'comments' ? 'solid' : 'outlined'}
                onClick={() => setSelectedSyncType('comments')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<ChatBubbleRounded />}
                sx={{ flex: 1, minWidth: '140px' }}
              >
                Comments Only
              </Button>
              <Button
                variant={selectedSyncType === 'messages' ? 'solid' : 'outlined'}
                onClick={() => setSelectedSyncType('messages')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<EmailRounded />}
                sx={{ flex: 1, minWidth: '140px' }}
              >
                Messages Only
              </Button>
            </ButtonGroup>
          </Box>

          <Divider />

          {/* Sync Actions */}
          <Box>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Sync Actions:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                color="primary"
                size="lg"
                onClick={handleSync}
                disabled={!isConfigured || isSyncing}
                loading={isSyncing}
                startDecorator={getSyncTypeIcon(selectedSyncType)}
                sx={{ flex: 1, minWidth: '200px' }}
              >
                {isSyncing ? 'Syncing...' : `Sync ${getSyncTypeLabel(selectedSyncType)}`}
              </Button>
            </Box>
          </Box>

          {/* Quick Action Buttons */}
          <Box>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Quick Actions:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => onSync('all', 'posts')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<PostAddRounded />}
              >
                Sync All Posts
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => onSync('all', 'comments')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<ChatBubbleRounded />}
              >
                Sync All Comments
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => onSync('all', 'messages')}
                disabled={!isConfigured || isSyncing}
                startDecorator={<EmailRounded />}
              >
                Sync All Messages
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Info about selected options */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.level1', borderRadius: 'sm' }}>
          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            <strong>Selected:</strong> {' '}
            {selectedPage === 'all' ? 
              `All ${activePages.length} active pages` : 
              pages.find(p => p.id === selectedPage)?.name || 'Unknown page'
            } • {getSyncTypeLabel(selectedSyncType)}
          </Typography>
          {selectedPage === 'all' && activePages.length > 1 && (
            <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
              ⚠️ Syncing all pages may take longer and consume more API quota.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
