'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Download, Eye, Phone, Clock, User, MessageSquare, ThumbsUp, Facebook } from 'lucide-react';

interface FacebookStats {
  totalPages: number;
  totalPosts: number;
  totalComments: number;
  totalMessages: number;
  totalConversations: number;
  totalInteractions: number;
}

interface UserData {
  pageId: string;
  pageName: string;
  userId: string;
  userName: string;
  userLink: string;
  phone?: string;
  firstTime: Date;
  lastTime: Date;
  totalInteractions: number;
  commentCount: number;
  messageCount: number;
}

interface SyncResult {
  success: boolean;
  type: string;
  synced: number;
  processed: number;
  errors: string[];
  userDataExtracted: number;
  message: string;
}

export default function AdminFacebookPage() {
  const [stats, setStats] = useState<FacebookStats | null>(null);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('all-pages');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [pages, setPages] = useState<Array<{id: string, name: string}>>([]);

  // Load initial data
  useEffect(() => {
    loadStats();
    loadUserData();
    loadPages();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/sync');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'summary');
      if (selectedPage && selectedPage !== 'all-pages') params.append('pageId', selectedPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('filter', filterType);
      
      const response = await fetch(`/api/admin/social/facebook/data?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.userData || data.data || []);
      } else {
        console.error('Failed to load user data');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/social/facebook/data?type=pages');
      const data = await response.json();
      
      if (data.success && data.pagesData) {
        setPages(data.pagesData.map((page: any) => ({
          id: page.facebookPageId,
          name: page.name
        })));
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const handleSync = async (type: string) => {
    setSyncLoading(true);
    try {
      const body: any = { type };
      if (selectedPage && selectedPage !== 'all-pages') body.pageId = selectedPage;
      
      const response = await fetch('/api/admin/social/facebook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const result: SyncResult = await response.json();
      
      if (result.success) {
        console.log(result.message);
        if (result.userDataExtracted > 0) {
          console.log(`Extracted ${result.userDataExtracted} user data records`);
        }
        loadStats();
        loadUserData();
      } else {
        console.error(`Sync failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', 'summary');
      if (selectedPage && selectedPage !== 'all-pages') params.append('pageId', selectedPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('filter', filterType);
      params.append('export', 'true');
      
      const response = await fetch(`/api/admin/social/facebook/data?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `facebook-user-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Data exported successfully');
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredData = userData.filter(user => {
    const matchesSearch = !searchTerm || 
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.userId.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'phone' && user.phone) ||
      (filterType === 'no-phone' && !user.phone) ||
      (filterType === 'comment' && user.commentCount > 0) ||
      (filterType === 'message' && user.messageCount > 0);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Facebook className="h-8 w-8 text-blue-600" />
            Facebook Social Management
          </h1>
          <p className="text-muted-foreground">
            Manage Facebook fanpages, sync data, and extract user information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadUserData()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPages}</p>
                  <p className="text-xs text-muted-foreground">Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalConversations}</p>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalInteractions}</p>
                  <p className="text-xs text-muted-foreground">Interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Operations</CardTitle>
          <CardDescription>
            Sync Facebook data and extract user information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select page (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pages">All pages</SelectItem>
                {pages.map(page => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSync('fanpages')} 
                disabled={syncLoading}
                variant="outline"
              >
                {syncLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Facebook className="h-4 w-4 mr-2" />}
                Sync Pages
              </Button>
              
              <Button 
                onClick={() => handleSync('comments')} 
                disabled={syncLoading}
                variant="outline"
              >
                {syncLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
                Sync Comments
              </Button>
              
              <Button 
                onClick={() => handleSync('messages')} 
                disabled={syncLoading}
                variant="outline"
              >
                {syncLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                Sync Messages
              </Button>
              
              <Button 
                onClick={() => handleSync('all')} 
                disabled={syncLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {syncLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Data Analysis</CardTitle>
          <CardDescription>
            Comprehensive data processing and extraction from Facebook interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <Input
              placeholder="Search by name, page, phone, or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All records</SelectItem>
                <SelectItem value="phone">Has phone</SelectItem>
                <SelectItem value="no-phone">No phone</SelectItem>
                <SelectItem value="comment">Comments only</SelectItem>
                <SelectItem value="message">Messages only</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={loadUserData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>

          {/* User Data Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên/ID Fanpage</TableHead>
                  <TableHead>Họ tên/ID User</TableHead>
                  <TableHead>Link Facebook User</TableHead>
                  <TableHead>Phone User</TableHead>
                  <TableHead>FirstTime</TableHead>
                  <TableHead>LastTime</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Types</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading user data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No user data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((user, index) => (
                    <TableRow key={`${user.pageId}-${user.userId}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.pageName}</p>
                          <p className="text-xs text-muted-foreground">{user.pageId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-xs text-muted-foreground">{user.userId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={user.userLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Profile
                        </a>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">{new Date(user.firstTime).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">{new Date(user.lastTime).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.totalInteractions}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.commentCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              COMMENT ({user.commentCount})
                            </Badge>
                          )}
                          {user.messageCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              MESSAGE ({user.messageCount})
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredData.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredData.length} of {userData.length} records
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
