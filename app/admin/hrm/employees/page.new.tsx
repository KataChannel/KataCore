"use client";

import React from 'react';
import EmployeeTable from '../components/EmployeeTable.new';

export default function HRMAdminPageNew() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Human Resources Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your organization's workforce with advanced tools and analytics
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-xs text-gray-500">Total Employees</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-green-600">142</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-yellow-600">14</div>
                  <div className="text-xs text-gray-500">On Leave</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow">
          <EmployeeTable />
        </div>

        {/* Additional Actions Footer */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500">Common HR management tasks</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Bulk Import
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
