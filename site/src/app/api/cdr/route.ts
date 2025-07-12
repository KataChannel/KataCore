import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    
    const domain = searchParams.get('domain');
    const limit = searchParams.get('limit');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const caller_id_number = searchParams.get('caller_id_number');
    const offset = searchParams.get('offset');

    try {
        const params = new URLSearchParams({
            domain: domain || '',
            limit: limit || '10',
            from: from || '',
            to: to || '',
            caller_id_number: caller_id_number || '',
            offset: offset || '0'
        });

        const response = await fetch(`https://pbx01.onepos.vn:8080/api/v2/cdrs?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if required
                // 'Authorization': 'Bearer your-token'
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return NextResponse.json(data, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Error fetching CDR data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch CDR data' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}