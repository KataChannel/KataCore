import React from 'react';

interface FacebookLayoutProps {
  children: React.ReactNode;
}

export default function FacebookLayout({ children }: FacebookLayoutProps) {
  return (
    <div className="facebook-layout">
      <div className="facebook-header">
        <h1 className="text-2xl font-bold mb-4">Facebook Management</h1>
        <nav className="facebook-nav">
          <ul className="flex space-x-4">
            <li>
              <a href="/admin/social/facebook/posts" className="text-blue-600 hover:text-blue-800">
                Posts
              </a>
            </li>
            <li>
              <a href="/admin/social/facebook/pages" className="text-blue-600 hover:text-blue-800">
                Pages
              </a>
            </li>
            <li>
              <a
                href="/admin/social/facebook/analytics"
                className="text-blue-600 hover:text-blue-800"
              >
                Analytics
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <main className="facebook-content">{children}</main>
    </div>
  );
}
