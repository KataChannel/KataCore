import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { format, filters } = body;

        // Simulate fetching filtered call data based on the filters
        // In production, this would query your CDR database with the same filters
        const callsResponse = await fetch(`${request.nextUrl.origin}/api/callcenter/calls?${new URLSearchParams(filters)}`);
        const callsData = await callsResponse.json();

        if (format === 'csv') {
            // Generate CSV content
            const headers = [
                'Call ID',
                'Customer Name',
                'Phone Number',
                'Extension',
                'Direction',
                'Status',
                'Start Time',
                'Duration (seconds)',
                'Hangup Cause',
                'Notes'
            ];

            const csvRows = [
                headers.join(','),
                ...callsData.data.map((call: any) => [
                    call.id,
                    `"${call.customerName}"`,
                    call.phoneNumber,
                    call.extensionNumber || '',
                    call.direction,
                    call.status,
                    new Date(call.timestamp).toISOString(),
                    call.duration || 0,
                    `"${call.hangupCause || ''}"`,
                    `"${call.notes || ''}"`
                ].join(','))
            ];

            const csvContent = csvRows.join('\n');

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="call_export_${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        } else if (format === 'excel') {
            // For Excel format, we'll create a simple XML-based Excel file
            const excelContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Call Export">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Call ID</Data></Cell>
    <Cell><Data ss:Type="String">Customer Name</Data></Cell>
    <Cell><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell><Data ss:Type="String">Extension</Data></Cell>
    <Cell><Data ss:Type="String">Direction</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
    <Cell><Data ss:Type="String">Start Time</Data></Cell>
    <Cell><Data ss:Type="String">Duration (seconds)</Data></Cell>
    <Cell><Data ss:Type="String">Hangup Cause</Data></Cell>
    <Cell><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${callsData.data.map((call: any) => `
   <Row>
    <Cell><Data ss:Type="String">${call.id}</Data></Cell>
    <Cell><Data ss:Type="String">${call.customerName}</Data></Cell>
    <Cell><Data ss:Type="String">${call.phoneNumber}</Data></Cell>
    <Cell><Data ss:Type="String">${call.extensionNumber || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${call.direction}</Data></Cell>
    <Cell><Data ss:Type="String">${call.status}</Data></Cell>
    <Cell><Data ss:Type="String">${new Date(call.timestamp).toISOString()}</Data></Cell>
    <Cell><Data ss:Type="Number">${call.duration || 0}</Data></Cell>
    <Cell><Data ss:Type="String">${call.hangupCause || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${call.notes || ''}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

            return new NextResponse(excelContent, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.ms-excel',
                    'Content-Disposition': `attachment; filename="call_export_${new Date().toISOString().split('T')[0]}.xls"`
                }
            });
        } else {
            return NextResponse.json(
                { error: 'Unsupported export format. Use "csv" or "excel"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
}
