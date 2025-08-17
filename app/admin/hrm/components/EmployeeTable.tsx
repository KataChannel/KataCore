"use client";

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Input,
  Select,
  Option,
  Button,
  Sheet,
} from '@mui/joy';
import { DataGrid, type GridSortModel, type GridFilterModel, type GridColDef, type GridRenderCellParams, type GridFilterItem, type GridPaginationModel } from '@mui/x-data-grid';
import { AddRounded, EditRounded, DeleteRounded } from '@mui/icons-material';

interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  department?: string;
  company?: string;
  startDate?: string;
  employeeCode?: string;
  status?: string;
  userId?: string;
}

interface Props {}

export const EmployeeTable: React.FC<Props> = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});

  // typed columns for DataGrid
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 120, sortable: true, filterable: true },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 120, sortable: true, filterable: true },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 160, sortable: true, filterable: true },
    { field: 'position', headerName: 'Position', flex: 1, minWidth: 120, sortable: true, filterable: true },
    { field: 'department', headerName: 'Department', flex: 1, minWidth: 120, sortable: true, filterable: true },
    { field: 'company', headerName: 'Company', flex: 1, minWidth: 120, sortable: true, filterable: true },
    { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 120, sortable: true, filterable: true,
      valueFormatter: (params: { value: any }) => params.value ? new Date(String(params.value)).toLocaleDateString() : '-' },
    { field: 'employeeCode', headerName: 'Code', flex: 1, minWidth: 100, sortable: true, filterable: true },
    { field: 'status', headerName: 'Status', flex: 1, minWidth: 100, sortable: true, filterable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="sm" variant="soft" onClick={() => openEdit(params.row as Employee)} startDecorator={<EditRounded />}>Edit</Button>
          <Button size="sm" color="danger" variant="soft" onClick={() => handleDelete((params.row as any).id)} startDecorator={<DeleteRounded />}>Delete</Button>
        </Box>
      )
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page + 1));
      params.set('pageSize', String(pageSize));
      // Sorting (take first sort)
      if (sortModel && sortModel.length > 0) {
        const s = sortModel[0];
        if (s?.field) params.set('sort', String(s.field));
        if (s?.sort) params.set('order', String(s.sort));
      }
      // Filtering (only first filter for demo)
      if (filterModel && Array.isArray(filterModel.items) && filterModel.items.length > 0) {
        const item = filterModel.items[0] as GridFilterItem | undefined;
        // Use a safe access for columnField because it's not defined on GridFilterItem in types
        if (item && item.value && (((item as any).columnField ?? item.field))) {
          const key = ((item as any).columnField ?? item.field) as string;
          params.set(key, String(item.value));
        }
      }
      const res = await fetch(`/api/hrm/employees?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, page, pageSize, sortModel, filterModel]);

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setOpenForm(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm(emp);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    await fetch(`/api/hrm/employees/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await fetch(`/api/hrm/employees/${editing.id}`, { method: 'PUT', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
      } else {
        await fetch('/api/hrm/employees', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
      }
      setOpenForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card sx={{ width: '100%', minWidth: 320 }}>
      <CardContent sx={{ '& .MuiDataGrid-root': { border: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography level="title-md" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Employee Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startDecorator={<AddRounded />} onClick={openCreate}>
              Add Employee
            </Button>
            <Button onClick={() => { document.getElementById('employee-import-file')?.click(); }}>Import</Button>
            <Button variant="outlined" onClick={async () => {
              const params = new URLSearchParams();
              if (search) params.set('search', search);
              const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
              const res = await fetch(`/api/hrm/employees/export?${params.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'employees-export.xlsx';
              a.click();
              URL.revokeObjectURL(url);
            }}>Export</Button>
            <Button variant="plain" onClick={async () => {
              const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
              const res = await fetch('/api/hrm/employees/export?template=1', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'employees-template.xlsx';
              a.click();
              URL.revokeObjectURL(url);
            }}>Export Template</Button>
            <input id="employee-import-file" type="file" accept=".json,.xlsx,.csv" style={{ display: 'none' }} onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const ext = file.name.split('.').pop()?.toLowerCase();
              if (ext === 'json') {
                const text = await file.text();
                const json = JSON.parse(text);
                const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
                await fetch('/api/hrm/employees/import', { method: 'POST', body: JSON.stringify(json), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                fetchData();
              } else if (ext === 'xlsx' || ext === 'csv') {
                // use xlsx library
                const XLSX = await import('xlsx');
                const arrayBuffer = await file.arrayBuffer();
                const wb = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = wb.SheetNames && wb.SheetNames[0];
                const sheet = firstSheetName ? wb.Sheets[firstSheetName] : undefined;
                const raw = sheet ? XLSX.utils.sheet_to_json(sheet) : [];
                // Normalize rows: map VN status to internal, parse DD/MM/YYYY startdate -> ISO
                const json = (raw as any[]).map(r => {
                  const copy: any = { ...r };
                  if (typeof copy.status === 'string') {
                    const s = copy.status.trim().toLowerCase();
                    if (['chính thức', 'chinh thuc', 'chinhthuc', 'chínhthức', 'chính thức '].includes(s)) copy.status = 'active';
                    else if (['thử việc', 'thu viec', 'thuviec', 'thửvịec'].includes(s)) copy.status = 'inactive';
                  }
                  if (copy.startdate && typeof copy.startdate === 'string') {
                    const v = copy.startdate.trim();
                    const parts = v.split('/');
                    if (parts.length === 3) {
                      const [d, m, y] = parts.map((p: string) => parseInt(p, 10));
                      if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
                        const dt = new Date(Date.UTC(y, m - 1, d));
                        copy.startDate = dt.toISOString();
                      }
                    }
                  }
                  return copy;
                });
                const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('auth-token') || '';
                await fetch('/api/hrm/employees/import', { method: 'POST', body: JSON.stringify(json), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                fetchData();
              }
            }} />
          </Box>
        </Box>
        <Box sx={{ height: 520, width: '100%', minWidth: 320 }}>
          <DataGrid<Employee>
            rows={data}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            paginationModel={{ page, pageSize } as GridPaginationModel}
            onPaginationModelChange={(m: GridPaginationModel) => {
              setPage(m.page ?? 0);
              setPageSize(m.pageSize ?? 25);
            }}
            rowCount={total}
            sortingMode="server"
            onSortModelChange={(m) => setSortModel(m)}
            filterMode="server"
            onFilterModelChange={(m) => setFilterModel(m)}
            disableColumnMenu={false}
            showToolbar
            sx={{ 
              minWidth: 320, 
              width: '100%', 
              overflowX: 'auto',
              border: 'none',
              '& .MuiDataGrid-root': { 
                border: 'none',
                borderRadius: 2 
              }
            }}
          />
        </Box>
      </CardContent>
      {openForm && (
        <Sheet
          variant="outlined"
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1400,
            width: 600,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography level="title-md">{editing ? 'Edit Employee' : 'Create Employee'}</Typography>
            <Button variant="plain" onClick={() => setOpenForm(false)}>×</Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Input placeholder="Name" value={form.name || ''} onChange={(e) => setForm(f => ({ ...f, name: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm(f => ({ ...f, phone: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Email" value={form.email || ''} onChange={(e) => setForm(f => ({ ...f, email: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Position" value={form.position || ''} onChange={(e) => setForm(f => ({ ...f, position: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Department" value={form.department || ''} onChange={(e) => setForm(f => ({ ...f, department: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Company" value={form.company || ''} onChange={(e) => setForm(f => ({ ...f, company: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Start Date (YYYY-MM-DD)" value={form.startDate || ''} onChange={(e) => setForm(f => ({ ...f, startDate: String((e.target as HTMLInputElement).value) }))} />
            <Input placeholder="Employee Code" value={form.employeeCode || ''} onChange={(e) => setForm(f => ({ ...f, employeeCode: String((e.target as HTMLInputElement).value) }))} />
            <Select value={form.status || 'active'} onChange={(_, v) => setForm(f => ({ ...f, status: String(v) }))}>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? 'Save' : 'Create'}</Button>
          </Box>
  </Sheet>
      )}
    </Card>
  );
};

export default EmployeeTable;
