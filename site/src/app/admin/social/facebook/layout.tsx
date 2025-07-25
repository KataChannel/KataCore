import React from 'react';

interface FacebookLayoutProps {
  children: React.ReactNode;
}

export default function FacebookLayout({ children }: FacebookLayoutProps) {
  return (
    <div className="facebook-layout">
      <main className="facebook-content">{children}</main>
    </div>
  );
}
