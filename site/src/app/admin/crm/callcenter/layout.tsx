import { ReactNode } from 'react';
import { ThemeManager } from '@/components/ThemeManager';

interface CallCenterLayoutProps {
    children: ReactNode;
}

export default function CallCenterLayout({ children }: CallCenterLayoutProps) {
    return (
        <ThemeManager>
            <div className="min-h-screen bg-background">
            <div className="border border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <h1 className="text-3xl font-bold text-foreground">Call Center</h1>
                    <nav className="flex space-x-8">
                    <a href="/admin/crm/callcenter/dashboard" 
                       className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Dashboard
                    </a>
                    <a href="/admin/crm/callcenter/calls" 
                       className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Calls
                    </a>
                    <a href="/admin/crm/callcenter/agents" 
                       className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Agents
                    </a>
                    <a href="/admin/crm/callcenter/reports" 
                       className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Reports
                    </a>
                    </nav>
                </div>
                </div>
            </div>
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            </div>
        </ThemeManager>
    );
}