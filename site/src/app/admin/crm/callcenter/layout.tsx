import { ReactNode } from 'react';

interface CallCenterLayoutProps {
    children: ReactNode;
}

export default function CallCenterLayout({ children }: CallCenterLayoutProps) {
    return (
        <div className="call-center-layout">
            <div className="call-center-header">
                <h1>Call Center</h1>
                <div className="call-center-nav">
                    <nav>
                        <a href="/admin/crm/callcenter/dashboard">Dashboard</a>
                        <a href="/admin/crm/callcenter/calls">Calls</a>
                        <a href="/admin/crm/callcenter/agents">Agents</a>
                        <a href="/admin/crm/callcenter/reports">Reports</a>
                    </nav>
                </div>
            </div>
            <main className="call-center-content">
                {children}
            </main>
        </div>
    );
}