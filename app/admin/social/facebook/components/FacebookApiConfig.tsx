import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Input,
  Button,
  Alert,
  Box,
  Chip,
  FormControl,
  FormLabel,
  Switch
} from '@mui/joy';
import { SettingsRounded, CheckCircleRounded, ErrorRounded } from '@mui/icons-material';
import { FacebookApiConfig } from '../types';

interface FacebookApiConfigProps {
  config: FacebookApiConfig;
  isConfigured: boolean;
  onUpdateConfig: (apiKey: string, accessToken: string, saveToLocal?: boolean) => void;
}

export const FacebookApiConfigComponent: React.FC<FacebookApiConfigProps> = ({
  config,
  isConfigured,
  onUpdateConfig
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey || '633015044108937');
  const [accessToken, setAccessToken] = useState(config.accessToken || 'EAAIZCuUzXcokBPOHRJLOAjMeCq1VuLqIZCkELM2237xKcTDSE5DaRWgH2rHVrEZAC1J2iBb4EZBCmZCZCXr03gIUyzS7GsF6AoGZAiCPElgLvuQGpPpigjbSIHgr9MZBx2RH9KowPrzWxaZA1fCXBtUCOzl1al4mZCw1OpqGCtycygZAZAU5XCtZBG0sxBh7v4xZC9EdPf');
  const [saveToLocal, setSaveToLocal] = useState(true);
  const [showTokens, setShowTokens] = useState(false);

  const handleSave = () => {
    if (!apiKey.trim() || !accessToken.trim()) {
      alert('Please enter both API Key and Access Token');
      return;
    }
    onUpdateConfig(apiKey.trim(), accessToken.trim(), saveToLocal);
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'env': return 'success';
      case 'localstorage': return 'primary';
      case 'user_input': return 'warning';
      default: return 'neutral';
    }
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'env': return 'Environment Variables';
      case 'localstorage': return 'Local Storage';
      case 'user_input': return 'User Input';
      default: return 'Not Configured';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SettingsRounded />
          <Typography level="title-md">Facebook API Configuration</Typography>
          {isConfigured ? (
            <CheckCircleRounded color="success" />
          ) : (
            <ErrorRounded color="error" />
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Configuration Source:
          </Typography>
          <Chip 
            color={getSourceColor(config.source)} 
            variant="soft"
            size="sm"
          >
            {getSourceText(config.source)}
          </Chip>
        </Box>

        {!isConfigured && (
          <Alert color="warning" sx={{ mb: 2 }}>
            Facebook API is not configured. Please provide API Key and Access Token to enable sync functionality.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormLabel>Facebook API Key</FormLabel>
            <Input
              type={showTokens ? 'text' : 'password'}
              placeholder="Enter Facebook API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={config.source === 'env'}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Facebook Access Token</FormLabel>
            <Input
              type={showTokens ? 'text' : 'password'}
              placeholder="Enter Facebook Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={config.source === 'env'}
            />
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl orientation="horizontal">
              <FormLabel>Show tokens</FormLabel>
              <Switch
                checked={showTokens}
                onChange={(e) => setShowTokens(e.target.checked)}
              />
            </FormControl>

            <FormControl orientation="horizontal">
              <FormLabel>Save to localStorage</FormLabel>
              <Switch
                checked={saveToLocal}
                onChange={(e) => setSaveToLocal(e.target.checked)}
                disabled={config.source === 'env'}
              />
            </FormControl>
          </Box>

          <Button
            onClick={handleSave}
            disabled={config.source === 'env' || !apiKey.trim() || !accessToken.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Save Configuration
          </Button>
        </Box>

        {config.source === 'env' && (
          <Alert color="primary" sx={{ mt: 2 }}>
            Configuration is loaded from environment variables and cannot be changed here.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
