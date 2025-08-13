'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip, Stack } from '@mui/joy';
import { MoreVert } from '@mui/icons-material';

interface OptimizedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'plain' | 'outlined' | 'soft' | 'solid';
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  loading?: boolean;
  actions?: React.ReactNode;
  tags?: string[];
  orientation?: 'horizontal' | 'vertical';
}

export function OptimizedCard({
  children,
  title,
  subtitle,
  variant = 'outlined',
  color = 'neutral',
  size = 'md',
  hover = true,
  loading = false,
  actions,
  tags,
  orientation = 'vertical'
}: OptimizedCardProps) {
  const sizeMap = {
    sm: { p: 2, gap: 1 },
    md: { p: 3, gap: 2 },
    lg: { p: 4, gap: 3 }
  };

  const currentSize = sizeMap[size];

  return (
    <Card
      variant={variant}
      color={color}
      orientation={orientation}
      sx={{
        transition: 'all 0.2s ease-in-out',
        ...(hover && {
          '&:hover': {
            boxShadow: 'md',
            transform: 'translateY(-2px)',
          },
        }),
        ...(loading && {
          opacity: 0.7,
          pointerEvents: 'none',
        }),
      }}
    >
      {/* Header */}
      {(title || subtitle || actions || tags) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: currentSize.gap,
          }}
        >
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography
                level={size === 'sm' ? 'title-sm' : size === 'lg' ? 'h4' : 'title-md'}
                sx={{ mb: subtitle ? 0.5 : 0 }}
              >
                {title}
              </Typography>
            )}
            
            {subtitle && (
              <Typography
                level="body-sm"
                sx={{ opacity: 0.7 }}
              >
                {subtitle}
              </Typography>
            )}

            {tags && tags.length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ mt: 1, flexWrap: 'wrap' }}
              >
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    variant="soft"
                    color="primary"
                  >
                    {tag}
                  </Chip>
                ))}
              </Stack>
            )}
          </Box>

          {actions && (
            <Box sx={{ ml: 2 }}>
              {actions}
            </Box>
          )}
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ p: 0 }}>
        {children}
      </CardContent>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.surface',
            opacity: 0.8,
            borderRadius: 'inherit',
          }}
        >
          <Typography level="body-sm">Loading...</Typography>
        </Box>
      )}
    </Card>
  );
}

// Predefined card variants
export function InfoCard({ children, ...props }: Omit<OptimizedCardProps, 'variant' | 'color'>) {
  return (
    <OptimizedCard variant="soft" color="primary" {...props}>
      {children}
    </OptimizedCard>
  );
}

export function SuccessCard({ children, ...props }: Omit<OptimizedCardProps, 'variant' | 'color'>) {
  return (
    <OptimizedCard variant="soft" color="success" {...props}>
      {children}
    </OptimizedCard>
  );
}

export function WarningCard({ children, ...props }: Omit<OptimizedCardProps, 'variant' | 'color'>) {
  return (
    <OptimizedCard variant="soft" color="warning" {...props}>
      {children}
    </OptimizedCard>
  );
}

export function DangerCard({ children, ...props }: Omit<OptimizedCardProps, 'variant' | 'color'>) {
  return (
    <OptimizedCard variant="soft" color="danger" {...props}>
      {children}
    </OptimizedCard>
  );
}
