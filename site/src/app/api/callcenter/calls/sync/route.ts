import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CDRRecord {
    id: string;
    caller_id_number: string;
    caller_id_name: string;
    destination_number: string;
    start_stamp: string;
    answer_stamp: string;
    end_stamp: string;
    duration: number;
    billsec: number;
    hangup_cause: string;
    direction: string;
    recording_file?: string;
    domain: string;
    extension_uuid?: string;
}

interface CDRResponse {
    data: CDRRecord[];
    total: number;
    limit: number;
    offset: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            domain = 'tazaspa102019',
            limit = 10000,
            from,
            to,
            caller_id_number,
            offset = 0
        } = body;

        // Validate required parameters
        if (!from || !to) {
            return NextResponse.json(
                { error: 'From and to dates are required' },
                { status: 400 }
            );
        }

        // Build API URL
        const apiUrl = new URL('https://pbx01.onepos.vn:8080/api/v2/cdrs');
        apiUrl.searchParams.set('domain', domain);
        apiUrl.searchParams.set('limit', limit.toString());
        apiUrl.searchParams.set('from', from);
        apiUrl.searchParams.set('to', to);
        apiUrl.searchParams.set('offset', offset.toString());
        
        if (caller_id_number) {
            apiUrl.searchParams.set('caller_id_number', caller_id_number);
        }

        console.log('Fetching CDR data from:', apiUrl.toString());

        // Fetch data from third-party API
        const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if required
                // 'Authorization': `Bearer ${process.env.PBX_API_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Invalid response format from CDR API');
        }

        console.log(`Received ${result.data.length} CDR records`);

        // Process and save data to database
        const savedRecords = [];
        const errors = [];

        for (const record of result.data) {
            try {
                // Check if record already exists
                const existingRecord = await prisma.callHistoryOverview.findUnique({
                    where: { cdrId: record.uuid }
                });

                if (existingRecord) {
                    console.log(`Record ${record.uuid} already exists, skipping...`);
                    continue;
                }

                // Convert timestamps to epoch
                const startTime = new Date(record.start_stamp);
                const answerTime = record.answer_stamp ? new Date(record.answer_stamp) : null;
                const endTime = new Date(record.end_stamp);
                
                const startEpoch = Math.floor(startTime.getTime() / 1000).toString();
                const endEpoch = Math.floor(endTime.getTime() / 1000).toString();
                const answerEpoch = answerTime ? Math.floor(answerTime.getTime() / 1000).toString() : null;

                // Determine call status
                let callStatus = 'completed';
                if (record.hangup_cause === 'NO_ANSWER' || record.hangup_cause === 'USER_NOT_REGISTERED') {
                    callStatus = 'missed';
                } else if (record.hangup_cause === 'USER_BUSY') {
                    callStatus = 'busy';
                } else if (record.hangup_cause === 'CALL_REJECTED') {
                    callStatus = 'rejected';
                }

                // Save to database
                const savedRecord = await prisma.callHistoryOverview.create({
                    data: {
                        cdrId: record.uuid,
                        direction: record.direction || 'unknown',
                        callerIdNumber: record.caller_id_number || null,
                        outboundCallerIdNumber: null, // Set based on your business logic
                        destinationNumber: record.destination_number || null,
                        startEpoch: startEpoch,
                        endEpoch: endEpoch,
                        answerEpoch: answerEpoch,
                        duration: record.duration?.toString() || null,
                        billsec: record.billsec?.toString() || null,
                        sipHangupDisposition: record.hangup_cause || null,
                        recordPath: record.recording_file || null,
                        callStatus: callStatus,
                    }
                });

                savedRecords.push(savedRecord);
                
            } catch (recordError) {
                console.error(`Error processing record ${record.id}:`, recordError);
                errors.push({
                    recordId: record.id,
                    error: recordError instanceof Error ? recordError.message : 'Unknown error'
                });
            }
        }

        // Update summary statistics if needed
        await updateCallSummaryStats(from, to);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${result.data.length} CDR records`,
            saved: savedRecords.length,
            errors: errors.length,
            errorDetails: errors.length > 0 ? errors : undefined,
            summary: {
                totalFetched: result.data.length,
                totalSaved: savedRecords.length,
                totalErrors: errors.length,
                dateRange: { from, to }
            }
        });

    } catch (error) {
        console.error('Error syncing CDR data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to sync CDR data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// GET endpoint to fetch sync status or trigger sync
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'status') {
            // Return sync status and recent records
            const recentRecords = await prisma.callHistoryOverview.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    cdrId: true,
                    callerIdNumber: true,
                    destinationNumber: true,
                    direction: true,
                    callStatus: true,
                    startEpoch: true,
                    duration: true,
                    createdAt: true
                }
            });

            const totalRecords = await prisma.callHistoryOverview.count();
            
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayStartEpoch = Math.floor(todayStart.getTime() / 1000).toString();
            
            const todayRecords = await prisma.callHistoryOverview.count({
                where: {
                    startEpoch: {
                        gte: todayStartEpoch
                    }
                }
            });

            return NextResponse.json({
                success: true,
                stats: {
                    totalRecords,
                    todayRecords,
                    lastSyncTime: recentRecords[0]?.createdAt || null
                },
                recentRecords
            });
        }

        // Default: trigger sync for today
        const today = new Date();
        const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
        const to = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`;

        // Trigger sync by calling POST method
        const syncRequest = new NextRequest(request.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to })
        });

        return POST(syncRequest);

    } catch (error) {
        console.error('Error in GET /api/callcenter/calls/sync:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process request',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper function to update call summary statistics
async function updateCallSummaryStats(from: string, to: string) {
    try {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const fromEpoch = Math.floor(fromDate.getTime() / 1000).toString();
        const toEpoch = Math.floor(toDate.getTime() / 1000).toString();

        // Calculate summary statistics for the date range
        const callStats = await prisma.callHistoryOverview.groupBy({
            by: ['callStatus'],
            where: {
                startEpoch: {
                    gte: fromEpoch,
                    lte: toEpoch
                }
            },
            _count: {
                _all: true
            }
        });

        // You can save these stats to a separate summary table if needed
        console.log('Call summary stats for', from, 'to', to, ':', callStats);

    } catch (error) {
        console.error('Error updating call summary stats:', error);
    }
}
