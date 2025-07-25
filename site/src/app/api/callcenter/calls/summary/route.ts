import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Get all call history data
        const callHistory = await prisma.call_history_overview.findMany();
        
        // Calculate summary statistics
        const totalCalls = callHistory.length;
        const answeredCalls = callHistory.filter(call => call.callStatus === 'answered').length;
        const missedCalls = totalCalls - answeredCalls;
        
        // Calculate average call duration
        const totalDuration = callHistory
            .filter(call => call.duration)
            .reduce((sum, call) => sum + parseInt(call.duration || '0'), 0);
        const avgDurationSeconds = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;
        const averageCallDuration = `${Math.floor(avgDurationSeconds / 60)}:${(avgDurationSeconds % 60).toString().padStart(2, '0')}`;
        
        // Calculate total call time
        const totalSeconds = totalDuration;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const totalCallTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Group calls by hour
        const callsByHour = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            calls: 0
        }));
        
        callHistory.forEach(call => {
            if (call.startEpoch) {
                const hour = new Date(parseInt(call.startEpoch) * 1000).getHours();
                if (callsByHour[hour]) {
                    callsByHour[hour].calls++;
                }
            }
        });
        
        // Call types based on direction
        const inboundCalls = callHistory.filter(call => call.direction === 'inbound').length;
        const outboundCalls = callHistory.filter(call => call.direction === 'outbound').length;
        
        const callTypes = [
            { 
                type: "Inbound", 
                count: inboundCalls, 
                percentage: totalCalls > 0 ? Math.round((inboundCalls / totalCalls) * 100 * 10) / 10 : 0 
            },
            { 
                type: "Outbound", 
                count: outboundCalls, 
                percentage: totalCalls > 0 ? Math.round((outboundCalls / totalCalls) * 100 * 10) / 10 : 0 
            }
        ];
        
        const summaryData = {
            totalCalls,
            answeredCalls,
            missedCalls,
            averageCallDuration,
            totalCallTime,
            callsByHour,
            agents: {
                active: 0, // This would need additional agent data
                available: 0,
                busy: 0,
                offline: 0
            },
            callTypes,
            departments: [] // This would need additional department mapping
        };

        return NextResponse.json(summaryData);
    } catch (error) {
        console.error('Error fetching call summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch call summary' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}