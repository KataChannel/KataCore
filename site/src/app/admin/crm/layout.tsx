'use client';
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
interface CRMLayoutProps {
    children: React.ReactNode;
}

export default function CRMLayout({ children }: CRMLayoutProps) {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const navItems = [
        { href: '/admin/crm/customers', label: 'Customers' },
        { href: '/admin/crm/leads', label: 'Leads' },
        { href: '/admin/crm/reports', label: 'Reports' }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="bg-white dark:bg-black min-h-[calc(100vh-8rem)] rounded-lg border border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-colors duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}