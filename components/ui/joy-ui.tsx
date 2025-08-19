'use client';

import React from 'react';

// This file now imports and re-exports Tailwind-based components
// for backward compatibility with existing code

export {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Input,
  Textarea,
  Sheet,
  Box,
  Stack,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  CircularProgress,
  FormControl,
  FormLabel,
  FormHelperText,
} from './tailwind-ui';

// Legacy compatibility exports with Joy prefix
export {
  Button as JoyButton,
  Card as JoyCard,
  Input as JoyInput,
  Textarea as JoyTextarea,
  Typography as JoyTypography,
  Sheet as JoySheet,
  Chip as JoyChip,
  Avatar as JoyAvatar,
  IconButton as JoyIconButton,
  Divider as JoyDivider,
  Stack as JoyStack,
  Box as JoyBox,
} from './tailwind-ui';

// Table Component
export const Table = ({ children, hoverRow, ...props }: any) => (
  <table 
    className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${
      hoverRow ? '[&_tbody_tr:hover]:bg-gray-50 [&_tbody_tr:hover]:dark:bg-gray-800' : ''
    }`} 
    {...props}
  >
    {children}
  </table>
);

export const TableHead = ({ children, ...props }: any) => (
  <thead className="bg-gray-50 dark:bg-gray-900" {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, ...props }: any) => (
  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700" {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, ...props }: any) => (
  <tr {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, ...props }: any) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" {...props}>
    {children}
  </td>
);

export const TableHeaderCell = ({ children, ...props }: any) => (
  <th 
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400" 
    {...props}
  >
    {children}
  </th>
);

// Additional compatibility components
export const Modal = ({ children, open, onClose, ...props }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()} {...props}>
        {children}
      </div>
    </div>
  );
};

export const Select = ({ children, value, onChange, placeholder, ...props }: any) => (
  <select 
    value={value} 
    onChange={(e) => onChange?.(e.target.value)}
    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </select>
);

export const Option = ({ children, value, ...props }: any) => (
  <option value={value} {...props}>{children}</option>
);

export const Switch = ({ checked, onChange, ...props }: any) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange?.(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
    }`}
    {...props}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const Checkbox = ({ checked, onChange, children, ...props }: any) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      {...props}
    />
    {children && <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>}
  </label>
);

export const Badge = ({ children, badgeContent, color = 'primary', ...props }: any) => (
  <div className="relative inline-flex" {...props}>
    {children}
    {badgeContent && (
      <span className={`absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
        color === 'primary' ? 'text-white bg-blue-600' : 
        color === 'danger' ? 'text-white bg-red-600' :
        'text-white bg-gray-600'
      }`}>
        {badgeContent}
      </span>
    )}
  </div>
);

export const Grid = ({ children, container, spacing = 2, ...props }: any) => (
  <div 
    className={`${container ? 'grid' : ''} gap-${spacing}`} 
    style={container ? { gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' } : undefined}
    {...props}
  >
    {children}
  </div>
);

// Legacy exports
export const JoyModal = Modal;
export const JoyBadge = Badge;
export const JoyGrid = Grid;
