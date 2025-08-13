'use client';

import React from 'react';
import { Box, Card, Typography, Button, Input, Divider } from '@mui/joy';
import { 
  ThemeToggle, 
  ThemeSwitch, 
  ThemeSelect, 
  CompactThemeControls, 
  FullThemeControls 
} from '@/components/theme/SimpleThemeManager';
import { useTheme } from '@/hooks/useSimpleTheme';

export function SimpleThemeDemo() {
  const { mode, actualMode } = useTheme();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          Simple Theme System Demo
        </Typography>
        
        <Typography level="body-md" sx={{ mb: 3 }}>
          Current mode: <strong>{mode}</strong> (actual: <strong>{actualMode}</strong>)
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <ThemeToggle showLabel />
          <CompactThemeControls />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card variant="soft" sx={{ p: 3 }}>
            <Typography level="h4" sx={{ mb: 2 }}>Theme Controls</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ThemeSwitch />
              <ThemeSelect />
            </Box>
          </Card>

          <Card variant="soft" sx={{ p: 3 }}>
            <Typography level="h4" sx={{ mb: 2 }}>Component Showcase</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="solid" color="primary">
                Primary Button
              </Button>
              <Button variant="outlined" color="neutral">
                Secondary Button
              </Button>
              <Input placeholder="Sample input field" />
            </Box>
          </Card>
        </Box>
      </Card>

      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 3 }}>Full Theme Settings</Typography>
        <FullThemeControls />
      </Card>

      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 3 }}>Tailwind + Theme Variables</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <div className="theme-card-elevated p-4">
            <h4 className="theme-fg font-semibold mb-2">Theme Card</h4>
            <p className="theme-muted text-sm">Using theme variables with Tailwind</p>
            <button className="theme-button mt-2">Theme Button</button>
          </div>
          
          <div className="bg-theme-card border border-theme-border rounded-theme-lg p-4">
            <h4 className="text-theme-fg font-semibold mb-2">Tailwind Classes</h4>
            <p className="text-theme-muted text-sm">Using Tailwind utility classes</p>
            <button className="bg-theme-accent text-white px-4 py-2 rounded-theme mt-2 hover:opacity-90 transition-all">
              Utility Button
            </button>
          </div>
        </Box>
      </Card>
    </Box>
  );
}
