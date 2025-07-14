import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - TazaCore',
  description: 'Login and registration for TazaCore system',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
