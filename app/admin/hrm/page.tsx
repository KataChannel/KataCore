"use client";

import React from 'react';
import EmployeeTable from './components/EmployeeTable';
import EmployeeTableAdvanced from './components/EmployeeTableAdvanced';

export default function HRMAdminPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">HRM - Employee Management</h1>
      </div>
      <div className="mt-6">
        {/* <EmployeeTable /> */}
        <EmployeeTableAdvanced />
      </div>
    </div>
  );
}
