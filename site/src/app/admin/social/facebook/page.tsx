'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  message?: string;
  created_time?: string;
  likes?: {
    summary?: {
      total_count: number;
    };
  };
  comments?: {
    summary?: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface Comment {
  id: string;
  message: string;
  created_time?: string;
  from?: {
    name: string;
  };
  likes?: {
    summary?: {
      total_count: number;
    };
  };
}

interface Message {
  id: string;
  message: string;
  created_time?: string;
  from?: {
    name: string;
  };
}

interface Participant {
  name: string;
}

interface Conversation {
  id: string;
  participants?: {
    data?: Participant[];
  };
  messages?: {
    data?: Message[];
  };
}

interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  fan_count?: number;
  followers_count?: number;
  link?: string;
  about?: string;
  phone?: string;
  website?: string;
}

interface InteractionData {
  fanpage: string;
  fullName: string;
  phoneNumber: string;
  facebookLink: string;
  firstInteractionDate: string;
  lastInteractionDate: string;
  totalInteractions: number;
  latestMessage: string;
  interactionType: string;
}

interface PaginationData {
  current: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [fanpages, setFanpages] = useState<FacebookPage[]>([]);
  const [interactions, setInteractions] = useState<InteractionData[]>([]);
  const [listProfile, setListProfile] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [activeTab, setActiveTab] = useState('fanpages');
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('');

  const fetchData = async (type: string, postId = '', pageId = '', page = 1, search = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type,
        ...(postId && { postId }),
        ...(pageId && { pageId }),
        ...(page > 1 && { page: page.toString() }),
        ...(search && { search }),
        limit: '10'
      });
      
      const url = `/api/social/facebook?${params.toString()}`;
      console.log('Fetching:', url);

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Response data:', data);

      // Check if we're using mock data (mock data has predictable IDs)
      if (data.data && data.data.length > 0 && data.data[0].id === '1') {
        setIsUsingMockData(true);
      }

      if (type === 'fanpages' || type === 'pages') {
        setFanpages(data.data || []);
      } else if (type === 'posts') {
        setPosts(data.data || []);
      } else if (type === 'comments') {
        setComments(data.data || []);
      } else if (type === 'messages') {
        const Listid = data.data.map((v: any) => v.participants);
        const profile = Listid.map((v: any) => v.data)
          .flat()
          .filter((v: any) => v.id !== '272459726955766');
        setListProfile(profile);
        setMessages(data.data || []);
      } else if (type === 'interactions') {
        setInteractions(data.data || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('fanpages');
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData('interactions', '', selectedPageId, 1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData('interactions', '', selectedPageId, page, searchTerm);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Facebook Social Media Management</h1>
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'fanpages', label: 'Fanpages', icon: '📄' },
            { id: 'interactions', label: 'Comprehensive Table', icon: '📊' },
            { id: 'posts', label: 'Posts', icon: '📝' },
            { id: 'messages', label: 'Messages', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {listProfile.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">List of Participants</h2>
          <ul className="list-disc pl-5 space-y-2">
            {listProfile.map((profile, index) => (
              <li key={index} className="text-gray-800">
                <Link
                  href={`https://www.facebook.com/profile.php?id=${profile.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {profile.name || 'Unknown Participant'}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mock Data Warning */}
      {isUsingMockData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Development Mode:</strong> Using mock data. To use real Facebook data, configure
          FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN in your .env.local file.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Fanpages Section */}
      {activeTab === 'fanpages' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Facebook Pages ({fanpages.length})</h2>
            <button
              onClick={() => fetchData('fanpages')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Pages'}
            </button>
          </div>

          {loading && fanpages.length === 0 ? (
            <div className="text-center py-4">Loading fanpages...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fanpages.map((page) => (
                <div key={page.id} className="bg-white rounded-lg shadow-md p-6 border">
                  <h3 className="text-lg font-semibold mb-2">{page.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {page.category && <p><strong>Category:</strong> {page.category}</p>}
                    {page.fan_count && <p><strong>Fans:</strong> {page.fan_count.toLocaleString()}</p>}
                    {page.followers_count && <p><strong>Followers:</strong> {page.followers_count.toLocaleString()}</p>}
                    {page.phone && <p><strong>Phone:</strong> {page.phone}</p>}
                    {page.website && <p><strong>Website:</strong> <a href={page.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{page.website}</a></p>}
                  </div>
                  {page.about && (
                    <p className="mt-3 text-gray-700 text-sm line-clamp-3">{page.about}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPageId(page.id);
                        fetchData('comments', '', page.id);
                        setActiveTab('posts');
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      View Comments
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPageId(page.id);
                        fetchData('messages', '', page.id);
                        setActiveTab('messages');
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      View Messages
                    </button>
                  </div>
                </div>
              ))}
              {fanpages.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No fanpages found. Make sure your Facebook credentials are configured correctly.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Interactions Table */}
      {activeTab === 'interactions' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Comprehensive Interactions Table</h2>
            <button
              onClick={() => fetchData('interactions', '', selectedPageId, 1, searchTerm)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, message, or fanpage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Page</label>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Pages</option>
                  {fanpages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          {/* Data Table */}
          {loading && interactions.length === 0 ? (
            <div className="text-center py-4">Loading interactions...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fanpage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facebook Link
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Interaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Interaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Interactions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {interactions.map((interaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interaction.fanpage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interaction.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interaction.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={interaction.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Profile
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(interaction.firstInteractionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(interaction.lastInteractionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {interaction.totalInteractions}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

              {interactions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No interactions found. Try adjusting your search criteria or make sure there is data available.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Posts Section */}
      {activeTab === 'posts' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Posts ({posts.length})</h2>
            <button
              onClick={() => fetchData('posts')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Posts'}
            </button>
          </div>

          {loading && posts.length === 0 ? (
            <div className="text-center py-4">Loading posts...</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md p-6 border">
                  <p className="text-gray-800 mb-3">{post.message || 'No message'}</p>
                  <div className="text-sm text-gray-600 mb-3">{formatDate(post.created_time)}</div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>👍 {post.likes?.summary?.total_count || 0} likes</span>
                    <span>💬 {post.comments?.summary?.total_count || 0} comments</span>
                    <span>🔄 {post.shares?.count || 0} shares</span>
                  </div>
                  <button
                    onClick={() => fetchData('comments', post.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Load Comments
                  </button>
                </div>
              ))}
              {posts.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No posts found.{' '}
                  {isUsingMockData
                    ? 'Mock data is being used for development.'
                    : 'Make sure your Facebook credentials are configured correctly.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Comments ({comments.length})</h2>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-800 mb-2">{comment.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>👤 {comment.from?.name || 'Unknown user'}</span>
                  <div className="flex gap-2">
                    <span>👍 {comment.likes?.summary?.total_count || 0}</span>
                    <span>{formatDate(comment.created_time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section */}
      {activeTab === 'messages' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Messages ({messages.length})</h2>
            <button
              onClick={() => fetchData('messages')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Messages'}
            </button>
          </div>

          <div className="space-y-4">
            {messages.map((conversation) => (
              <div key={conversation.id} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="mb-3">
                  <strong>Participants:</strong>{' '}
                  {conversation.participants?.data?.map((p) => p.name).join(', ') || 'Unknown'}
                </div>
                {conversation.messages?.data && conversation.messages.data.length > 0 && (
                  <div>
                    <strong>Messages:</strong>
                    <div className="mt-2 space-y-2">
                      {conversation.messages.data.map((msg) => (
                        <div key={msg.id} className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-800">{msg.message}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            👤 {msg.from?.name || 'Unknown'} • {formatDate(msg.created_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No messages found. Click "Load Messages" to fetch conversations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
