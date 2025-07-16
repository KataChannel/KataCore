import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const mockData = {
        totalCalls: 1247,
        answeredCalls: 1089,
        missedCalls: 158,
        averageCallDuration: "4:32",
        totalCallTime: "82:15:24",
        callsByHour: [
            { hour: "00:00", calls: 12 },
            { hour: "01:00", calls: 8 },
            { hour: "02:00", calls: 5 },
            { hour: "03:00", calls: 3 },
            { hour: "04:00", calls: 7 },
            { hour: "05:00", calls: 15 },
            { hour: "06:00", calls: 28 },
            { hour: "07:00", calls: 45 },
            { hour: "08:00", calls: 89 },
            { hour: "09:00", calls: 156 },
            { hour: "10:00", calls: 203 },
            { hour: "11:00", calls: 187 },
            { hour: "12:00", calls: 145 },
            { hour: "13:00", calls: 134 },
            { hour: "14:00", calls: 167 },
            { hour: "15:00", calls: 189 },
            { hour: "16:00", calls: 165 },
            { hour: "17:00", calls: 123 },
            { hour: "18:00", calls: 87 },
            { hour: "19:00", calls: 65 },
            { hour: "20:00", calls: 43 },
            { hour: "21:00", calls: 32 },
            { hour: "22:00", calls: 25 },
            { hour: "23:00", calls: 18 }
        ],
        agents: {
            active: 24,
            available: 18,
            busy: 6,
            offline: 12
        },
        callTypes: [
            { type: "Inbound", count: 892, percentage: 71.5 },
            { type: "Outbound", count: 355, percentage: 28.5 }
        ],
        departments: [
            { name: "Sales", calls: 456, avgDuration: "5:24" },
            { name: "Support", calls: 378, avgDuration: "6:12" },
            { name: "Billing", calls: 234, avgDuration: "3:45" },
            { name: "Technical", calls: 179, avgDuration: "8:33" }
        ]
    };

    return NextResponse.json(mockData);
}