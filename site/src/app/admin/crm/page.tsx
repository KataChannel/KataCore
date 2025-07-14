'use client';
import ResizableTable from '@/components/ui/shared/Table';

import { useState } from 'react';

export default function CRMPage() {
  const [customers, setCustomers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-300`}
    >
      Xin Chào

      <ResizableTable data={customers} columns={[]} />

    </div>
  );
}
