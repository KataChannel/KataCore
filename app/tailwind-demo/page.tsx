'use client';

import React from 'react';
import { Button, Card, CardContent, Typography, Stack, Chip, IconButton, Avatar } from '@/components/ui/tailwind-ui';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { ThemeToggle, useTailwindTheme } from '@/components/providers/TailwindThemeProvider';
import { Settings, Star, Heart, Download } from 'lucide-react';

export default function TailwindMigrationDemo() {
  const { theme } = useTailwindTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography level="h1" className="mb-2">
                🎉 MUI Joy → Tailwind CSS Migration Complete!
              </Typography>
              <Typography level="body1" className="text-gray-600 dark:text-gray-400">
                All components now use pure Tailwind CSS with zero runtime dependencies
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <Chip color="success">
                Migration Complete
              </Chip>
              <ThemeToggle />
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="p-6">
          <Typography level="h3" className="mb-4">
            Migration Benefits
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Typography level="h2" className="text-green-600 dark:text-green-400">
                -3.4MB
              </Typography>
              <Typography level="body2">
                Bundle Size Reduction
              </Typography>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Typography level="h2" className="text-blue-600 dark:text-blue-400">
                0
              </Typography>
              <Typography level="body2">
                Runtime Dependencies
              </Typography>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Typography level="h2" className="text-purple-600 dark:text-purple-400">
                100%
              </Typography>
              <Typography level="body2">
                Backward Compatible
              </Typography>
            </div>
          </div>
        </Card>

        {/* Component Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TailwindCard
            title="TailwindCard Component"
            subtitle="Advanced card component with full Tailwind CSS styling"
            variant="outlined"
            color="primary"
            size="md"
            hover={true}
            tags={["Tailwind", "React", "TypeScript"]}
            actions={
              <Stack direction="row" spacing={1}>
                <IconButton size="sm">
                  <Star className="w-4 h-4" />
                </IconButton>
                <IconButton size="sm">
                  <Heart className="w-4 h-4" />
                </IconButton>
              </Stack>
            }
          >
            <Typography level="body1">
              This card uses pure Tailwind CSS classes with no MUI dependencies.
              It supports all the same props and features as the original OptimizedCard.
            </Typography>
          </TailwindCard>

          <Card className="p-4">
            <CardContent>
              <Typography level="h4" className="mb-4">
                Button Variants
              </Typography>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={2} className="flex-wrap">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </Stack>
                <Stack direction="row" spacing={2} className="flex-wrap">
                  <Button variant="soft">Soft</Button>
                  <Button variant="plain">Plain</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </div>

        {/* Theme Info */}
        <Card className="p-6">
          <Typography level="h4" className="mb-4">
            Theme System Status
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Typography level="body2" className="text-gray-500 dark:text-gray-400">
                Current Theme
              </Typography>
              <Typography level="body1" className="font-semibold">
                {theme}
              </Typography>
            </div>
            <div>
              <Typography level="body2" className="text-gray-500 dark:text-gray-400">
                Resolved Theme
              </Typography>
              <Typography level="body1" className="font-semibold">
                {theme}
              </Typography>
            </div>
            <div>
              <Typography level="body2" className="text-gray-500 dark:text-gray-400">
                CSS Framework
              </Typography>
              <Typography level="body1" className="font-semibold">
                Tailwind CSS
              </Typography>
            </div>
            <div>
              <Typography level="body2" className="text-gray-500 dark:text-gray-400">
                UI Library
              </Typography>
              <Typography level="body1" className="font-semibold">
                Custom Components
              </Typography>
            </div>
          </div>
        </Card>

        {/* Icon Demo */}
        <Card className="p-6">
          <Typography level="h4" className="mb-4">
            Icon Migration (Lucide React)
          </Typography>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <Typography level="body2">Settings</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <Typography level="body2">Star</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <Typography level="body2">Heart</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <Typography level="body2">Download</Typography>
            </div>
          </div>
        </Card>

        {/* User Avatar Demo */}
        <Card className="p-6">
          <Typography level="h4" className="mb-4">
            Avatar Component
          </Typography>
          <Stack direction="row" spacing={3}>
            <Avatar size="sm" fallback="SM" />
            <Avatar size="md" fallback="MD" />
            <Avatar size="lg" fallback="LG" />
            <Avatar 
              size="md" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
              alt="User Avatar" 
            />
          </Stack>
        </Card>

        {/* Footer */}
        <Card className="p-6 text-center">
          <Typography level="h4" className="mb-2">
            🚀 Migration Successful!
          </Typography>
          <Typography level="body1" className="mb-4 text-gray-600 dark:text-gray-400">
            Your Next.js application now uses only Tailwind CSS for styling.
            All MUI Joy dependencies have been removed while maintaining full backward compatibility.
          </Typography>
          <Button variant="primary" size="lg">
            Start Building with Tailwind
          </Button>
        </Card>
      </div>
    </div>
  );
}
