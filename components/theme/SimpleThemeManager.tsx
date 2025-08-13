'use client';

import React from 'react';
import { IconButton, Typography, Box, Switch, FormControl, FormLabel } from '@mui/joy';
import { 
  LightModeOutlined,
  DarkModeOutlined,
  Brightness6Outlined,
  SettingsOutlined 
} from '@mui/icons-material';
import { useTheme, type ThemeMode } from '@/hooks/useSimpleTheme';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'plain' | 'outlined' | 'soft' | 'solid';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  size = 'md', 
  variant = 'outlined',
  showLabel = false 
}: ThemeToggleProps) {
  const { actualMode, toggleMode } = useTheme();
  
  const Icon = actualMode === 'light' ? DarkModeOutlined : LightModeOutlined;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        variant={variant}
        size={size}
        onClick={toggleMode}
        aria-label={`Switch to ${actualMode === 'light' ? 'dark' : 'light'} mode`}
      >
        <Icon />
      </IconButton>
      {showLabel && (
        <Typography level="body-sm">
          {actualMode === 'light' ? 'Light' : 'Dark'} mode
        </Typography>
      )}
    </Box>
  );
}

interface ThemeSwitchProps {
  showLabel?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function ThemeSwitch({ showLabel = true, orientation = 'horizontal' }: ThemeSwitchProps) {
  const { actualMode, toggleMode } = useTheme();
  
  return (
    <FormControl orientation={orientation}>
      {showLabel && (
        <FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightModeOutlined fontSize="small" />
            Theme Mode
            <DarkModeOutlined fontSize="small" />
          </Box>
        </FormLabel>
      )}
      <Switch
        checked={actualMode === 'dark'}
        onChange={toggleMode}
        startDecorator={<LightModeOutlined />}
        endDecorator={<DarkModeOutlined />}
        slotProps={{
          input: { 'aria-label': 'Toggle theme mode' },
        }}
      />
    </FormControl>
  );
}

interface ThemeSelectProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeSelect({ showLabel = true, size = 'md' }: ThemeSelectProps) {
  const { mode, setMode } = useTheme();
  
  const modes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <LightModeOutlined /> },
    { value: 'dark', label: 'Dark', icon: <DarkModeOutlined /> },
    { value: 'system', label: 'System', icon: <Brightness6Outlined /> },
  ];
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {showLabel && (
        <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsOutlined fontSize="small" />
          Theme Mode
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {modes.map(({ value, label, icon }) => (
          <IconButton
            key={value}
            variant={mode === value ? 'solid' : 'outlined'}
            size={size}
            onClick={() => setMode(value)}
            sx={{ 
              flexDirection: 'column',
              gap: 0.5,
              minHeight: 60,
              minWidth: 60,
            }}
            aria-label={`Switch to ${label} mode`}
          >
            {icon}
            <Typography level="body-xs">{label}</Typography>
          </IconButton>
        ))}
      </Box>
    </Box>
  );
}

// Compact theme controls for headers/navigation
export function CompactThemeControls() {
  return <ThemeToggle size="sm" variant="plain" />;
}

// Full theme controls for settings pages
export function FullThemeControls() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography level="h4">Theme Settings</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ThemeSelect />
        <ThemeSwitch />
      </Box>
    </Box>
  );
}
