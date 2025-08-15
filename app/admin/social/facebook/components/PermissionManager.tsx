import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Select,
  Option,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemContent
} from '@mui/joy';
import {
  SecurityRounded,
  AdminPanelSettingsRounded,
  PersonRounded,
  VisibilityRounded
} from '@mui/icons-material';
import { PermissionService } from '../services/PermissionService';

interface PermissionManagerProps {
  onRoleChange?: (roleId: string) => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  onRoleChange
}) => {
  const userInfo = PermissionService.getCurrentUserInfo();
  const allRoles = PermissionService.getAllRoles();

  const handleRoleChange = (newRoleId: string | null) => {
    if (!newRoleId) return;
    
    PermissionService.setUserRole(newRoleId);
    onRoleChange?.(newRoleId);
    window.location.reload(); // Refresh to apply new permissions
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'super_admin':
      case 'admin':
        return <AdminPanelSettingsRounded color="error" />;
      case 'manager':
        return <PersonRounded color="warning" />;
      case 'analyst':
        return <VisibilityRounded color="primary" />;
      default:
        return <PersonRounded color="disabled" />;
    }
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'super_admin': return 'danger';
      case 'admin': return 'warning';
      case 'manager': return 'primary';
      case 'analyst': return 'success';
      default: return 'neutral';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography level="title-md" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SecurityRounded />
          Permission Management
        </Typography>

        {/* Current Role */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Current Role:
          </Typography>
          <Chip
            color={getRoleColor(userInfo.roleId) as any}
            variant="soft"
            size="lg"
            startDecorator={getRoleIcon(userInfo.roleId)}
          >
            {userInfo.role?.name || 'Unknown Role'}
          </Chip>
        </Box>

        {/* Role Selection */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Change Role:
          </Typography>
          <Select
            value={userInfo.roleId}
            onChange={(_, value) => handleRoleChange(value)}
            sx={{ minWidth: 200 }}
          >
            {allRoles.map(role => (
              <Option key={role.id} value={role.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getRoleIcon(role.id)}
                  {role.name}
                </Box>
              </Option>
            ))}
          </Select>
        </Box>

        {/* Current Permissions */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Current Permissions:
          </Typography>
          <List size="sm">
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>View Dashboard</span>
                  <Chip size="sm" color={userInfo.permissions.canViewDashboard ? 'success' : 'danger'} variant="soft">
                    {userInfo.permissions.canViewDashboard ? '✅' : '❌'}
                  </Chip>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>View Sync</span>
                  <Chip size="sm" color={userInfo.permissions.canViewSync ? 'success' : 'danger'} variant="soft">
                    {userInfo.permissions.canViewSync ? '✅' : '❌'}
                  </Chip>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Perform Sync</span>
                  <Chip size="sm" color={userInfo.permissions.canPerformSync ? 'success' : 'danger'} variant="soft">
                    {userInfo.permissions.canPerformSync ? '✅' : '❌'}
                  </Chip>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>View Configuration</span>
                  <Chip size="sm" color={userInfo.permissions.canViewConfig ? 'success' : 'danger'} variant="soft">
                    {userInfo.permissions.canViewConfig ? '✅' : '❌'}
                  </Chip>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Edit Configuration</span>
                  <Chip size="sm" color={userInfo.permissions.canEditConfig ? 'success' : 'danger'} variant="soft">
                    {userInfo.permissions.canEditConfig ? '✅' : '❌'}
                  </Chip>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Export Data</span>
                  <Chip size="sm" color={userInfo.permissions.canExportData ? 'success' : 'danger'} variant="soft">
                    {userInfo.permissions.canExportData ? '✅' : '❌'}
                  </Chip>
                </Box>
              </ListItemContent>
            </ListItem>
          </List>
        </Box>

        {/* Accessible Tabs */}
        <Box>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Accessible Tabs:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {userInfo.accessibleTabs.map(tab => (
              <Chip key={tab} color="primary" variant="soft" size="sm">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Chip>
            ))}
          </Box>
        </Box>

        {userInfo.role && (
          <Alert color="primary" sx={{ mt: 2 }}>
            <Typography level="body-sm">
              <strong>{userInfo.role.name}:</strong> {userInfo.role.description}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
