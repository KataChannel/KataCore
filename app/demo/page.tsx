'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Chip,
  Avatar,
  Link,
  AspectRatio
} from '@/components/ui/joy-ui';
import { joyLayouts, joyClasses, joyResponsive } from '@/components/ui/joy-ui';

interface DemoCard {
  title: string;
  description: string;
  image: string;
  href: string;
  category: string;
  features: string[];
  status: 'completed' | 'in-progress' | 'planned';
}

const demoCards: DemoCard[] = [
  {
    title: 'Joy UI Blog Interface',
    description: 'Complete modern blog interface showcasing Joy UI components with Tailwind CSS integration. Features responsive design, dark mode support, and beautiful typography.',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop',
    href: '/demo/joy-ui-blog',
    category: 'Blog System',
    features: ['Responsive Design', 'Dark Mode', 'Modern Cards', 'Typography System'],
    status: 'completed',
  },
  {
    title: 'Joy UI Admin Dashboard',
    description: 'Professional admin dashboard with data tables, forms, charts, and analytics. Perfect for content management and business intelligence.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    href: '/demo/joy-ui-admin',
    category: 'Admin Panel',
    features: ['Data Tables', 'Form Controls', 'Analytics', 'User Management'],
    status: 'completed',
  },
  {
    title: 'E-commerce Interface',
    description: 'Modern e-commerce interface with product catalogs, shopping cart, and checkout process using Joy UI design system.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    href: '/demo/joy-ui-ecommerce',
    category: 'E-commerce',
    features: ['Product Grid', 'Shopping Cart', 'Checkout Flow', 'Payment UI'],
    status: 'in-progress',
  },
  {
    title: 'Social Media Dashboard',
    description: 'Social media management dashboard with post scheduling, analytics, and engagement tracking using Joy UI components.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
    href: '/demo/joy-ui-social',
    category: 'Social Media',
    features: ['Post Scheduler', 'Analytics', 'User Engagement', 'Media Library'],
    status: 'planned',
  },
  {
    title: 'Project Management',
    description: 'Complete project management interface with task boards, team collaboration, and progress tracking.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
    href: '/demo/joy-ui-projects',
    category: 'Productivity',
    features: ['Kanban Boards', 'Team Chat', 'Time Tracking', 'File Sharing'],
    status: 'planned',
  },
  {
    title: 'Learning Management System',
    description: 'Educational platform with course management, student progress tracking, and interactive learning materials.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
    href: '/demo/joy-ui-lms',
    category: 'Education',
    features: ['Course Catalog', 'Video Player', 'Progress Tracking', 'Assignments'],
    status: 'planned',
  },
];

function getStatusColor(status: DemoCard['status']) {
  switch (status) {
    case 'completed': return 'success';
    case 'in-progress': return 'warning';
    case 'planned': return 'neutral';
    default: return 'neutral';
  }
}

function getStatusText(status: DemoCard['status']) {
  switch (status) {
    case 'completed': return 'Live Demo';
    case 'in-progress': return 'In Progress';
    case 'planned': return 'Coming Soon';
    default: return 'Unknown';
  }
}

function DemoCardComponent({ demo }: { demo: DemoCard }) {
  const isClickable = demo.status === 'completed';

  return (
    <Card className={`${joyLayouts.card.default} ${isClickable ? 'hover:shadow-joy-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer' : 'opacity-75'}`}>
      <AspectRatio ratio="16/9">
        <img
          src={demo.image}
          alt={demo.title}
          className="object-cover"
        />
      </AspectRatio>
      
      <CardContent>
        <Stack spacing={2}>
          {/* Category and Status */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip 
              size="sm" 
              variant="soft" 
              color="primary"
              className={joyClasses.radius.md}
            >
              {demo.category}
            </Chip>
            <Chip 
              size="sm" 
              variant="soft" 
              color={getStatusColor(demo.status)}
              className={joyClasses.radius.md}
            >
              {getStatusText(demo.status)}
            </Chip>
          </Stack>

          {/* Title */}
          {isClickable ? (
            <Link href={demo.href} className="no-underline">
              <Typography 
                level="h4" 
                className="hover:text-joy-primary transition-colors text-joy-neutral-900 dark:text-joy-neutral-100"
              >
                {demo.title}
              </Typography>
            </Link>
          ) : (
            <Typography 
              level="h4" 
              className="text-joy-neutral-900 dark:text-joy-neutral-100"
            >
              {demo.title}
            </Typography>
          )}

          {/* Description */}
          <Typography 
            level="body-sm" 
            className="text-joy-neutral-600 dark:text-joy-neutral-400 leading-relaxed"
          >
            {demo.description}
          </Typography>

          {/* Features */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {demo.features.map((feature) => (
              <Chip
                key={feature}
                size="sm"
                variant="outlined"
                color="neutral"
                className={`${joyClasses.radius.sm} text-xs`}
              >
                {feature}
              </Chip>
            ))}
          </Stack>

          <Divider />

          {/* Action Button */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography level="body-xs" className="text-joy-neutral-500">
              {demo.status === 'completed' ? 'Ready to explore' : 
               demo.status === 'in-progress' ? 'Development in progress' : 
               'Coming in future updates'}
            </Typography>
            
            {isClickable ? (
              <Button 
                component={Link}
                href={demo.href}
                size="sm" 
                variant="outlined"
                color="primary"
              >
                View Demo
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="soft"
                color="neutral"
                disabled
              >
                {demo.status === 'in-progress' ? 'In Progress' : 'Coming Soon'}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Joy UI Demo Showcase Page
 */
export default function JoyUIDemoShowcase() {
  const completedDemos = demoCards.filter(demo => demo.status === 'completed');
  const inProgressDemos = demoCards.filter(demo => demo.status === 'in-progress');
  const plannedDemos = demoCards.filter(demo => demo.status === 'planned');

  return (
    <Box className={joyLayouts.container.page}>
      {/* Hero Section */}
      <Box className="text-center mb-12">
        <Typography 
          level="h1" 
          className="mb-4 font-bold text-joy-neutral-900 dark:text-joy-neutral-100"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          Joy UI + Tailwind CSS Demos
        </Typography>
        <Typography 
          level="h4" 
          className="text-joy-neutral-600 dark:text-joy-neutral-400 max-w-3xl mx-auto leading-relaxed mb-8"
        >
          Explore comprehensive examples of modern web interfaces built with Joy UI components and Tailwind CSS utilities. 
          Each demo showcases best practices for responsive design, accessibility, and user experience.
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Chip variant="soft" color="success" size="lg" className={joyClasses.radius.md}>
            ✅ {completedDemos.length} Live Demos
          </Chip>
          <Chip variant="soft" color="warning" size="lg" className={joyClasses.radius.md}>
            🚧 {inProgressDemos.length} In Progress
          </Chip>
          <Chip variant="soft" color="neutral" size="lg" className={joyClasses.radius.md}>
            📅 {plannedDemos.length} Planned
          </Chip>
        </Stack>
      </Box>

      {/* Live Demos Section */}
      {completedDemos.length > 0 && (
        <Box className="mb-12">
          <Typography level="h2" className="mb-6 text-joy-neutral-900 dark:text-joy-neutral-100">
            🚀 Live Demos
          </Typography>
          <Box className={`${joyResponsive.grid.container} ${joyResponsive.grid.cols3}`}>
            {completedDemos.map((demo) => (
              <DemoCardComponent key={demo.href} demo={demo} />
            ))}
          </Box>
        </Box>
      )}

      {/* In Progress Section */}
      {inProgressDemos.length > 0 && (
        <Box className="mb-12">
          <Typography level="h2" className="mb-6 text-joy-neutral-900 dark:text-joy-neutral-100">
            🚧 In Development
          </Typography>
          <Box className={`${joyResponsive.grid.container} ${joyResponsive.grid.cols3}`}>
            {inProgressDemos.map((demo) => (
              <DemoCardComponent key={demo.href} demo={demo} />
            ))}
          </Box>
        </Box>
      )}

      {/* Planned Section */}
      {plannedDemos.length > 0 && (
        <Box className="mb-12">
          <Typography level="h2" className="mb-6 text-joy-neutral-900 dark:text-joy-neutral-100">
            📅 Coming Soon
          </Typography>
          <Box className={`${joyResponsive.grid.container} ${joyResponsive.grid.cols3}`}>
            {plannedDemos.map((demo) => (
              <DemoCardComponent key={demo.href} demo={demo} />
            ))}
          </Box>
        </Box>
      )}

      {/* Technical Details Section */}
      <Card className={`${joyLayouts.card.default} mt-12`}>
        <CardContent>
          <Typography level="h3" className="mb-4 text-joy-neutral-900 dark:text-joy-neutral-100">
            🛠️ Technical Stack
          </Typography>
          
          <Box className={`${joyResponsive.grid.container} ${joyResponsive.grid.cols2} gap-6`}>
            <Box>
              <Typography level="title-md" className="mb-3 text-joy-neutral-800 dark:text-joy-neutral-200">
                UI Framework
              </Typography>
              <Stack spacing={2}>
                <Box className={joyResponsive.flex.between}>
                  <Typography level="body-sm">Joy UI Components</Typography>
                  <Chip size="sm" variant="soft" color="primary">v5.0.0-beta</Chip>
                </Box>
                <Box className={joyResponsive.flex.between}>
                  <Typography level="body-sm">Tailwind CSS</Typography>
                  <Chip size="sm" variant="soft" color="primary">v4.1.11</Chip>
                </Box>
                <Box className={joyResponsive.flex.between}>
                  <Typography level="body-sm">CSS Variables Integration</Typography>
                  <Chip size="sm" variant="soft" color="success">Active</Chip>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography level="title-md" className="mb-3 text-joy-neutral-800 dark:text-joy-neutral-200">
                Development Features
              </Typography>
              <Stack spacing={2}>
                <Box className={joyResponsive.flex.between}>
                  <Typography level="body-sm">Dark Mode Support</Typography>
                  <Chip size="sm" variant="soft" color="success">✓</Chip>
                </Box>
                <Box className={joyResponsive.flex.between}>
                  <Typography level="body-sm">Responsive Design</Typography>
                  <Chip size="sm" variant="soft" color="success">✓</Chip>
                </Box>
                <Box className={joyResponsive.flex.between}>
                  <Typography level="body-sm">TypeScript Support</Typography>
                  <Chip size="sm" variant="soft" color="success">✓</Chip>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Divider className="my-6" />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" color="neutral">
              📖 View Documentation
            </Button>
            <Button variant="outlined" color="primary">
              🐙 GitHub Repository
            </Button>
            <Button color="primary">
              🚀 Get Started
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
