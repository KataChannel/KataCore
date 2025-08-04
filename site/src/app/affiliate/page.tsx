/**
 * ============================================================================
 * AFFILIATE PAGE - TEST IMPLEMENTATION
 * ============================================================================
 * Test page for the affiliate dashboard functionality
 */

'use client';

import React, { useState } from 'react';
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Affiliate Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your affiliate program and track performance
          </p>
        </div>

        {/* Dashboard */}
        <div className="px-4 sm:px-0">
          <AffiliateDashboard />
        </div>
      </div>
    </div>
  );
}
