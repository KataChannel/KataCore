'use client';
import React from 'react';

export default function AdminMenuTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Menu Test</h1>
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <p className="text-blue-800">
          Nếu bạn thấy trang này, nghĩa là admin layout đang hoạt động.
          Hãy kiểm tra sidebar bên trái để xem menu từ database.
        </p>
        <p className="text-blue-600 mt-2">
          Menu sẽ bao gồm: Dashboard, CMS, SEO, HRM, CRM, Social, Information Hub, v.v.
        </p>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Kiểm tra:</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Sidebar có hiển thị không?</li>
          <li>✅ Menu items có đầy đủ 14 mục chính không?</li>
          <li>✅ Icons có hiển thị đúng không?</li>
          <li>✅ Có submenu không?</li>
        </ul>
      </div>
    </div>
  );
}
