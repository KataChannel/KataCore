'use client';
import { useState, useEffect, useRef } from 'react';
import JsSIP from 'jssip';
import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';
import { useTranslation } from '@/hooks/useI18n';

interface Call {
    id: string;
    customerName: string;
    phoneNumber: string;
    status: 'pending' | 'in-progress' | 'completed' | 'missed';
    timestamp: Date;
    duration?: number;
    notes?: string;
    callDirection?: 'inbound' | 'outbound';
    recordingUrl?: string;
}

interface CDRRecord {
    uuid: string;
    caller_id_number: string;
    destination_number: string;
    start_stamp: string;
    end_stamp: string;
    duration: number;
    billsec: number;
    hangup_cause: string;
    direction: string;
}

interface SIPConfig {
    uri: string;
    password: string;
    ws_servers: string;
    display_name?: string;
}

export default function CallCenterPage() {
    // Sử dụng unified theme hook và translation
    const { actualMode, isLoading: themeLoading, setLanguage, toggleLanguage } = useUnifiedTheme();
    const { t } = useTranslation('callcenter');
    
    const [calls, setCalls] = useState<Call[]>([]);
    const [selectedCall, setSelectedCall] = useState<Call | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [callStatus, setCallStatus] = useState<string>('');
    const [callDuration, setCallDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    
    const userAgent = useRef<any>(null);
    const callTimer = useRef<NodeJS.Timeout | null>(null);
    const remoteAudio = useRef<HTMLAudioElement>(null);

    // SIP Configuration
    const sipConfig: SIPConfig = {
        uri: 'sip:9999@tazaspa102019',
        password: 'NtRrcSl8Zp',
        ws_servers: 'wss://pbx01.onepos.vn:5000',
        display_name: 'Call Center Agent'
    };

    // API Configuration
    const apiConfig = {
        baseUrl: 'https://pbx01.onepos.vn:8080/api/v2',
        domain: 'tazaspa102019',
        callerIdNumber: '2008'
    };

    useEffect(() => {
        setMounted(true);
        initializeSIP();
        fetchCDRData();

        return () => {
            if (userAgent.current) {
                userAgent.current.stop();
            }
            if (callTimer.current) {
                clearInterval(callTimer.current);
            }
        };
    }, []);

    const fetchCDRData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const fromDate = `${dateRange.from} 00:00:00`;
            const toDate = `${dateRange.to} 23:59:59`;
            
            const params = new URLSearchParams({
                domain: apiConfig.domain,
                limit: '10',
                from: fromDate,
                to: toDate,
                caller_id_number: apiConfig.callerIdNumber,
                offset: '0'
            });

            console.log('Calling API with params:', params.toString());

            const response = await fetch(`/api/cdr?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Received data:', data);
            
            const cdrRecords: CDRRecord[] = data.data || data || [];

            if (cdrRecords.length === 0) {
                console.warn('No CDR records found for the specified date range');
            }

            const transformedCalls: Call[] = cdrRecords.map((record, index) => ({
                id: record.uuid || index.toString(),
                customerName: getCustomerName(record.caller_id_number, record.destination_number),
                phoneNumber: record.direction === 'inbound' ? record.caller_id_number : record.destination_number,
                status: getCallStatus(record.hangup_cause, record.billsec),
                timestamp: new Date(record.start_stamp),
                duration: record.billsec,
                callDirection: record.direction as 'inbound' | 'outbound',
                notes: `Call ${record.direction} - ${record.hangup_cause}`
            }));

            setCalls(transformedCalls);
            console.log('Transformed calls:', transformedCalls);
            
        } catch (error) {
            console.error('Error fetching CDR data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Failed to fetch call data: ${errorMessage}`);
            
            const mockCalls: Call[] = [
                {
                    id: '1',
                    customerName: 'John Doe',
                    phoneNumber: '+84977272967',
                    status: 'pending',
                    timestamp: new Date(),
                    callDirection: 'inbound'
                },
                {
                    id: '2',
                    customerName: 'Jane Smith',
                    phoneNumber: '+84123456789',
                    status: 'completed',
                    timestamp: new Date(Date.now() - 3600000),
                    duration: 125,
                    callDirection: 'outbound'
                },
                {
                    id: '3',
                    customerName: 'Bob Wilson',
                    phoneNumber: '+84987654321',
                    status: 'missed',
                    timestamp: new Date(Date.now() - 7200000),
                    callDirection: 'inbound'
                }
            ];
            
            setCalls(mockCalls);
        } finally {
            setIsLoading(false);
        }
    };

    const getCustomerName = (callerNumber: string, destinationNumber: string): string => {
        const number = callerNumber !== apiConfig.callerIdNumber ? callerNumber : destinationNumber;
        return `Customer ${number}`;
    };

    const getCallStatus = (hangupCause: string, billsec: number): Call['status'] => {
        if (billsec > 0) return 'completed';
        if (hangupCause === 'NO_ANSWER' || hangupCause === 'USER_NOT_REGISTERED') return 'missed';
        return 'completed';
    };

    const initializeSIP = () => {
        const socket = new JsSIP.WebSocketInterface(sipConfig.ws_servers);
        const configuration = {
            sockets: [socket],
            uri: sipConfig.uri,
            password: sipConfig.password,
            display_name: sipConfig.display_name,
        };
        console.log('SIP Configuration:', configuration);
        
        userAgent.current = new JsSIP.UA(configuration);
        userAgent.current.on('newMessage', (e: any) => {
            console.log('New message received:', e);
        });
        userAgent.current.on('registered', () => {
            console.log('SIP registered');
            setIsRegistered(true);
        });

        userAgent.current.on('unregistered', () => {
            console.log('SIP unregistered');
            setIsRegistered(false);
        });

        userAgent.current.on('registrationFailed', (e: any) => {
            console.error('SIP registration failed:', e);
            setIsRegistered(false);
        });

        userAgent.current.on('newRTCSession', (e: any) => {
            const session = e.session;
            setCurrentSession(session);

            session.on('accepted', () => {
                setCallStatus('Connected');
                startCallTimer();
            });

            session.on('ended', () => {
                setCallStatus('Ended');
                setCurrentSession(null);
                stopCallTimer();
                setTimeout(fetchCDRData, 2000);
            });

            session.on('failed', () => {
                setCallStatus('Failed');
                setCurrentSession(null);
                stopCallTimer();
            });

            session.on('addstream', (e: any) => {
                if (remoteAudio.current) {
                    remoteAudio.current.srcObject = e.stream;
                    remoteAudio.current.play();
                }
            });
        });

        userAgent.current.start();
    };

    const makeCall = (phoneNumber: string) => {
        if (!userAgent.current || !isRegistered) {
            alert('SIP not registered. Please check your configuration.');
            return;
        }

        const target = `sip:${phoneNumber}@pbx01.onepos.vn`;
        const options = {
            mediaConstraints: { audio: true, video: false }
        };

        try {
            const session = userAgent.current.call(target, options);
            setCurrentSession(session);
            setCallStatus('Calling...');
        } catch (error) {
            console.error('Error making call:', error);
            alert('Failed to make call');
        }
    };

    const hangupCall = () => {
        if (currentSession) {
            currentSession.terminate();
            setCurrentSession(null);
            setCallStatus('');
            stopCallTimer();
        }
    };

    const startCallTimer = () => {
        setCallDuration(0);
        callTimer.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const stopCallTimer = () => {
        if (callTimer.current) {
            clearInterval(callTimer.current);
            callTimer.current = null;
        }
        setCallDuration(0);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const updateCallNotes = (notes: string) => {
        if (selectedCall) {
            setSelectedCall({
                ...selectedCall,
                notes
            });
        }
    };

    const saveCallNotes = () => {
        if (selectedCall) {
            setCalls(prevCalls => 
                prevCalls.map(call => 
                    call.id === selectedCall.id ? selectedCall : call
                )
            );
            alert(t('notesSaved'));
        }
    };

    const filteredCalls = calls.filter(call =>
        call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phoneNumber.includes(searchTerm)
    );

    const getStatusColor = (status: Call['status']) => {
        switch (status) {
            case 'pending': return 'badge badge-warning';
            case 'in-progress': return 'badge badge-primary';
            case 'completed': return 'badge badge-success';
            case 'missed': return 'badge badge-error';
            default: return 'badge badge-ghost';
        }
    };

    const getStatusText = (status: Call['status']) => {
        switch (status) {
            case 'pending': return t('pending');
            case 'in-progress': return t('inProgress');
            case 'completed': return t('completed');
            case 'missed': return t('missed');
            default: return status;
        }
    };

    // Prevent hydration mismatch
    if (!mounted || themeLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-96">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 transition-colors duration-300">
            <audio ref={remoteAudio} autoPlay />
            
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">{t('title')}</h1>
                        <p className="text-text-secondary mt-2">{t('dashboard')}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="btn btn-outline btn-sm"
                            title="Toggle Language"
                        >
                            🌐 VI/EN
                        </button>
                        
                        <div className={`flex items-center space-x-2 ${isRegistered ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium">{isRegistered ? t('sipConnected') : t('sipDisconnected')}</span>
                        </div>
                        {currentSession && (
                            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                                {callStatus} - {formatDuration(callDuration)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white dark:bg-gray-800 shadow-lg mb-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                {t('fromDate')}
                            </label>
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                {t('toDate')}
                            </label>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <button
                            onClick={fetchCDRData}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {t('loading')}
                                </>
                            ) : (
                                t('refreshData')
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="form-control mb-6">
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full bg-background text-primary border-border focus:border-accent"
                />
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error mb-6 bg-red-100 border-red-300 text-red-800">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                    <div className="flex-none">
                        <button 
                            className="btn btn-sm btn-ghost"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Call Records Table */}
                <div className="lg:col-span-2">
                    <div className="card bg-surface shadow-xl border border-border">
                        <div className="card-header px-6 py-4 border-b border-border">
                            <h2 className="card-title text-primary">
                                {t('callRecords')} ({filteredCalls.length})
                                {isLoading && <span className="loading loading-dots loading-sm text-accent"></span>}
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('customer')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('phoneNumber')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('direction')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('duration')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('time')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            {t('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-border">
                                    {filteredCalls.map((call) => (
                                        <tr key={call.id} className="hover:bg-hover transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                {call.customerName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {call.phoneNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    call.callDirection === 'inbound' 
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                }`}>
                                                    {call.callDirection === 'inbound' ? '📞 In' : '📱 Out'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                                    {getStatusText(call.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {call.duration ? formatDuration(call.duration) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {call.timestamp.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary space-x-2">
                                                <button
                                                    onClick={() => setSelectedCall(call)}
                                                    className="text-accent hover:text-accent/80 transition-colors"
                                                >
                                                    {t('viewDetails')}
                                                </button>
                                                <button
                                                    onClick={() => makeCall(call.phoneNumber)}
                                                    disabled={!isRegistered || !!currentSession}
                                                    className="text-success hover:text-success/80 disabled:text-text-secondary/40 ml-2 transition-colors"
                                                >
                                                    📞 Call
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Active Call Section */}
                    {currentSession && (
                        <div className="alert alert-error mb-4 bg-red-100 border-red-300 text-red-800">
                            <div>
                                <h3 className="text-lg font-medium mb-2">{t('activeCall')}</h3>
                                <div className="space-y-2">
                                    <p className="text-sm">Status: {callStatus}</p>
                                    <p className="text-sm">Duration: {formatDuration(callDuration)}</p>
                                    <button
                                        onClick={hangupCall}
                                        className="btn btn-error w-full"
                                    >
                                        🔴 {t('hangUp')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Call Details Section */}
                    <div className="card bg-surface shadow-xl border border-border">
                        <div className="card-body">
                            <h3 className="card-title text-primary mb-4">{t('callDetails')}</h3>
                            {selectedCall ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary">{t('customer')}</label>
                                        <p className="mt-1 text-sm text-primary">{selectedCall.customerName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary">{t('phoneNumber')}</label>
                                        <p className="mt-1 text-sm text-primary">{selectedCall.phoneNumber}</p>
                                        <button
                                            onClick={() => makeCall(selectedCall.phoneNumber)}
                                            disabled={!isRegistered || !!currentSession}
                                            className="btn btn-sm btn-success mt-2"
                                        >
                                            📞 {t('makeCall')}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary">{t('direction')}</label>
                                        <p className="mt-1 text-sm text-primary">
                                            {selectedCall.callDirection === 'inbound' ? t('incomingCall') : t('outgoingCall')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary">{t('status')}</label>
                                        <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCall.status)}`}>
                                            {getStatusText(selectedCall.status)}
                                        </span>
                                    </div>
                                    {selectedCall.duration && (
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary">{t('duration')}</label>
                                            <p className="mt-1 text-sm text-primary">{formatDuration(selectedCall.duration)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary">{t('notes')}</label>
                                        <textarea
                                            className="textarea textarea-bordered w-full mt-1 bg-background text-primary border-border focus:border-accent"
                                            rows={4}
                                            value={selectedCall.notes || ''}
                                            onChange={(e) => updateCallNotes(e.target.value)}
                                            placeholder={t('addNotes')}
                                        />
                                    </div>
                                    <button 
                                        onClick={saveCallNotes}
                                        className="btn btn-primary w-full hover:bg-accent/90"
                                    >
                                        {t('saveNotes')}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-text-secondary">{t('selectCall')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
