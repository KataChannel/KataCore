'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Tabs,
  TabList,
  Tab,
  Alert,
  Typography,
  Card,
  CardContent,
  IconButton,
  Sheet
} from '@mui/joy';
import {
  FacebookRounded,
  RefreshRounded,
  SettingsRounded,
  DashboardRounded,
  TableViewRounded,
  SecurityRounded,
  InfoRounded
} from '@mui/icons-material';

// Components
import { FacebookApiConfigComponent } from './components/FacebookApiConfig';
import { SyncStatusComponent } from './components/SyncStatus';
import { UserDataTable } from './components/UserDataTable';
import { PermissionManager } from './components/PermissionManager';

// Services
import { PermissionService } from './services/PermissionService';

// Hooks
import { useFacebookData } from './hooks/useFacebookData';

export default function FacebookAdminPage() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const userInfo = PermissionService.getCurrentUserInfo();

  // Initialize filters for Facebook data
  const initialFilters = {
    type: 'all' as const,
    searchTerm: '',
    sortField: 'lastTime',
    sortDirection: 'desc' as const,
    selectedPage: 'all-pages'
  };

  // Use real Facebook data hook
  const {
    userData,
    loading,
    error,
    pagination,
    pages,
    filters,
    updateFilters,
    updatePagination,
    refreshData,
    exportData
  } = useFacebookData(initialFilters);

  // Demo data for other components
  const demoSyncStatus = {
    isActive: false,
    progress: 0,
    currentOperation: '',
    lastSyncTime: new Date(),
    totalItems: 0,
    processedItems: 0,
    errors: [],
    message: 'Ready to sync',
    processedCount: 0,
    totalCount: 0,
    syncHistory: []
  };

  const demoConfig = {
    appId: '',
    appSecret: '',
    accessToken: '',
    longLiveAccessToken: '',
    isLongLiveToken: false,
    pageIds: [],
    source: 'user_input' as const
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refreshData(); // Also refresh Facebook data
  };

  const handleRoleChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardRounded />,
      permission: 'canViewDashboard'
    },
    {
      id: 'sync',
      label: 'Sync Data',
      icon: <RefreshRounded />,
      permission: 'canViewSync'
    },
    {
      id: 'users',
      label: 'User Data',
      icon: <TableViewRounded />,
      permission: 'canViewDashboard'
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: <SettingsRounded />,
      permission: 'canViewConfig'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: <SecurityRounded />,
      permission: 'canViewDashboard'
    }
  ];

  const accessibleTabs = tabs.filter(tab => 
    userInfo.permissions[tab.permission as keyof typeof userInfo.permissions]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FacebookRounded sx={{ fontSize: 40, color: '#1877F2' }} />
            <Box>
              <Typography level="h1" component="h1">
                Facebook Admin
              </Typography>
              <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
                Manage Facebook API integration and data synchronization
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Role: <strong>{userInfo.role?.name}</strong>
            </Typography>
            <IconButton 
              variant="outlined" 
              size="sm" 
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <RefreshRounded />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Permission Alert */}
      {userInfo.roleId === 'viewer' && (
        <Alert 
          color="warning" 
          variant="soft" 
          sx={{ mb: 3 }}
          startDecorator={<InfoRounded />}
        >
          You have limited access as a Viewer. Contact an Administrator for elevated permissions.
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Sheet variant="outlined" sx={{ borderRadius: 'md', p: 1, mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, value) => setCurrentTab(value as string)}
          sx={{ backgroundColor: 'transparent' }}
        >
          <TabList>
            {accessibleTabs.map(tab => (
              <Tab key={tab.id} value={tab.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Sheet>

      {/* Tab Content */}
      <Box key={refreshKey}>
        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && userInfo.permissions.canViewDashboard && (
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <SyncStatusComponent 
                syncStatus={demoSyncStatus}
                onCancelSync={() => {}}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  {userInfo.permissions.canPerformSync && (
                    <Alert color="neutral" variant="soft">
                      Sync controls will be available once API is configured.
                    </Alert>
                  )}
                  {!userInfo.permissions.canPerformSync && (
                    <Alert color="warning" variant="soft">
                      You don't have permission to perform sync operations.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12}>
              <Card>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    Recent Activity
                  </Typography>
                  <Alert color="neutral" variant="soft">
                    Activity tracking will be implemented in future updates.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Sync Tab */}
        {currentTab === 'sync' && userInfo.permissions.canViewSync && (
          <Grid container spacing={3}>
            <Grid xs={12} md={4}>
              <SyncStatusComponent 
                syncStatus={demoSyncStatus}
                onCancelSync={() => {}}
              />
            </Grid>
            <Grid xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    Sync Operations
                  </Typography>
                  {userInfo.permissions.canPerformSync ? (
                    <Alert color="neutral" variant="soft">
                      Sync controls will be available once API service is fully configured.
                    </Alert>
                  ) : (
                    <Alert color="warning" variant="soft">
                      You can view sync status but cannot perform sync operations. 
                      Contact an Administrator for sync permissions.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* User Data Tab */}
        {currentTab === 'users' && userInfo.permissions.canViewDashboard && (
          <Box>
            {error && (
              <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <UserDataTable 
              userData={userData}
              loading={loading}
              pagination={pagination}
              filters={filters}
              pages={pages}
              onUpdateFilters={updateFilters}
              onUpdatePagination={updatePagination}
              onExportData={exportData}
            />
          </Box>
        )}

        {/* Configuration Tab */}
        {currentTab === 'config' && userInfo.permissions.canViewConfig && (
          <Box>
            <FacebookApiConfigComponent 
              config={demoConfig}
              isConfigured={false}
              onUpdateConfig={() => {}}
            />
            {!userInfo.permissions.canEditConfig && (
              <Alert color="primary" variant="soft" sx={{ mt: 2 }}>
                Configuration is in read-only mode. Contact an Administrator to make changes.
              </Alert>
            )}
          </Box>
        )}

        {/* Permissions Tab */}
        {currentTab === 'permissions' && userInfo.permissions.canViewDashboard && (
          <Box>
            <PermissionManager onRoleChange={handleRoleChange} />
          </Box>
        )}

        {/* No Permission Message */}
        {!accessibleTabs.find(tab => tab.id === currentTab) && (
          <Alert color="danger" variant="soft">
            You don't have permission to access this section.
          </Alert>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', textAlign: 'center' }}>
          Facebook Admin Panel - Built with Next.js 15 & Joy UI
        </Typography>
      </Box>
    </Container>
  );
}
