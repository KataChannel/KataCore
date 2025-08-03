import { Suspense } from 'react';

// Simple loading skeleton
function CardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-50 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// Simple dashboard cards
function DashboardCards() {
  const cards = [
    { title: 'Total Users', value: '1,234', change: '+12%' },
    { title: 'Active Sessions', value: '456', change: '+8%' },
    { title: 'Revenue', value: '$12,345', change: '+15%' },
    { title: 'Growth Rate', value: '23%', change: '+5%' },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div key={index} className="rounded-xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className="text-sm text-green-600 font-medium">{card.change}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export default async function Page() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl md:text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Suspense fallback={
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        }>
          <DashboardCards />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">U</span>
              </div>
              <div>
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">$</span>
              </div>
              <div>
                <p className="text-sm font-medium">Payment processed</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium">Add User</div>
              <div className="text-xs text-gray-500">Create new account</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium">View Reports</div>
              <div className="text-xs text-gray-500">Analytics & insights</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium">Settings</div>
              <div className="text-xs text-gray-500">System configuration</div>
            </button>
            <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium">Support</div>
              <div className="text-xs text-gray-500">Help & documentation</div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
