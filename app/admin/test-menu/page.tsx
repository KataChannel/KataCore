'use client';

import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  title: string;
  titleVi: string;
  path: string;
  icon: string;
  permission: string;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

const MenuTestPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllMenuItems();
  }, []);

  const fetchAllMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/menu-items/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconEmoji = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'home': '🏠',
      'users': '👥',
      'user': '👤',
      'building-office': '🏢',
      'chart-bar': '📊',
      'computer-desktop': '💻',
      'cog': '⚙️',
      'briefcase': '💼',
      'clock': '🕐',
      'calendar': '📅',
      'currency-dollar': '💰',
      'document-text': '📄',
      'swatch': '🎨',
      'bell': '🔔',
    };
    return iconMap[iconName] || '📄';
  };

  const buildMenuTree = (items: MenuItem[]) => {
    const itemMap = new Map<string, MenuItem & { children: MenuItem[] }>();
    const rootItems: (MenuItem & { children: MenuItem[] })[] = [];

    // Create map of all items with children array
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build tree structure
    items.forEach(item => {
      const itemWithChildren = itemMap.get(item.id)!;
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(itemWithChildren);
        }
      } else {
        rootItems.push(itemWithChildren);
      }
    });

    // Sort by sortOrder
    const sortItems = (items: (MenuItem & { children: MenuItem[] })[]) => {
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      items.forEach((item:any) => {
        if (item.children.length > 0) {
          sortItems(item.children);
        }
      });
    };

    sortItems(rootItems);
    return rootItems;
  };

  const renderMenuItem = (item: MenuItem & { children: MenuItem[] }, level = 0) => {
    return (
      <div key={item.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-2">
          <div className="text-2xl">{getIconEmoji(item.icon)}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {item.titleVi || item.title}
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Level {level}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.path}</p>
            {item.permission && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Permission: {item.permission}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Sort: {item.sortOrder} | Active: {item.isActive ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {item.children.map((child:any) => renderMenuItem(child, level + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <button
            onClick={fetchAllMenuItems}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const menuTree = buildMenuTree(menuItems);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Menu Items Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Displaying all menu items from database in hierarchical structure
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Total items: {menuItems.length} | Root items: {menuTree.length}
          </div>
        </div>

        <div className="space-y-4">
          {menuTree.map(item => renderMenuItem(item))}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{menuTree.length}</div>
              <div className="text-sm text-gray-500">Root Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {menuItems.filter(item => item.parentId).length}
              </div>
              <div className="text-sm text-gray-500">Child Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {menuItems.filter(item => item.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTestPage;
