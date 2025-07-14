import React from 'react';

interface SocialLayoutProps {
  children: React.ReactNode;
}

export default function SocialLayout({ children }: SocialLayoutProps) {
  return (
    <div className="social-layout">
      <div className="social-header">
        <h1>Social Management</h1>
      </div>
      <div className="social-content">{children}</div>
    </div>
  );
}
