'use client';

import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Input, 
  Textarea,
  Select,
  Option,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  LinearProgress,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Avatar,
  AvatarGroup,
  Chip,
  Badge,
  Tooltip,
  Modal,
  ModalDialog,
  ModalClose,
  Stack
} from '@mui/joy';
import { 
  Add, 
  Remove, 
  Star, 
  Favorite,
  Share,
  Download,
  Settings,
  Notifications,
  Person,
  Home,
  Dashboard
} from '@mui/icons-material';
import { 
  ThemeToggle, 
  ThemeSelect 
} from '@/components/theme/ThemeToggle';
import { OptimizedCard, InfoCard, SuccessCard, WarningCard, DangerCard } from '@/components/ui/OptimizedCard';
import { useSimpleTheme } from '@/hooks/useSimpleTheme';

export function OptimizedThemeDemo() {
  const { theme } = useSimpleTheme();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [switchChecked, setSwitchChecked] = React.useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2 }}>
          🎨 Joy UI + Tailwind CSS Theme System
        </Typography>
        
        <Typography level="body-lg" sx={{ mb: 3, opacity: 0.8 }}>
          Hệ thống theme đã được tối ưu với giao diện đẹp mắt, chỉ sử dụng Joy UI và Tailwind CSS
        </Typography>

        <Box 
          sx={{ 
            p: 3, 
            bgcolor: 'background.level1', 
            borderRadius: 'lg',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography level="title-sm" sx={{ mb: 1 }}>
            Theme Status
          </Typography>
          <Typography level="body-sm">
            Current Theme: <strong>{theme}</strong>
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Theme Controls */}
        <Grid xs={12} md={4}>
          <OptimizedCard 
            title="🎛️ Theme Controls"
            subtitle="Điều khiển theme system"
            size="lg"
          >
            <Stack spacing={3}>
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Toggle Buttons</Typography>
                <Stack direction="row" spacing={2}>
                  <ThemeToggle showLabel />
                  <ThemeToggle variant="icon" />
                </Stack>
              </Box>

              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Switch Control</Typography>
                <ThemeToggle variant="switch" showLabel />
              </Box>

              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Mode Selection</Typography>
                <ThemeSelect />
              </Box>
            </Stack>
          </OptimizedCard>
        </Grid>

        {/* Joy UI Components */}
        <Grid xs={12} md={8}>
          <OptimizedCard 
            title="🧩 Joy UI Components"
            subtitle="Showcase các component Joy UI"
            size="lg"
          >
            <Grid container spacing={2}>
              {/* Buttons */}
              <Grid xs={12} sm={6}>
                <Typography level="title-sm" sx={{ mb: 1 }}>Buttons</Typography>
                <Stack spacing={1}>
                  <Button variant="solid" color="primary" startDecorator={<Add />}>
                    Solid Primary
                  </Button>
                  <Button variant="outlined" color="neutral" endDecorator={<Star />}>
                    Outlined Neutral
                  </Button>
                  <Button variant="soft" color="success" size="sm">
                    Soft Success
                  </Button>
                </Stack>
              </Grid>

              {/* Inputs */}
              <Grid xs={12} sm={6}>
                <Typography level="title-sm" sx={{ mb: 1 }}>Inputs</Typography>
                <Stack spacing={1}>
                  <Input placeholder="Input field" />
                  <Select placeholder="Select option">
                    <Option value="1">Option 1</Option>
                    <Option value="2">Option 2</Option>
                  </Select>
                  <Textarea placeholder="Textarea" minRows={2} />
                </Stack>
              </Grid>

              {/* Interactive Elements */}
              <Grid xs={12}>
                <Typography level="title-sm" sx={{ mb: 1 }}>Interactive Elements</Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Checkbox label="Checkbox option" />
                      </Box>
                      <RadioGroup name="radio-group">
                        <Radio value="1" label="Radio option 1" />
                        <Radio value="2" label="Radio option 2" />
                      </RadioGroup>
                    </Stack>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Switch
                        checked={switchChecked}
                        onChange={(e) => setSwitchChecked(e.target.checked)}
                        endDecorator="Enable notifications"
                      />
                      <Box>
                        <Typography level="body-sm" sx={{ mb: 1 }}>
                          Slider: {sliderValue}
                        </Typography>
                        <Slider
                          value={sliderValue}
                          onChange={(_, value) => setSliderValue(value as number)}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </OptimizedCard>
        </Grid>

        {/* Data Display */}
        <Grid xs={12} md={6}>
          <OptimizedCard 
            title="📊 Data Display"
            subtitle="Progress, alerts và data components"
            size="lg"
          >
            <Stack spacing={3}>
              {/* Progress */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Progress Indicators</Typography>
                <Stack spacing={2}>
                  <LinearProgress determinate value={75} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size="sm" />
                    <CircularProgress size="md" determinate value={60} />
                    <CircularProgress size="lg" color="success" />
                  </Box>
                </Stack>
              </Box>

              {/* Alerts */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Alerts</Typography>
                <Stack spacing={1}>
                  <Alert color="primary" variant="soft">Primary alert message</Alert>
                  <Alert color="success" variant="outlined">Success notification</Alert>
                  <Alert color="warning" variant="solid">Warning message</Alert>
                </Stack>
              </Box>

              {/* Navigation */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Navigation</Typography>
                <Breadcrumbs>
                  <Link href="#" startDecorator={<Home />}>Home</Link>
                  <Link href="#" startDecorator={<Dashboard />}>Dashboard</Link>
                  <Typography>Theme Demo</Typography>
                </Breadcrumbs>
              </Box>
            </Stack>
          </OptimizedCard>
        </Grid>

        {/* Avatars & Chips */}
        <Grid xs={12} md={6}>
          <OptimizedCard 
            title="👤 User Elements"
            subtitle="Avatars, chips và user-related components"
            size="lg"
          >
            <Stack spacing={3}>
              {/* Avatars */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Avatars</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <Avatar size="sm">S</Avatar>
                    <Avatar size="md">M</Avatar>
                    <Avatar size="lg">L</Avatar>
                  </Stack>
                  <AvatarGroup>
                    <Avatar>A</Avatar>
                    <Avatar>B</Avatar>
                    <Avatar>C</Avatar>
                    <Avatar>+2</Avatar>
                  </AvatarGroup>
                </Stack>
              </Box>

              {/* Chips & Badges */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Chips & Badges</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip variant="solid" color="primary">Solid</Chip>
                    <Chip variant="outlined" color="neutral">Outlined</Chip>
                    <Chip variant="soft" color="success">Soft</Chip>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Badge badgeContent={4} color="danger">
                      <Notifications />
                    </Badge>
                    <Badge badgeContent="NEW" color="primary">
                      <Person />
                    </Badge>
                  </Stack>
                </Stack>
              </Box>

              {/* Tooltips */}
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Tooltips</Typography>
                <Stack direction="row" spacing={2}>
                  <Tooltip title="Tooltip text">
                    <Button variant="outlined">Hover me</Button>
                  </Tooltip>
                  <Tooltip title="Another tooltip" placement="top">
                    <Button variant="soft">Top tooltip</Button>
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </OptimizedCard>
        </Grid>

        {/* Card Variants */}
        <Grid xs={12}>
          <Typography level="h3" sx={{ mb: 2 }}>
            📦 Card Variants
          </Typography>
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <InfoCard 
                title="Info Card"
                subtitle="Information display"
                tags={['info', 'blue']}
              >
                <Typography level="body-sm">
                  This is an info card with primary color scheme.
                </Typography>
              </InfoCard>
            </Grid>
            
            <Grid xs={12} sm={6} md={3}>
              <SuccessCard 
                title="Success Card"
                subtitle="Success state"
                tags={['success', 'green']}
              >
                <Typography level="body-sm">
                  Operation completed successfully!
                </Typography>
              </SuccessCard>
            </Grid>
            
            <Grid xs={12} sm={6} md={3}>
              <WarningCard 
                title="Warning Card"
                subtitle="Warning state"
                tags={['warning', 'yellow']}
              >
                <Typography level="body-sm">
                  Please review this information carefully.
                </Typography>
              </WarningCard>
            </Grid>
            
            <Grid xs={12} sm={6} md={3}>
              <DangerCard 
                title="Danger Card"
                subtitle="Error state"
                tags={['error', 'red']}
              >
                <Typography level="body-sm">
                  Critical error occurred!
                </Typography>
              </DangerCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Modal Demo */}
        <Grid xs={12}>
          <OptimizedCard title="🪟 Modal Demo">
            <Button 
              variant="outlined" 
              onClick={() => setModalOpen(true)}
              startDecorator={<Settings />}
            >
              Open Modal
            </Button>
            
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ mb: 2 }}>
                  Theme Settings
                </Typography>
                <div className="space-y-4">
                  <ThemeSelect showLabel />
                  <ThemeToggle variant="switch" showLabel />
                </div>
              </ModalDialog>
            </Modal>
          </OptimizedCard>
        </Grid>

        {/* Tailwind Integration */}
        <Grid xs={12}>
          <OptimizedCard 
            title="🎨 Tailwind + Theme Variables"
            subtitle="Sử dụng Tailwind CSS với theme variables"
            size="lg"
          >
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <div className="space-y-4">
                  <div className="bg-theme-card border border-theme-border rounded-theme-lg p-4">
                    <h4 className="text-theme-fg font-bold text-lg mb-2">Tailwind Card</h4>
                    <p className="text-theme-muted text-sm mb-3">
                      Card sử dụng Tailwind utility classes với theme variables
                    </p>
                    <button className="bg-theme-accent text-white px-4 py-2 rounded-theme hover:opacity-90 transition-all">
                      Theme Button
                    </button>
                  </div>
                  
                  <div className="theme-card-elevated p-4">
                    <h4 className="theme-fg font-semibold mb-2">CSS Class Card</h4>
                    <p className="theme-muted text-sm mb-3">
                      Card sử dụng các CSS classes có sẵn
                    </p>
                    <button className="theme-button">
                      CSS Button
                    </button>
                  </div>
                </div>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Box sx={{ 
                  p: 3, 
                  bgcolor: 'var(--theme-card)', 
                  border: '1px solid var(--theme-border)',
                  borderRadius: 'var(--theme-radius-lg)'
                }}>
                  <Typography level="title-lg" sx={{ mb: 2, color: 'var(--theme-fg)' }}>
                    Mixed Approach
                  </Typography>
                  <Typography level="body-sm" sx={{ mb: 2, color: 'var(--theme-muted)' }}>
                    Joy UI components với CSS variables trực tiếp
                  </Typography>
                  <Button 
                    variant="solid" 
                    sx={{ 
                      bgcolor: 'var(--theme-accent)',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Mixed Button
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </OptimizedCard>
        </Grid>
      </Grid>
    </Box>
  );
}
