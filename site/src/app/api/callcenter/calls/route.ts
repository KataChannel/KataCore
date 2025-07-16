import { NextRequest, NextResponse } from 'next/server';

// Types
interface Call {
    id: string;
    customerName: string;
    phoneNumber: string;
    extensionNumber?: string;
    status: 'completed' | 'missed' | 'failed' | 'busy';
    direction: 'inbound' | 'outbound';
    timestamp: Date;
    duration?: number;
    hangupCause?: string;
    recordingUrl?: string;
    notes?: string;
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
    recording_url?: string;
}

// Mock CDR data - in production, this would come from FreeSWITCH CDR database
let mockCDRData: CDRRecord[] = [
    {
        uuid: '1234-5678-9012-3456',
        caller_id_number: '+84977272967',
        destination_number: '2001',
        start_stamp: '2024-01-15 10:30:00',
        end_stamp: '2024-01-15 10:32:30',
        duration: 150,
        billsec: 150,
        hangup_cause: 'NORMAL_CLEARING',
        direction: 'inbound',
        recording_url: '/recordings/call_1234.wav'
    },
    {
        uuid: '2345-6789-0123-4567',
        caller_id_number: '2001',
        destination_number: '+84123456789',
        start_stamp: '2024-01-15 11:15:00',
        end_stamp: '2024-01-15 11:18:45',
        duration: 225,
        billsec: 225,
        hangup_cause: 'NORMAL_CLEARING',
        direction: 'outbound',
        recording_url: '/recordings/call_2345.wav'
    },
    {
        uuid: '3456-7890-1234-5678',
        caller_id_number: '+84987654321',
        destination_number: '2002',
        start_stamp: '2024-01-15 14:22:00',
        end_stamp: '2024-01-15 14:22:00',
        duration: 0,
        billsec: 0,
        hangup_cause: 'NO_ANSWER',
        direction: 'inbound'
    }
];

// Mock call notes storage
let callNotes: { [callId: string]: string } = {};

function transformCDRToCall(cdr: CDRRecord): Call {
    const call: Call = {
        id: cdr.uuid,
        customerName: getCustomerName(cdr.caller_id_number, cdr.destination_number, cdr.direction),
        phoneNumber: cdr.direction === 'inbound' ? cdr.caller_id_number : cdr.destination_number,
        extensionNumber: cdr.direction === 'inbound' ? cdr.destination_number : cdr.caller_id_number,
        status: getCallStatus(cdr.hangup_cause, cdr.billsec),
        direction: cdr.direction as 'inbound' | 'outbound',
        timestamp: new Date(cdr.start_stamp),
        duration: cdr.billsec,
        hangupCause: cdr.hangup_cause,
        notes: callNotes[cdr.uuid] || ''
    };
    
    if (cdr.recording_url) {
        call.recordingUrl = cdr.recording_url;
    }
    
    return call;
}

function getCustomerName(callerNumber: string, destinationNumber: string, direction: string): string {
    const customerNumber = direction === 'inbound' ? callerNumber : destinationNumber;
    return `Customer ${customerNumber}`;
}

function getCallStatus(hangupCause: string, billsec: number): Call['status'] {
    if (billsec > 0) return 'completed';
    if (hangupCause === 'NO_ANSWER' || hangupCause === 'USER_NOT_REGISTERED') return 'missed';
    if (hangupCause === 'USER_BUSY') return 'busy';
    return 'failed';
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const extension = searchParams.get('extension');
        const userId = searchParams.get('userId');
        const direction = searchParams.get('direction');
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let filteredData = [...mockCDRData];

        // Apply filters
        if (extension) {
            filteredData = filteredData.filter(cdr => 
                cdr.caller_id_number === extension || cdr.destination_number === extension
            );
        }

        if (direction && direction !== 'all') {
            filteredData = filteredData.filter(cdr => cdr.direction === direction);
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filteredData = filteredData.filter(cdr => new Date(cdr.start_stamp) >= fromDate);
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredData = filteredData.filter(cdr => new Date(cdr.start_stamp) <= toDate);
        }

        if (search) {
            filteredData = filteredData.filter(cdr =>
                cdr.caller_id_number.includes(search) ||
                cdr.destination_number.includes(search) ||
                cdr.hangup_cause.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Transform to Call objects
        let calls = filteredData.map(transformCDRToCall);

        // Apply status filter after transformation
        if (status && status !== 'all') {
            calls = calls.filter(call => call.status === status);
        }

        // Sort by timestamp (newest first)
        calls.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCalls = calls.slice(startIndex, endIndex);

        // Calculate summary statistics
        const summary = {
            total: calls.length,
            completed: calls.filter(c => c.status === 'completed').length,
            missed: calls.filter(c => c.status === 'missed').length,
            failed: calls.filter(c => c.status === 'failed').length,
            busy: calls.filter(c => c.status === 'busy').length,
            totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0),
            averageDuration: calls.length > 0 ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length) : 0
        };

        return NextResponse.json({
            data: paginatedCalls,
            summary,
            pagination: {
                page,
                limit,
                total: calls.length,
                totalPages: Math.ceil(calls.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching calls:', error);
        return NextResponse.json(
            { error: 'Failed to fetch call data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, callId, notes } = body;

        if (action === 'updateNotes') {
            if (!callId) {
                return NextResponse.json(
                    { error: 'Call ID is required' },
                    { status: 400 }
                );
            }

            callNotes[callId] = notes || '';

            return NextResponse.json({
                message: 'Notes updated successfully',
                callId,
                notes: callNotes[callId]
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating call data:', error);
        return NextResponse.json(
            { error: 'Failed to update call data' },
            { status: 500 }
        );
    }
}
