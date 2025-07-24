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

// Helper function to fetch CDR data from API
async function fetchCDRData(apiUrl: URL): Promise<CDRResponse> {
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
    
    // Handle case where API returns success with total: 0 but no data array
    if (!result.data) {
        if (result.status === 'success' && result.total === 0) {
            result.data = [];
        } else {
            throw new Error('Invalid response format from CDR API');
        }
    }
    
    if (!Array.isArray(result.data)) {
        throw new Error('Invalid response format from CDR API');
    }

    return result;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            domain = 'tazaspa102019',
            limit = 10000000,
            from,
            to,
            caller_id_number,
            offset: initialOffset = 0
        } = body;

        // Validate required parameters
        if (!from || !to) {
            return NextResponse.json(
                { error: 'From and to dates are required' },
                { status: 400 }
            );
        }

        let allCDRRecords: any[] = [];
        let currentOffset = initialOffset;
        let totalFetched = 0;
        let hasMoreData = true;

        // Fetch data in batches if needed
        while (hasMoreData) {
            // Build API URL
            const apiUrl = new URL('https://pbx01.onepos.vn:8080/api/v2/cdrs');
            apiUrl.searchParams.set('domain', domain);
            apiUrl.searchParams.set('limit', limit.toString());
            apiUrl.searchParams.set('from', from);
            apiUrl.searchParams.set('to', to);
            apiUrl.searchParams.set('offset', currentOffset.toString());
            
            if (caller_id_number) {
                apiUrl.searchParams.set('caller_id_number', caller_id_number);
            }
            
            console.log(`Fetching CDR data from (offset: ${currentOffset}):`, apiUrl.toString());

            const result = await fetchCDRData(apiUrl);
            
            console.log(`Received ${result.data.length} CDR records (offset: ${currentOffset})`);
            
            // Add records to our collection
            allCDRRecords = allCDRRecords.concat(result.data);
            totalFetched += result.data.length;

            // Check if we need to continue fetching
            if (result.data.length >= 200) {
                currentOffset += 200;
                console.log(`Data length > 200, continuing with offset: ${currentOffset}`);
            } else {
                hasMoreData = false;
                console.log(`Data length <= 200, stopping fetch loop`);
            }

            // Safety check to prevent infinite loops
            if (currentOffset > 10000000) {
                console.warn('Reached maximum offset limit, stopping fetch');
                break;
            }
        }

        console.log(`\x1b[33mTotal CDR records fetched: ${totalFetched}\x1b[0m`);

        // Process and save data to database
        const savedRecords = [];
        const errors = [];

        // Prepare data for batch insert
        const recordsToInsert = [];
        const duplicateRecords = [];

        // First, check for existing records in batch
        const cdrIds = allCDRRecords.map((record:any) => record.uuid).filter(Boolean);
        const existingRecords = await prisma.callHistoryOverview.findMany({
            where: {
            cdrId: {
                in: cdrIds
            }
            },
            select: { cdrId: true }
        });

        const existingCdrIds = new Set(existingRecords.map(record => record.cdrId));

        // Prepare records for batch insert
        for (const record of allCDRRecords) {
            try {
            // Skip if record already exists
            if (existingCdrIds.has(record.uuid)) {
                duplicateRecords.push(record.uuid);
                continue;
            }

            // Use epoch values directly from the record
            const startEpoch = record.start_epoch || null;
            const endEpoch = record.end_epoch || null;
            const answerEpoch = record.answer_epoch !== "0" ? record.answer_epoch : null;

            // Use call_status from record or determine from sip_hangup_disposition
            let callStatus = record.call_status?.toLowerCase() || 'unknown';
            if (!record.call_status) {
                if (record.sip_hangup_disposition === 'NO_ANSWER' || record.sip_hangup_disposition === 'USER_NOT_REGISTERED') {
                callStatus = 'missed';
                } else if (record.sip_hangup_disposition === 'USER_BUSY') {
                callStatus = 'busy';
                } else if (record.sip_hangup_disposition === 'CALL_REJECTED') {
                callStatus = 'rejected';
                } else {
                callStatus = 'completed';
                }
            }

            recordsToInsert.push({
                cdrId: record.uuid,
                direction: record.direction || 'unknown',
                callerIdNumber: record.caller_id_number || null,
                outboundCallerIdNumber: record.outbound_caller_id_number || null,
                destinationNumber: record.destination_number || null,
                startEpoch: startEpoch,
                endEpoch: endEpoch,
                answerEpoch: answerEpoch,
                duration: record.duration || null,
                billsec: record.billsec || null,
                sipHangupDisposition: record.sip_hangup_disposition || null,
                recordPath: record.record_path || null,
                callStatus: callStatus,
            });
            
            } catch (recordError) {
            console.error(`Error processing record ${record.id}:`, recordError);
            errors.push({
                recordId: record.id,
                error: recordError instanceof Error ? recordError.message : 'Unknown error'
            });
            }
        }

        // Batch insert records in chunks to avoid database limits
        const BATCH_SIZE = 1000;
        let totalInserted = 0;

        for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
            const chunk = recordsToInsert.slice(i, i + BATCH_SIZE);
            try {
            const insertResult = await prisma.callHistoryOverview.createMany({
                data: chunk,
                skipDuplicates: true
            });
            totalInserted += insertResult.count;
            console.log(`Inserted batch ${Math.floor(i/BATCH_SIZE) + 1}: ${insertResult.count} records`);
            } catch (batchError) {
            console.error(`Error inserting batch ${Math.floor(i/BATCH_SIZE) + 1}:`, batchError);
            errors.push({
                batch: Math.floor(i/BATCH_SIZE) + 1,
                error: batchError instanceof Error ? batchError.message : 'Unknown batch error'
            });
            }
        }

        console.log(`Batch insert completed: ${totalInserted} records inserted, ${duplicateRecords.length} duplicates skipped`);
        savedRecords.push({ count: totalInserted, duplicates: duplicateRecords.length });

        // Update summary statistics if needed
        await updateCallSummaryStats(from, to);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${totalFetched} CDR records`,
            saved: totalInserted,
            errors: errors.length,
            errorDetails: errors.length > 0 ? errors : undefined,
            summary: {
                totalFetched: totalFetched,
                totalSaved: totalInserted,
                totalErrors: errors.length,
                duplicatesSkipped: duplicateRecords.length,
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
        // console.log('Call summary stats for', from, 'to', to, ':', callStats);

    } catch (error) {
        console.error('Error updating call summary stats:', error);
    }
}
