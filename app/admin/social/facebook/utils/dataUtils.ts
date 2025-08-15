import { UserData } from '../types';

export const exportToCsv = (data: UserData[], filename: string = 'facebook-users') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // CSV headers
  const headers = [
    'User Name',
    'User ID', 
    'User Link',
    'Page Name',
    'Page ID',
    'Phone',
    'First Interaction',
    'Last Interaction',
    'Total Interactions',
    'Comment Count',
    'Message Count'
  ];

  // Convert data to CSV rows
  const csvRows = data.map(user => [
    user.userName,
    user.userId,
    user.userLink,
    user.pageName,
    user.pageId,
    user.phone || '',
    new Date(user.firstTime).toLocaleString(),
    new Date(user.lastTime).toLocaleString(),
    user.totalInteractions,
    user.commentCount,
    user.messageCount
  ]);

  // Combine headers and data
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

export const calculateInteractionScore = (user: UserData): number => {
  // Calculate a weighted interaction score
  const commentWeight = 2;
  const messageWeight = 3;
  const baseWeight = 1;
  
  return (
    (user.commentCount * commentWeight) +
    (user.messageCount * messageWeight) +
    (user.totalInteractions * baseWeight)
  );
};

export const getInteractionLevel = (score: number): 'low' | 'medium' | 'high' | 'very-high' => {
  if (score >= 50) return 'very-high';
  if (score >= 20) return 'high';
  if (score >= 10) return 'medium';
  return 'low';
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};
