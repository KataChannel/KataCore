import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SubMenuItem {
  href: string;
  icon: string;
  nameVi: string;
}

interface MenuItem {
  path: string;
  icon: string;
  title: string;
  active?: boolean;
  children?: SubMenuItem[];
}

interface SidebarProps {
  menuItems: MenuItem[];
  title?: string;
  className?: string;
  defaultOpen?: boolean;
  onMenuClick?: (path: string) => void;
  showToggle?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  title = 'Admin Panel',
  className = '',
  defaultOpen = true,
  onMenuClick,
  showToggle = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(defaultOpen);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenuExpansion = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
    );
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      toggleMenuExpansion(item.path);
    } else {
      if (onMenuClick) {
        onMenuClick(item.path);
      } else {
        router.push(item.path);
      }
    }
  };

  const handleSubMenuClick = (subItem: SubMenuItem) => {
    if (onMenuClick) {
      onMenuClick(subItem.href);
    } else {
      router.push(subItem.href);
    }
  };

  return (
    <div
      className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className={`font-bold text-xl text-black dark:text-white ${!sidebarOpen && 'hidden'}`}>
          {title}
        </h1>
        {showToggle && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2">
        {menuItems.map((item) => (
          <div key={item.path}>
            <button
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center px-6 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors
                                ${item.active || pathname === item.path ? 'bg-gray-100 dark:bg-gray-900 border-r-4 border-black dark:border-white' : ''}
                            `}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span
                className={`text-black dark:text-white font-medium ${!sidebarOpen && 'hidden'}`}
              >
                {item.title}
              </span>
              {item.children && sidebarOpen && (
                <span className="ml-auto text-gray-500 dark:text-gray-400">
                  {expandedMenus.includes(item.path) ? '▼' : '▶'}
                </span>
              )}
            </button>

            {/* Submenu */}
            {item.children && expandedMenus.includes(item.path) && sidebarOpen && (
              <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-800">
                {item.children.map((subItem) => (
                  <button
                    key={subItem.href}
                    onClick={() => handleSubMenuClick(subItem)}
                    className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm
                                            ${pathname === subItem.href ? 'bg-gray-50 dark:bg-gray-900 border-r-4 border-black dark:border-white' : ''}
                                        `}
                  >
                    <span className="text-lg mr-3">{subItem.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">{subItem.nameVi}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
