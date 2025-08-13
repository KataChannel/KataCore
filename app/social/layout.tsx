import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Integration - Facebook',
  description: 'Quản lý tích hợp mạng xã hội Facebook với đồng bộ dữ liệu',
};

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
