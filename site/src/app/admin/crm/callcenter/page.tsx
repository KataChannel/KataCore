'use client';

import React, { useState, useEffect } from 'react';
import { PhoneIcon, UsersIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import ExtensionManagement from './components/ExtensionManagement';
import CallHistoryOverview from './components/CallHistoryOverview';
import SIPPhone from './components/SIPPhone';
import CallCenterSettings from './components/CallCenterSettings';
import { SIPConfig } from './types/callcenter.types';
import { useCallCenter } from './layout';

export default function CallCenterPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sipConfig, setSipConfig] = useState<SIPConfig>({
        uri: 'sip:9999@tazaspa102019',
        password: 'NtRrcSl8Zp',
        ws_servers: 'wss://pbx01.onepos.vn:5000',
        display_name: 'Call Center Agent'
    });

    // Use call center context for shared state
    const { updateSipStatus, updateActiveExtension } = useCallCenter();

    // Load configuration from localStorage on mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('callcenter_sip_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                setSipConfig(config);
                // Extract extension from URI and update context
                const extensionMatch = config.uri.match(/sip:(\d+)@/);
                if (extensionMatch) {
                    updateActiveExtension(extensionMatch[1] || null);
                }
            } catch (error) {
                console.error('Error loading saved configuration:', error);
            }
        }
    }, [updateActiveExtension]);

    const handleConfigChange = (newConfig: SIPConfig) => {
        setSipConfig(newConfig);
        // Update active extension in layout context
        const extensionMatch = newConfig.uri.match(/sip:(\d+)@/);
        if (extensionMatch) {
            updateActiveExtension(extensionMatch[1] || null);
        }
        // Save to localStorage
        localStorage.setItem('callcenter_sip_config', JSON.stringify(newConfig));
    };

    const tabs = [
        {
            id: 'overview',
            name: 'Tổng quan cuộc gọi',
            description: 'Lịch sử cuộc gọi, thống kê và báo cáo',
            icon: ChartBarIcon,
            component: <CallHistoryOverview />
        },
        {
            id: 'extensions',
            name: 'Quản lý Extension',
            description: 'CRUD extension, gán user và quản lý mật khẩu',
            icon: UsersIcon,
            component: <ExtensionManagement />
        },
        {
            id: 'phone',
            name: 'Điện thoại SIP',
            description: 'Gọi điện, nhận cuộc gọi và điều khiển',
            icon: PhoneIcon,
            component: <SIPPhone config={sipConfig} onStatusChange={updateSipStatus} />
        },
        {
            id: 'settings',
            name: 'Cài đặt hệ thống',
            description: 'Cấu hình SIP, tùy chọn cuộc gọi và hệ thống',
            icon: CogIcon,
            component: <CallCenterSettings onConfigChange={handleConfigChange} />
        }
    ];

    return (

        <div className="container mx-auto p-4 sm:p-6 transition-colors duration-300">
            {/* Enhanced Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex space-x-4 xl:space-x-8 px-4 xl:px-6 overflow-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-3 xl:py-4 px-1 border-b-2 font-medium text-xs xl:text-sm whitespace-nowrap transition-colors duration-200 ${
                                        isActive
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 xl:h-5 xl:w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                    <div className="text-left">
                                        <div className="leading-tight">{tab.name}</div>
                                        {/* {tab.description && (
                                            <div className="text-xs text-gray-400 dark:text-gray-500 font-normal hidden xl:block">
                                                {tab.description}
                                            </div>
                                        )} */}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Tablet Navigation */}
                    <nav className="hidden md:flex lg:hidden overflow-x-auto px-4">
                        <div className="flex space-x-1 min-w-max">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                                            isActive
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                        <span className="leading-tight">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full px-4 py-3 text-base text-gray-900 dark:text-white bg-transparent border-0 focus:ring-0 focus:outline-none"
                        >
                            {tabs.map((tab) => (
                                <option key={tab.id} value={tab.id} className="bg-white dark:bg-gray-800">
                                    {tab.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile Tab Icons */}
                    <div className="md:hidden px-2 pb-3">
                        <div className="grid grid-cols-4 gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                                            isActive
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        <span className="text-xs mt-1 text-center leading-tight">
                                            {tab.name.split(' ')[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
                <div className="p-3 sm:p-4 lg:p-6">
                    {tabs.find(tab => tab.id === activeTab)?.component}
                </div>
            </div>


        </div>

    );
}