'use client';

import React from 'react';
import { useEmployees } from '@/hooks/useEmployees';

export default function TestEmployeeHook() {
  const { employees, loading, error, total } = useEmployees();

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Employee Hook Test</h1>
      <p className="mb-4">Total employees: {total}</p>
      <div className="space-y-2">
        {employees.map((employee) => (
          <div key={employee.id} className="p-2 border rounded">
            <h3 className="font-semibold">{employee.name}</h3>
            <p>{employee.email}</p>
            <p>{employee.department} - {employee.position}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
