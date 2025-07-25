import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Types
interface Call {
    id: string;
    customerName: string;
    phoneNumber: string;
    extensionNumber?: string;
    status: 'completed' | 'missed' | 'failed' | 'busy';
    direction: 'inbound' | 'outbound';
    timestamp: Date;
    startEpoch?: number;
    endEpoch?: number;
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
// Mock call notes storage
let callNotes: { [callId: string]: string } = {};


function getCustomerName(callerNumber: string, destinationNumber: string, direction: string): string {
    const customerNumber = direction === 'inbound' ? callerNumber : destinationNumber;
    return `${customerNumber}`;
}

function getCallStatus(hangupCause: string, billsec: number): Call['status'] {
    if (billsec > 0) return 'completed';
    if (hangupCause === 'NO_ANSWER' || hangupCause === 'USER_NOT_REGISTERED') return 'missed';
    if (hangupCause === 'USER_BUSY') return 'busy';
    return 'failed';
}

export async function GET(request: NextRequest) {
    console.log('Fetching call history with query:', request.url);
    
    try {
        const { searchParams } = new URL(request.url);
        const extension = searchParams.get('extCode');
        const phoneNumber = searchParams.get('phoneNumber');
        const userId = searchParams.get('userId');
        const direction = searchParams.get('direction');
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Import Prisma client
        const prisma = new PrismaClient();

        try {
            // Build where clause for database query
            const whereClause: any = {};

            // Apply filters for extension or phoneNumber
            if (extension || phoneNumber) {
                console.log('Applying extension or phone number filter:', { extension, phoneNumber });
                
                const searchValue = extension || phoneNumber;
                console.log('Search value for extension or phone number:', searchValue);
                
                whereClause.OR = [
                    { callerIdNumber: { contains: searchValue } },
                    { outboundCallerIdNumber: { contains: searchValue } },
                    { destinationNumber: { contains: searchValue } }
                ];
            }

            if (direction && direction !== 'all') {
                whereClause.direction = direction;
            }

            if (dateFrom || dateTo) {
                whereClause.createdAt = {};
                if (dateFrom) {
                    whereClause.createdAt.gte = new Date(dateFrom);
                }
                if (dateTo) {
                    const toDate = new Date(dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    whereClause.createdAt.lte = toDate;
                }
            }

            if (search) {
                whereClause.OR = [
                    { callerIdNumber: { contains: search } },
                    { outboundCallerIdNumber: { contains: search } },
                    { destinationNumber: { contains: search } },
                    { sipHangupDisposition: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Fetch data from database
            const callHistoryRecords = await prisma.call_history_overview.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            });

            // Get total count for pagination
            const totalCount = await prisma.call_history_overview.count({
                where: whereClause
            });

            // Transform database records to Call objects
            let calls = callHistoryRecords.map((record: any) => transformDBRecordToCall(record));

            // Apply status filter after transformation
            if (status && status !== 'all') {
                calls = calls.filter(call => call.status === status);
            }

            // Calculate summary statistics from all matching records (not just paginated)
            const allMatchingRecords = await prisma.call_history_overview.findMany({
                where: whereClause
            });
            const allCalls = allMatchingRecords.map((record: any) => transformDBRecordToCall(record));
            const filteredCalls = status && status !== 'all' 
                ? allCalls.filter(call => call.status === status)
                : allCalls;

            const summary = {
                total: filteredCalls.length,
                completed: filteredCalls.filter(c => c.status === 'completed').length,
                missed: filteredCalls.filter(c => c.status === 'missed').length,
                failed: filteredCalls.filter(c => c.status === 'failed').length,
                busy: filteredCalls.filter(c => c.status === 'busy').length,
                totalDuration: filteredCalls.reduce((sum, c) => sum + (c.duration || 0), 0),
                averageDuration: filteredCalls.length > 0 ? Math.round(filteredCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / filteredCalls.length) : 0
            };
            
            return NextResponse.json({
                data: calls,
                summary,
                pagination: {
                    page,
                    limit,
                    total: status && status !== 'all' ? filteredCalls.length : totalCount,
                    totalPages: Math.ceil((status && status !== 'all' ? filteredCalls.length : totalCount) / limit)
                }
            });

        } finally {
            await prisma.$disconnect();
        }

    } catch (error) {
        console.error('Error fetching calls:', error);
        return NextResponse.json(
            { error: 'Failed to fetch call data' },
            { status: 500 }
        );
    }
}

function transformDBRecordToCall(record: any): Call {
    const call: Call = {
        id: record.cdrId,
        customerName: getCustomerNameFromDB(record),
        phoneNumber: record.direction === 'inbound' ? record.callerIdNumber : record.destinationNumber,
        extensionNumber: record.direction === 'inbound' ? record.destinationNumber : (record.outboundCallerIdNumber || record.callerIdNumber),
        status: getCallStatusFromDB(record.sipHangupDisposition, record.billsec, record.callStatus),
        direction: record.direction as 'inbound' | 'outbound',
        timestamp: record.createdAt,
        startEpoch: record.startEpoch || 0,
        endEpoch: record.endEpoch || 0,
        duration: parseInt(record.billsec || '0'),
        hangupCause: record.sipHangupDisposition,
        notes: callNotes[record.cdrId] || ''
    };
    
    if (record.recordPath) {
        call.recordingUrl = record.recordPath;
    }
    
    return call;
}

function getCustomerNameFromDB(record: any): string {
    const customerNumber = record.direction === 'inbound' 
        ? record.callerIdNumber 
        : record.destinationNumber;
    return `${customerNumber}`;
}

function getCallStatusFromDB(hangupCause: string | null, billsec: string | null, callStatus: string | null): Call['status'] {
    if (callStatus) {
        return callStatus as Call['status'];
    }
    
    const duration = parseInt(billsec || '0');
    if (duration > 0) return 'completed';
    if (hangupCause === 'NO_ANSWER' || hangupCause === 'USER_NOT_REGISTERED') return 'missed';
    if (hangupCause === 'USER_BUSY') return 'busy';
    return 'failed';
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
