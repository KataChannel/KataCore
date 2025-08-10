'use client';

import React, { useState, Suspense } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  FormControl,
  FormLabel,
  FormHelperText,
  Stack,
  Divider,
  Chip,
  IconButton,
  Modal,
  Sheet,
  Switch,
  Alert,
  LinearProgress,
  Avatar,
  Badge,
  ButtonGroup,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  AspectRatio,
  Breadcrumbs,
  Link,
} from '@/components/ui/joy-ui';
import { joyLayouts, joyClasses, joyResponsive, joyAnimations } from '@/components/ui/joy-ui';

interface Post {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  publishedAt?: string;
  views: number;
  category: string;
}

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  monthlyViews: number;
  totalComments: number;
}

/**
 * Modern Admin Dashboard Card Component
 */
function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary' 
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  icon?: React.ReactNode; 
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}) {
  return (
    <Card className={`${joyLayouts.card.interactive} ${joyClasses.shadow.sm}`}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography level="body-sm" className="text-joy-neutral-600 dark:text-joy-neutral-400 mb-1">
              {title}
            </Typography>
            <Typography level="h2" className="font-bold text-joy-neutral-900 dark:text-joy-neutral-100 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {change && (
              <Chip 
                size="sm" 
                variant="soft" 
                color={change.startsWith('+') ? 'success' : 'danger'}
                className={joyClasses.radius.md}
              >
                {change}
              </Chip>
            )}
          </Box>
          {icon && (
            <Box className={`p-3 rounded-joy-lg bg-joy-${color}-50 dark:bg-joy-${color}-900/20`}>
              {icon}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Modern Data Table Component
 */
function PostsTable({ posts }: { posts: Post[] }) {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <Card className={joyLayouts.card.default}>
      <CardContent>
        {/* Table Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-4">
          <Typography level="h4">Recent Posts</Typography>
          <ButtonGroup variant="outlined" size="sm">
            <Button>Export</Button>
            <Button>Filter</Button>
            <Button color="primary">New Post</Button>
          </ButtonGroup>
        </Stack>

        {/* Table */}
        <Box className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-joy-neutral-200 dark:border-joy-neutral-700">
                <th className="text-left py-3 px-4 font-semibold text-joy-neutral-700 dark:text-joy-neutral-300">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-joy-neutral-700 dark:text-joy-neutral-300">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-semibold text-joy-neutral-700 dark:text-joy-neutral-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-joy-neutral-700 dark:text-joy-neutral-300">
                  Author
                </th>
                <th className="text-left py-3 px-4 font-semibold text-joy-neutral-700 dark:text-joy-neutral-300">
                  Views
                </th>
                <th className="text-left py-3 px-4 font-semibold text-joy-neutral-700 dark:text-joy-neutral-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr 
                  key={post.id} 
                  className={`border-b border-joy-neutral-100 dark:border-joy-neutral-800 hover:bg-joy-neutral-50 dark:hover:bg-joy-neutral-900/20 ${joyAnimations.transition.colors}`}
                >
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <Typography level="body-sm" fontWeight="500">
                      {post.title}
                    </Typography>
                  </td>
                  <td className="py-3 px-4">
                    <Chip 
                      size="sm" 
                      variant="soft" 
                      color={getStatusColor(post.status)}
                      className={joyClasses.radius.md}
                    >
                      {post.status}
                    </Chip>
                  </td>
                  <td className="py-3 px-4">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar size="sm" />
                      <Typography level="body-sm">{post.author}</Typography>
                    </Stack>
                  </td>
                  <td className="py-3 px-4">
                    <Typography level="body-sm">{post.views.toLocaleString()}</Typography>
                  </td>
                  <td className="py-3 px-4">
                    <Stack direction="row" spacing={1}>
                      <IconButton size="sm" variant="soft" color="primary">
                        📝
                      </IconButton>
                      <IconButton size="sm" variant="soft" color="neutral">
                        👁️
                      </IconButton>
                      <IconButton size="sm" variant="soft" color="danger">
                        🗑️
                      </IconButton>
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Modern Post Editor Component
 */
function PostEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);

  return (
    <Card className={joyLayouts.card.default}>
      <CardContent>
        <Stack spacing={3}>
          <Typography level="h4">Create New Post</Typography>
          
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input 
              placeholder="Enter post title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={joyClasses.radius.md}
            />
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControl className="flex-1">
              <FormLabel>Category</FormLabel>
              <Select 
                placeholder="Select category..."
                value={category}
                onChange={(_, value) => setCategory(value as string)}
              >
                <Option value="web-development">Web Development</Option>
                <Option value="react">React</Option>
                <Option value="typescript">TypeScript</Option>
                <Option value="css">CSS</Option>
                <Option value="nextjs">Next.js</Option>
              </Select>
            </FormControl>

            <FormControl className="flex-1">
              <FormLabel>Status</FormLabel>
              <Select 
                value={status}
                onChange={(_, value) => setStatus(value as string)}
              >
                <Option value="draft">Draft</Option>
                <Option value="published">Published</Option>
                <Option value="archived">Archived</Option>
              </Select>
            </FormControl>
          </Stack>

          <FormControl>
            <FormLabel>Content</FormLabel>
            <Textarea
              minRows={8}
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={joyClasses.radius.md}
            />
            <FormHelperText>
              Supports Markdown formatting. Use **bold** and *italic* text.
            </FormHelperText>
          </FormControl>

          <FormControl orientation="horizontal">
            <FormLabel>Featured Post</FormLabel>
            <Switch 
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
          </FormControl>

          <Divider />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" color="neutral">
              Save Draft
            </Button>
            <Button variant="outlined" color="primary">
              Preview
            </Button>
            <Button color="primary">
              Publish
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Main Admin Dashboard Page
 */
export default function JoyUIAdminDemo() {
  const [activeTab, setActiveTab] = useState(0);

  // Sample data
  const stats: DashboardStats = {
    totalPosts: 156,
    publishedPosts: 98,
    draftPosts: 58,
    totalViews: 45230,
    monthlyViews: 12456,
    totalComments: 1832,
  };

  const samplePosts: Post[] = [
    {
      id: '1',
      title: 'Building Modern Web Applications with Joy UI',
      status: 'published',
      author: 'John Doe',
      publishedAt: '2024-01-15',
      views: 2341,
      category: 'Web Development',
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      status: 'draft',
      author: 'Jane Smith',
      views: 156,
      category: 'React',
    },
    {
      id: '3',
      title: 'TypeScript Best Practices',
      status: 'published',
      author: 'Mike Johnson',
      publishedAt: '2024-01-12',
      views: 1823,
      category: 'TypeScript',
    },
    {
      id: '4',
      title: 'CSS Grid Layout Guide',
      status: 'archived',
      author: 'Sarah Wilson',
      publishedAt: '2024-01-08',
      views: 945,
      category: 'CSS',
    },
  ];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <Box className={joyLayouts.container.page}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-8">
        <Box>
          <Typography level="h1" className="mb-2">
            Admin Dashboard
          </Typography>
          <Breadcrumbs>
            <Link href="/">Home</Link>
            <Link href="/admin">Admin</Link>
            <Typography>Dashboard</Typography>
          </Breadcrumbs>
        </Box>
        <Button color="primary" size="lg">
          📊 View Analytics
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Box className={`${joyResponsive.grid.container} ${joyResponsive.grid.cols4} mb-8`}>
        <StatsCard
          title="Total Posts"
          value={stats.totalPosts}
          change="+12%"
          icon={<span className="text-2xl">📝</span>}
          color="primary"
        />
        <StatsCard
          title="Published"
          value={stats.publishedPosts}
          change="+8%"
          icon={<span className="text-2xl">✅</span>}
          color="success"
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews}
          change="+23%"
          icon={<span className="text-2xl">👁️</span>}
          color="warning"
        />
        <StatsCard
          title="Comments"
          value={stats.totalComments}
          change="+15%"
          icon={<span className="text-2xl">💬</span>}
          color="neutral"
        />
      </Box>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value as number)}>
        <TabList className="mb-6">
          <Tab>Posts Management</Tab>
          <Tab>Create Post</Tab>
          <Tab>Analytics</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanel value={0}>
          <PostsTable posts={samplePosts} />
        </TabPanel>

        <TabPanel value={1}>
          <PostEditor />
        </TabPanel>

        <TabPanel value={2}>
          <Card className={joyLayouts.card.default}>
            <CardContent>
              <Typography level="h4" className="mb-4">Analytics Overview</Typography>
              <Alert color="primary" className="mb-4">
                📊 Analytics integration coming soon! Connect with Google Analytics or create custom metrics.
              </Alert>
              
              <Stack spacing={3}>
                <Box>
                  <Typography level="title-md" className="mb-2">Monthly Views</Typography>
                  <LinearProgress 
                    determinate 
                    value={75} 
                    className="h-2"
                    color="primary"
                  />
                  <Typography level="body-sm" className="mt-1 text-joy-neutral-500">
                    12,456 views this month (75% of target)
                  </Typography>
                </Box>

                <Box>
                  <Typography level="title-md" className="mb-2">Engagement Rate</Typography>
                  <LinearProgress 
                    determinate 
                    value={68} 
                    className="h-2"
                    color="success"
                  />
                  <Typography level="body-sm" className="mt-1 text-joy-neutral-500">
                    68% average engagement rate
                  </Typography>
                </Box>

                <Box>
                  <Typography level="title-md" className="mb-2">Content Performance</Typography>
                  <LinearProgress 
                    determinate 
                    value={82} 
                    className="h-2"
                    color="warning"
                  />
                  <Typography level="body-sm" className="mt-1 text-joy-neutral-500">
                    82% content performance score
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={3}>
          <Card className={joyLayouts.card.default}>
            <CardContent>
              <Typography level="h4" className="mb-4">Settings</Typography>
              <Alert color="warning" className="mb-4">
                ⚙️ Settings panel will include theme customization, notification preferences, and system configuration.
              </Alert>
              
              <Stack spacing={4}>
                <FormControl orientation="horizontal">
                  <FormLabel>Enable notifications</FormLabel>
                  <Switch defaultChecked />
                </FormControl>

                <FormControl orientation="horizontal">
                  <FormLabel>Auto-save drafts</FormLabel>
                  <Switch defaultChecked />
                </FormControl>

                <FormControl orientation="horizontal">
                  <FormLabel>Dark mode</FormLabel>
                  <Switch />
                </FormControl>

                <Divider />

                <Button color="primary">Save Settings</Button>
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </Box>
    </Suspense>
  );
}
