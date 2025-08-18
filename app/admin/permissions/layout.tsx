'use client';

import React from 'react';
import EnhancedLayout from './layout-enhanced';

interface PermissionsLayoutProps {
  children: React.ReactNode;
}

const PermissionsLayout: React.FC<PermissionsLayoutProps> = ({ children }) => {
  return (
    <EnhancedLayout>
      {children}
    </EnhancedLayout>
  );
};

export default PermissionsLayout;
