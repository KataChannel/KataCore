'use client';

import React from 'react';
import { AdvancedTable } from '../ui/table/AdvancedTable';
import { type TableColumn } from '../ui/table/types';

interface SimpleData {
  id: string;
  name: string;
  value: number;
}

const sampleData: SimpleData[] = [
  { id: '1', name: 'Item 1', value: 100 },
  { id: '2', name: 'Item 2', value: 200 },
];

const columns: TableColumn<SimpleData>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
  },
  {
    id: 'value',
    header: 'Value',
    accessorKey: 'value',
    sortable: true,
  }
];

export default function SimpleTable() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Simple Table Test</h1>
      <AdvancedTable
        data={sampleData}
        columns={columns}
        getRowId={(row: SimpleData) => row.id}
      />
    </div>
  );
}
