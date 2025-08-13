'use client';

import React from 'react';
import { Box, Sheet, Typography, IconButton, Stack } from '@mui/joy';
import { ThemeToggle } from '@/components/theme/SimpleThemeManager';
import { useTheme } from '@/hooks/useSimpleTheme';
import { Menu, Close, Settings } from '@mui/icons-material';

interface OptimizedLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showThemeToggle?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
}

export function OptimizedLayout({
  children,
  title = 'TazaCore',
  showHeader = true,
  showThemeToggle = true,
  maxWidth = 'lg'
}: OptimizedLayoutProps) {
  const { actualMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.body',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      {showHeader && (
        <Sheet
          variant="outlined"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            backdropFilter: 'blur(8px)',
            bgcolor: 'background.surface',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2, sm: 3 },
              py: 1.5,
              maxWidth: maxWidth === false ? '100%' : `${maxWidth}.contentWidth`,
              mx: 'auto',
              width: '100%',
            }}
          >
            {/* Left side */}
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                variant="plain"
                size="sm"
                sx={{ display: { sm: 'none' } }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <Close /> : <Menu />}
              </IconButton>
              
              <Typography
                level="h4"
                sx={{
                  fontWeight: 'bold',
                  background: actualMode === 'dark' 
                    ? 'linear-gradient(45deg, #38bdf8, #7dd3fc)'
                    : 'linear-gradient(45deg, #0ea5e9, #38bdf8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {title}
              </Typography>
            </Stack>

            {/* Right side */}
            <Stack direction="row" spacing={1} alignItems="center">
              {showThemeToggle && <ThemeToggle size="sm" variant="outlined" />}
              
              <IconButton
                variant="outlined"
                size="sm"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                <Settings />
              </IconButton>
            </Stack>
          </Box>
        </Sheet>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, sm: 3 },
          py: 3,
          maxWidth: maxWidth === false ? '100%' : `${maxWidth}.contentWidth`,
          mx: 'auto',
          width: '100%',
        }}
      >
        {children}
      </Box>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <Sheet
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            display: { sm: 'none' },
            bgcolor: 'background.backdrop',
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <Sheet
            variant="outlined"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 280,
              height: '100%',
              p: 2,
              boxShadow: 'lg',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography level="h4">Menu</Typography>
              <IconButton size="sm" onClick={() => setSidebarOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            {/* Sidebar content can be added here */}
            <Stack spacing={1}>
              <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                Navigation items will be here
              </Typography>
            </Stack>
          </Sheet>
        </Sheet>
      )}
    </Box>
  );
}
