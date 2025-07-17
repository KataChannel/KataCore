import { NextRequest, NextResponse } from 'next/server';
import cron, { ScheduledTask } from 'node-cron';

// Store cron jobs
const cronJobs = new Map<string, ScheduledTask>();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            schedule = '0 */6 * * *', // Default: every 6 hours
            domain = 'tazaspa102019',
            caller_id_number,
            enabled = true,
            jobName = 'default-cdr-sync'
        } = body;

        if (!cron.validate(schedule)) {
            return NextResponse.json(
                { error: 'Invalid cron schedule format' },
                { status: 400 }
            );
        }

        // Stop existing job if it exists
        if (cronJobs.has(jobName)) {
            cronJobs.get(jobName)?.stop();
            cronJobs.delete(jobName);
        }

        if (enabled) {
            // Create new cron job
            const job = cron.schedule(schedule, async () => {
                console.log(`Running CDR sync job: ${jobName} at ${new Date().toISOString()}`);
                
                try {
                    // Calculate date range (previous day)
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    const from = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')} 00:00:00`;
                    const to = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')} 23:59:59`;

                    // Call sync endpoint for CallHistoryOverview
                    const syncUrl = new URL('/api/callcenter/calls/sync', request.url);
                    const syncResponse = await fetch(syncUrl.toString(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            domain,
                            from,
                            to,
                            caller_id_number,
                            limit: 10000,
                            offset: 0,
                            // Add model type for proper handling
                            modelType: 'CallHistoryOverview'
                        })
                    });

                    const result = await syncResponse.json();
                    console.log(`CDR sync job ${jobName} completed for CallHistoryOverview:`, {
                        ...result,
                        recordsProcessed: result.recordsProcessed || 0,
                        recordsCreated: result.recordsCreated || 0,
                        recordsUpdated: result.recordsUpdated || 0
                    });

                } catch (error) {
                    console.error(`CDR sync job ${jobName} failed:`, error);
                }
            });

            job.start();
            cronJobs.set(jobName, job);

            return NextResponse.json({
                success: true,
                message: `Cron job '${jobName}' scheduled successfully for CallHistoryOverview sync`,
                schedule,
                jobName,
                enabled: true,
                targetModel: 'CallHistoryOverview'
            });
        } else {
            return NextResponse.json({
                success: true,
                message: `Cron job '${jobName}' disabled`,
                jobName,
                enabled: false
            });
        }

    } catch (error) {
        console.error('Error setting up cron job:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to setup cron job',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET endpoint to list active cron jobs
export async function GET(request: NextRequest) {
    try {
        const jobs = Array.from(cronJobs.entries()).map(([name, job]) => ({
            name,
            running: job.getStatus() === 'scheduled',
            targetModel: 'CallHistoryOverview'
        }));

        return NextResponse.json({
            success: true,
            activeJobs: jobs.length,
            jobs
        });

    } catch (error) {
        console.error('Error listing cron jobs:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to list cron jobs',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// DELETE endpoint to stop a cron job
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobName = searchParams.get('jobName') || 'default-cdr-sync';

        if (cronJobs.has(jobName)) {
            cronJobs.get(jobName)?.stop();
            cronJobs.delete(jobName);

            return NextResponse.json({
                success: true,
                message: `Cron job '${jobName}' stopped and removed`
            });
        } else {
            return NextResponse.json(
                { error: `Cron job '${jobName}' not found` },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('Error stopping cron job:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to stop cron job',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}