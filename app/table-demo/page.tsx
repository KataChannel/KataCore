'use client';

import React from 'react';
import SimpleTable from '../../components/test/SimpleTable';
import { AdvancedTable } from '@/components/ui/table/AdvancedTable';
import { createColumn } from '@/components/ui/table/index';
import type { TableColumn } from '@/components/ui/table/types';

interface SimpleData {
  id: string;
  name: string;
  age: number;
  email: string;
}

const sampleData: SimpleData[] = [
  { id: '1', name: 'John Doe', age: 25, email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', age: 30, email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];
const columns: TableColumn<SimpleData>[] = [
  createColumn<SimpleData>({ id: 'name', header: 'Name', accessorKey: 'name', sortable: true }),
  createColumn<SimpleData>({ id: 'age', header: 'Age', accessorKey: 'age', sortable: true }),
  createColumn<SimpleData>({ id: 'email', header: 'Email', accessorKey: 'email', sortable: true }),
];


export default function TableTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Thư viện Table nâng cao - Demo
          </h1>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">✅ Tính năng cơ bản</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                  <li>• Search & Filter</li>
                  <li>• Sort multiple columns</li>
                  <li>• Pagination</li>
                  <li>• Row selection</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100">🚀 Tính năng nâng cao</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                  <li>• Resizable columns</li>
                  <li>• Drag & drop reorder</li>
                  <li>• Sticky headers/columns</li>
                  <li>• Export CSV/JSON</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">🎨 Tùy chỉnh</h3>
                <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1">
                  <li>• Custom cell rendering</li>
                  <li>• Dark mode support</li>
                  <li>• Responsive design</li>
                  <li>• TypeScript support</li>
                </ul>
              </div>
            </div>

            <AdvancedTable
              data={sampleData}
              columns={columns}
              getRowId={(row: SimpleData) => row.id}
              enableStickyColumns={true}
              enableColumnResize={true}
              enableSorting={true}
              enableFiltering={true}
              enableSearch={true}
              headerClassName='bg-gray-100 dark:bg-gray-700'
              onRowClick={(row, index) => console.log('Row clicked:', row, index)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
