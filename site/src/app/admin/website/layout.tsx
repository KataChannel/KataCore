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
            {/* Header */}
            <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl md:text-2xl font-bold text-black dark:text-white">
                            CRM Dashboard
                        </h1>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 font-medium"
                                >
                                    {item.label}
                                </a>
                            ))}
                            
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? (
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                ) : (
                                    <Moon className="h-5 w-5 text-gray-600" />
                                )}
                            </button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-2">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? (
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                ) : (
                                    <Moon className="h-5 w-5 text-gray-600" />
                                )}
                            </button>
                            
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                aria-label="Toggle mobile menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
                        <nav className="px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="block py-2 px-3 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="bg-white dark:bg-black min-h-[calc(100vh-8rem)] rounded-lg border border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-colors duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}