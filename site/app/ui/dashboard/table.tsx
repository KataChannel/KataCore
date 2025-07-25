import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridRowModel } from '@mui/x-data-grid';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: true,
    },
    {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true,
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: true,
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
];

const initialRows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export default function DataGridDemo() {
    const [rows, setRows] = React.useState(initialRows);

    const processRowUpdate = async (newRow: GridRowModel) => {
        try {
            // Gọi API để update database
            const response = await fetch(`/api/users/${newRow.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRow),
            });

            if (!response.ok) {
                throw new Error('Failed to update');
            }

            const updatedRow = await response.json();
            
            // Cập nhật state local
            setRows((prevRows) =>
                prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
            );

            return updatedRow;
        } catch (error) {
            console.error('Error updating row:', error);
            // Throw error để DataGrid hiển thị error state
            throw error;
        }
    };

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 5,
                        },
                    },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => {
                    console.error('Row update error:', error);
                }}
            />
        </Box>
    );
}