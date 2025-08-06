// Simple Table component export
import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <table className={`min-w-full ${className}`}>
      {children}
    </table>
  );
};

export default Table;
