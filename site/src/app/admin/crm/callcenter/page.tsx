'use client';
import { useState, useEffect, useRef } from 'react';
import JsSIP from 'jssip';

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
    
    const userAgent = useRef<any>(null);
    const callTimer = useRef<NodeJS.Timeout | null>(null);
    const remoteAudio = useRef<HTMLAudioElement>(null);

    // SIP Configuration
    const sipConfig: SIPConfig = {
        uri: 'sip:9999@pbx01.onepos.vn',
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
        try {
            const fromDate = `${dateRange.from} 00:00:00`;
            const toDate = `${dateRange.to} 23:59:59`;
            
            const params = new URLSearchParams({
                domain: apiConfig.domain,
                limit: '10000',
                from: fromDate,
                to: toDate,
                caller_id_number: apiConfig.callerIdNumber,
                offset: '0'
            });

            const response = await fetch(`${apiConfig.baseUrl}/cdrs?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers if required
                    // 'Authorization': 'Bearer your-token'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const cdrRecords: CDRRecord[] = data.data || data || [];

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
        } catch (error) {
            console.error('Error fetching CDR data:', error);
            // Fallback to mock data if API fails
            setCalls([
                {
                    id: '1',
                    customerName: 'John Doe',
                    phoneNumber: '+84977272967',
                    status: 'pending',
                    timestamp: new Date(),
                    callDirection: 'inbound'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getCustomerName = (callerNumber: string, destinationNumber: string): string => {
        // You can implement a customer lookup logic here
        // For now, return a formatted name based on phone number
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
                // Refresh CDR data after call ends
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

    const filteredCalls = calls.filter(call =>
        call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phoneNumber.includes(searchTerm)
    );

    const getStatusColor = (status: Call['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'missed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <audio ref={remoteAudio} autoPlay />
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Call Center</h1>
                <div className="flex items-center justify-between">
                    <p className="text-gray-600">Manage customer calls and interactions</p>
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 ${isRegistered ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm">{isRegistered ? 'SIP Connected' : 'SIP Disconnected'}</span>
                        </div>
                        {currentSession && (
                            <div className="text-blue-600 text-sm">
                                {callStatus} - {formatDuration(callDuration)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="mb-4 flex items-center space-x-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={fetchCDRData}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Loading...' : 'Refresh Data'}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Call Records ({filteredCalls.length})
                                {isLoading && <span className="ml-2 text-blue-600">Loading...</span>}
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Direction
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCalls.map((call) => (
                                        <tr key={call.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {call.customerName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {call.phoneNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    call.callDirection === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {call.callDirection === 'inbound' ? '📞 In' : '📱 Out'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                                                    {call.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {call.duration ? formatDuration(call.duration) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {call.timestamp.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                                <button
                                                    onClick={() => setSelectedCall(call)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => makeCall(call.phoneNumber)}
                                                    disabled={!isRegistered || !!currentSession}
                                                    className="text-green-600 hover:text-green-900 disabled:text-gray-400 ml-2"
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

                <div className="lg:col-span-1">
                    {currentSession && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-medium text-red-900 mb-2">Active Call</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-red-700">Status: {callStatus}</p>
                                <p className="text-sm text-red-700">Duration: {formatDuration(callDuration)}</p>
                                <button
                                    onClick={hangupCall}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                                >
                                    🔴 Hang Up
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Call Details</h3>
                        {selectedCall ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedCall.customerName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <div className="flex items-center space-x-2">
                                        <p className="mt-1 text-sm text-gray-900">{selectedCall.phoneNumber}</p>
                                        <button
                                            onClick={() => makeCall(selectedCall.phoneNumber)}
                                            disabled={!isRegistered || !!currentSession}
                                            className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                                            title="Call this number"
                                        >
                                            📞
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Direction</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedCall.callDirection === 'inbound' ? 'Incoming Call' : 'Outgoing Call'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCall.status)}`}>
                                        {selectedCall.status}
                                    </span>
                                </div>
                                {selectedCall.duration && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDuration(selectedCall.duration)}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        rows={4}
                                        value={selectedCall.notes || ''}
                                        placeholder="Add call notes..."
                                    />
                                </div>
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                    Save Notes
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500">Select a call to view details</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}