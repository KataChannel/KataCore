'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  Box,
  Input,
  Select,
  Option,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Sheet,
  CircularProgress
} from '@mui/joy';
import {
  SearchRounded,
  TuneRounded,
  DownloadRounded,
  ContentCopyRounded,
  PhoneRounded,
  PersonRounded,
  ChatBubbleRounded,
  ThumbUpRounded,
  NavigateBeforeRounded,
  NavigateNextRounded,
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded
} from '@mui/icons-material';
import { UserData, PaginationInfo, FilterOptions, FacebookPage } from '../types';

interface UserDataTableProps {
  userData: UserData[];
  loading: boolean;
  pagination: PaginationInfo;
  filters: FilterOptions;
  pages: FacebookPage[];
  onUpdateFilters: (filters: Partial<FilterOptions>) => void;
  onUpdatePagination: (pagination: Partial<PaginationInfo>) => void;
  onExportData: () => void;
}

export const UserDataTable: React.FC<UserDataTableProps> = ({
  userData,
  loading,
  pagination,
  filters,
  pages,
  onUpdateFilters,
  onUpdatePagination,
  onExportData
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSort = (field: string) => {
    const newDirection = filters.sortField === field && filters.sortDirection === 'desc' ? 'asc' : 'desc';
    onUpdateFilters({ sortField: field, sortDirection: newDirection });
  };

  const getSortIcon = (field: string) => {
    if (filters.sortField !== field) return null;
    return filters.sortDirection === 'desc' ? 
      <KeyboardArrowDownRounded fontSize="small" /> : 
      <KeyboardArrowUpRounded fontSize="small" />;
  };

  const getFilterTypeLabel = (type: string) => {
    switch (type) {
      case 'phone': return '📱 Has Phone';
      case 'no-phone': return '📵 No Phone';
      case 'comments': return '💬 Has Comments';
      case 'messages': return '✉️ Has Messages';
      case 'high-interaction': return '🔥 High Interaction';
      default: return '📊 All Data';
    }
  };

  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography level="title-md" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonRounded />
            User Data Analysis
            <Chip color="primary" variant="soft" size="sm">
              {pagination.totalItems.toLocaleString()} users
            </Chip>
          </Typography>
          
          <Button
            size="sm"
            variant="outlined"
            startDecorator={<DownloadRounded />}
            onClick={onExportData}
            disabled={loading || userData.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search users..."
            startDecorator={<SearchRounded />}
            value={filters.searchTerm}
            onChange={(e) => onUpdateFilters({ searchTerm: e.target.value })}
            sx={{ minWidth: 200 }}
          />

          <Select
            placeholder="Filter by..."
            startDecorator={<TuneRounded />}
            value={filters.type}
            onChange={(_, value) => onUpdateFilters({ type: value as any })}
            sx={{ minWidth: 150 }}
          >
            <Option value="all">📊 All Data</Option>
            <Option value="phone">📱 Has Phone</Option>
            <Option value="no-phone">📵 No Phone</Option>
            <Option value="comments">💬 Has Comments</Option>
            <Option value="messages">✉️ Has Messages</Option>
            <Option value="high-interaction">🔥 High Interaction</Option>
          </Select>

          <Select
            placeholder="Select page..."
            value={filters.selectedPage}
            onChange={(_, value) => onUpdateFilters({ selectedPage: value as string })}
            sx={{ minWidth: 150 }}
          >
            <Option value="all-pages">🌐 All Pages</Option>
            {pages.map(page => (
              <Option key={page.id} value={page.id}>
                📘 {page.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Page size..."
            value={pagination.pageSize}
            onChange={(_, value) => onUpdatePagination({ pageSize: value as number, currentPage: 1 })}
            sx={{ minWidth: 100 }}
          >
            <Option value={25}>25</Option>
            <Option value={50}>50</Option>
            <Option value={100}>100</Option>
            <Option value={200}>200</Option>
          </Select>
        </Box>

        {/* Active Filters */}
        {(filters.type !== 'all' || filters.searchTerm || filters.selectedPage !== 'all-pages') && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mr: 1 }} component="span">
              Active filters:
            </Typography>
            {filters.type !== 'all' && (
              <Chip
                size="sm"
                variant="soft"
                endDecorator={
                  <IconButton
                    size="sm"
                    onClick={() => onUpdateFilters({ type: 'all' })}
                  >
                    ×
                  </IconButton>
                }
              >
                {getFilterTypeLabel(filters.type)}
              </Chip>
            )}
            {filters.searchTerm && (
              <Chip
                size="sm"
                variant="soft"
                endDecorator={
                  <IconButton
                    size="sm"
                    onClick={() => onUpdateFilters({ searchTerm: '' })}
                  >
                    ×
                  </IconButton>
                }
              >
                Search: {filters.searchTerm}
              </Chip>
            )}
            {filters.selectedPage !== 'all-pages' && (
              <Chip
                size="sm"
                variant="soft"
                endDecorator={
                  <IconButton
                    size="sm"
                    onClick={() => onUpdateFilters({ selectedPage: 'all-pages' })}
                  >
                    ×
                  </IconButton>
                }
              >
                Page: {pages.find(p => p.id === filters.selectedPage)?.name || filters.selectedPage}
              </Chip>
            )}
          </Box>
        )}

        {/* Table */}
        <Sheet sx={{ overflow: 'auto', borderRadius: 'sm' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table
              hoverRow
              sx={{
                '& thead th:nth-of-type(1)': { width: '20%' },
                '& thead th:nth-of-type(2)': { width: '15%' },
                '& thead th:nth-of-type(3)': { width: '15%' },
                '& thead th:nth-of-type(4)': { width: '15%' },
                '& thead th:nth-of-type(5)': { width: '10%' },
                '& thead th:nth-of-type(6)': { width: '10%' },
                '& thead th:nth-of-type(7)': { width: '15%' }
              }}
            >
              <thead>
                <tr>
                  <th>
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => handleSort('userName')}
                      endDecorator={getSortIcon('userName')}
                    >
                      User
                    </Button>
                  </th>
                  <th>
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => handleSort('pageName')}
                      endDecorator={getSortIcon('pageName')}
                    >
                      Page
                    </Button>
                  </th>
                  <th>Phone</th>
                  <th>
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => handleSort('totalInteractions')}
                      endDecorator={getSortIcon('totalInteractions')}
                    >
                      Interactions
                    </Button>
                  </th>
                  <th>
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => handleSort('commentCount')}
                      endDecorator={getSortIcon('commentCount')}
                    >
                      Comments
                    </Button>
                  </th>
                  <th>
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => handleSort('messageCount')}
                      endDecorator={getSortIcon('messageCount')}
                    >
                      Messages
                    </Button>
                  </th>
                  <th>
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => handleSort('lastTime')}
                      endDecorator={getSortIcon('lastTime')}
                    >
                      Last Activity
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user, index) => {
                  const copyId = `${user.userId}-${index}`;
                  return (
                    <tr key={copyId}>
                      <td>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonRounded fontSize="small" color="primary" />
                          <Box>
                            <Typography level="body-sm" fontWeight="bold" component="div">
                              {user.userName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography level="body-xs" sx={{ color: 'text.secondary' }} component="span">
                                ID: {user.userId.slice(0, 8)}...
                              </Typography>
                              <Tooltip title={copiedField === `userId-${copyId}` ? 'Copied!' : 'Copy User ID'}>
                                <IconButton
                                  size="sm"
                                  variant="plain"
                                  onClick={() => copyToClipboard(user.userId, `userId-${copyId}`)}
                                >
                                  <ContentCopyRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      </td>
                      <td>
                        <Typography level="body-sm" component="div">{user.pageName}</Typography>
                      </td>
                      <td>
                        {user.phone ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneRounded fontSize="small" color="success" />
                            <Typography level="body-sm" component="span">{user.phone}</Typography>
                            <Tooltip title={copiedField === `phone-${copyId}` ? 'Copied!' : 'Copy Phone'}>
                              <IconButton
                                size="sm"
                                variant="plain"
                                onClick={() => copyToClipboard(user.phone!, `phone-${copyId}`)}
                              >
                                <ContentCopyRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography level="body-sm" sx={{ color: 'text.secondary' }} component="div">
                            No phone
                          </Typography>
                        )}
                      </td>
                      <td>
                        <Chip
                          color={user.totalInteractions > 10 ? 'success' : user.totalInteractions > 5 ? 'warning' : 'neutral'}
                          variant="soft"
                          size="sm"
                          startDecorator={<ThumbUpRounded fontSize="small" />}
                        >
                          {user.totalInteractions}
                        </Chip>
                      </td>
                      <td>
                        <Chip
                          color={user.commentCount > 0 ? 'primary' : 'neutral'}
                          variant="soft"
                          size="sm"
                          startDecorator={<ChatBubbleRounded fontSize="small" />}
                        >
                          {user.commentCount}
                        </Chip>
                      </td>
                      <td>
                        <Chip
                          color={user.messageCount > 0 ? 'warning' : 'neutral'}
                          variant="soft"
                          size="sm"
                          startDecorator={<ChatBubbleRounded fontSize="small" />}
                        >
                          {user.messageCount}
                        </Chip>
                      </td>
                      <td>
                        <Typography level="body-xs" component="div">
                          {new Date(user.lastTime).toLocaleDateString()}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Sheet>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }} component="div">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems.toLocaleString()} entries
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="sm"
                variant="outlined"
                disabled={pagination.currentPage === 1}
                onClick={() => onUpdatePagination({ currentPage: pagination.currentPage - 1 })}
              >
                <NavigateBeforeRounded />
              </IconButton>
              
              <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', px: 2 }} component="div">
                Page {pagination.currentPage} of {totalPages}
              </Typography>
              
              <IconButton
                size="sm"
                variant="outlined"
                disabled={pagination.currentPage === totalPages}
                onClick={() => onUpdatePagination({ currentPage: pagination.currentPage + 1 })}
              >
                <NavigateNextRounded />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
