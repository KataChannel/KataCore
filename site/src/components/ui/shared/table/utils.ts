import { OperatorDefinition, TableData } from './types';

// Operators definition based on data type
export const operators: Record<string, OperatorDefinition[]> = {
  string: [
    {
      label: 'chứa',
      value: 'contains',
      apply: (itemVal: string, filterVal: string) =>
        itemVal.toLowerCase().includes(filterVal.toLowerCase()),
    },
    {
      label: 'bằng',
      value: 'equals',
      apply: (itemVal: string, filterVal: string) =>
        itemVal.toLowerCase() === filterVal.toLowerCase(),
    },
    {
      label: 'bắt đầu bằng',
      value: 'startsWith',
      apply: (itemVal: string, filterVal: string) =>
        itemVal.toLowerCase().startsWith(filterVal.toLowerCase()),
    },
    {
      label: 'kết thúc bằng',
      value: 'endsWith',
      apply: (itemVal: string, filterVal: string) =>
        itemVal.toLowerCase().endsWith(filterVal.toLowerCase()),
    },
  ],
  select: [
    {
      label: 'bằng',
      value: 'equals',
      apply: (itemVal: string, filterVal: string) =>
        itemVal.toLowerCase() === filterVal.toLowerCase(),
    },
  ],
  number: [
    {
      label: 'bằng',
      value: 'equals',
      apply: (itemVal: number, filterVal: number) => itemVal === filterVal,
    },
    {
      label: 'lớn hơn',
      value: 'greaterThan',
      apply: (itemVal: number, filterVal: number) => itemVal > filterVal,
    },
    {
      label: 'nhỏ hơn',
      value: 'lessThan',
      apply: (itemVal: number, filterVal: number) => itemVal < filterVal,
    },
  ],
};

// Initial static data for the table
export const initialData: TableData[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@email.com',
    role: 'Developer',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'binh.tran@email.com',
    role: 'Designer',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Lê Hoàng Cường',
    email: 'cuong.le@email.com',
    role: 'Manager',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    email: 'dung.pham@email.com',
    role: 'Tester',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Hoàng Minh Đức',
    email: 'duc.hoang@email.com',
    role: 'Developer',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Võ Thị Em',
    email: 'em.vo@email.com',
    role: 'Designer',
    status: 'Inactive',
  },
  {
    id: 7,
    name: 'Đỗ Văn Phúc',
    email: 'phuc.do@email.com',
    role: 'Manager',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Bùi Thị Giang',
    email: 'giang.bui@email.com',
    role: 'Tester',
    status: 'Active',
  },
  {
    id: 9,
    name: 'Lý Văn Hải',
    email: 'hai.ly@email.com',
    role: 'Developer',
    status: 'Inactive',
  },
  {
    id: 10,
    name: 'Phan Thị Inh',
    email: 'inh.phan@email.com',
    role: 'Designer',
    status: 'Active',
  },
  {
    id: 11,
    name: 'Ngô Văn Khang',
    email: 'khang.ngo@email.com',
    role: 'Manager',
    status: 'Active',
  },
  {
    id: 12,
    name: 'Đinh Thị Lan',
    email: 'lan.dinh@email.com',
    role: 'Tester',
    status: 'Inactive',
  },
  {
    id: 13,
    name: 'Vũ Văn Minh',
    email: 'minh.vu@email.com',
    role: 'Developer',
    status: 'Active',
  },
  {
    id: 14,
    name: 'Tô Thị Nga',
    email: 'nga.to@email.com',
    role: 'Designer',
    status: 'Active',
  },
  {
    id: 15,
    name: 'Lưu Văn Oanh',
    email: 'oanh.luu@email.com',
    role: 'Manager',
    status: 'Inactive',
  },
];

// Function to get sort icon type based on sort order
export const getSortIconType = (columnKey: string, sortConfig: any): 'none' | 'asc' | 'desc' => {
  if (sortConfig.key !== columnKey) {
    return 'none';
  }
  if (sortConfig.order === 'asc') {
    return 'asc';
  }
  return 'desc';
};

// Function to generate pagination numbers with ellipsis
export const getPaginationNumbers = (currentPage: number, totalPages: number) => {
  const delta = 2; // Number of pages to show around the current page
  const range = [];
  const rangeWithDots = [];

  // Pages around the current page
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  // Add first page and ellipsis if needed
  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  // Add pages in range
  rangeWithDots.push(...range);

  // Add last page and ellipsis if needed
  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages);
  } else {
    if (totalPages > 1) rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
};
