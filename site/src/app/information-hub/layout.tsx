'use client';

import React from 'react';
import { InformationHubProvider } from '@/providers/InformationHubProvider';
import { InformationHubSidebar } from '@/components/information-hub/layout/Sidebar';
import { InformationHubHeader } from '@/components/information-hub/layout/Header';

interface InformationHubLayoutProps {
  children: React.ReactNode;
}

export default function InformationHubLayout({ children }: InformationHubLayoutProps) {
  return (
    <InformationHubProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <InformationHubSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <InformationHubHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </InformationHubProvider>
  );
}
