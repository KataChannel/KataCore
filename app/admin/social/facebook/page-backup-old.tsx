'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/tailwind-ui';
import { TailwindCard } from '@/components/ui/TailwindCard';
import FacebookConfigurationTab from './components/FacebookConfigurationTab';
import FacebookSyncTab from './components/FacebookSyncTab';
import FacebookUserDataTab from './components/FacebookUserDataTab';

interface FacebookConfig {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
  longLivedToken: string;
  apiVersion: string;
  source: {
    appId: 'env' | 'localStorage' | 'user';
    appSecret: 'env' | 'localStorage' | 'user';
    shortLivedToken: 'env' | 'localStorage' | 'user';
    longLivedToken: 'env' | 'localStorage' | 'user';
    apiVersion: 'env' | 'localStorage' | 'user';
  };
}

export default function FacebookAdminPage() {
  const [currentTab, setCurrentTab] = useState('configuration');
  const [facebookConfig, setFacebookConfig] = useState<FacebookConfig>({
    appId: '',
    appSecret: '',
    shortLivedToken: '',
    longLivedToken: '',
    apiVersion: 'v23.0',
    source: {
      appId: 'env',
      appSecret: 'env',
      shortLivedToken: 'env',
      longLivedToken: 'env',
      apiVersion: 'env'
    }
  });

  useEffect(() => {
    // Load initial configuration
    loadInitialConfig();
  }, []);

  const loadInitialConfig = () => {
    const config: FacebookConfig = {
      appId: '',
      appSecret: '',
      shortLivedToken: '',
      longLivedToken: '',
      apiVersion: 'v23.0',
      source: {
        appId: 'env',
        appSecret: 'env',
        shortLivedToken: 'env',
        longLivedToken: 'env',
        apiVersion: 'env'
      }
    };

    // Load from environment first
    if (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      config.appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET) {
      config.appSecret = process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET;
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN) {
      config.shortLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN;
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN) {
      config.longLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN;
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION) {
      config.apiVersion = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION;
    }

    setFacebookConfig(config);
  };

  const handleConfigUpdate = (newConfig: FacebookConfig) => {
    setFacebookConfig(newConfig);
  };

  const tabs = [
    {
      id: 'configuration',
      label: 'Configuration',
      icon: '⚙️',
      description: 'Manage Facebook API credentials and settings'
    },
    {
      id: 'sync',
      label: 'Sync Data',
      icon: '🔄',
      description: 'Synchronize Facebook data (Pages → Posts → Comments & Messages)'
    },
    {
      id: 'userdata',
      label: 'User Data',
      icon: '👥',
      description: 'View and manage synchronized Facebook user data'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facebook Admin</h1>
              <p className="text-gray-600">Manage Facebook API integration and data synchronization</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === currentTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {currentTab === 'configuration' && (
            <FacebookConfigurationTab onConfigUpdate={handleConfigUpdate} />
          )}

          {currentTab === 'sync' && (
            <FacebookSyncTab config={facebookConfig} />
          )}

          {currentTab === 'userdata' && (
            <FacebookUserDataTab />
          )}
        </div>

        {/* Configuration Status Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <TailwindCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Current Configuration Status</h3>
                  <p className="text-xs text-gray-600">Facebook API integration status</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${facebookConfig.appId ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-600">App ID</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${facebookConfig.shortLivedToken || facebookConfig.longLivedToken ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-600">Token</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${facebookConfig.longLivedToken ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-xs text-gray-600">Long Token</span>
                  </div>
                </div>
              </div>
            </div>
          </TailwindCard>
        </div>
      </div>
    </div>
  );
}
  };

  };

  const tabs = [
    {
      id: 'configuration',
      label: 'Configuration',
      icon: '⚙️',
      description: 'Manage Facebook API credentials and settings'
    },
    {
      id: 'sync',
      label: 'Sync Data',
      icon: '🔄',
      description: 'Synchronize Facebook data (Pages → Posts → Comments & Messages)'
    },
    {
      id: 'userdata',
      label: 'User Data',
      icon: '👥',
      description: 'View and manage synchronized Facebook user data'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facebook Admin</h1>
              <p className="text-gray-600">Manage Facebook API integration and data synchronization</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === currentTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {currentTab === 'configuration' && (
            <FacebookConfigurationTab onConfigUpdate={handleConfigUpdate} />
          )}

          {currentTab === 'sync' && (
            <FacebookSyncTab config={facebookConfig} />
          )}

          {currentTab === 'userdata' && (
            <FacebookUserDataTab />
          )}
        </div>

        {/* Configuration Status Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <TailwindCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Current Configuration Status</h3>
                  <p className="text-xs text-gray-600">Facebook API integration status</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${facebookConfig.appId ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-600">App ID</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${facebookConfig.shortLivedToken || facebookConfig.longLivedToken ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-600">Token</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${facebookConfig.longLivedToken ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-xs text-gray-600">Long Token</span>
                  </div>
                </div>
              </div>
            </div>
          </TailwindCard>
        </div>
      </div>
    </div>
  );
}  const accessibleTabs = tabs.filter(tab => 
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
