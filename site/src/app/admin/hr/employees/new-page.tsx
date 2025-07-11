'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Skeleton,
  InputAdornment,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  position: {
    id: string;
    title: string;
    department: {
      id: string;
      name: string;
    };
  };
  status: string;
  contractType: string;
  hireDate: string;
  salary?: number;
  user?: {
    avatar?: string;
    displayName: string;
  };
}

interface Position {
  id: string;
  title: string;
  department: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

const EmployeeManagement: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    positionId: '',
    departmentId: '',
    status: 'ACTIVE',
    contractType: 'FULL_TIME',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchPositions();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        setError('Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/hr/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email || '',
        phone: employee.phone || '',
        positionId: employee.position.id,
        departmentId: employee.position.department.id,
        status: employee.status,
        contractType: employee.contractType,
        hireDate: employee.hireDate.split('T')[0],
        salary: employee.salary || 0,
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        employeeId: `EMP${Date.now()}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        positionId: '',
        departmentId: '',
        status: 'ACTIVE',
        contractType: 'FULL_TIME',
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setError('');
  };

  const handleSave = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.positionId) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const method = selectedEmployee ? 'PUT' : 'POST';
      const url = selectedEmployee
        ? `/api/hr/employees/${selectedEmployee.id}`
        : '/api/hr/employees';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchEmployees();
        handleCloseDialog();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi lưu');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      setError('Lỗi kết nối đến server');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        const response = await fetch(`/api/hr/employees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchEmployees();
        } else {
          setError('Không thể xóa nhân viên');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Lỗi kết nối đến server');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'TERMINATED':
        return 'error';
      case 'ON_LEAVE':
        return 'warning';
      case 'PROBATION':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang làm việc';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'TERMINATED':
        return 'Đã nghỉ việc';
      case 'ON_LEAVE':
        return 'Nghỉ phép';
      case 'PROBATION':
        return 'Thử việc';
      default:
        return status;
    }
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Toàn thời gian';
      case 'PART_TIME':
        return 'Bán thời gian';
      case 'CONTRACT':
        return 'Hợp đồng';
      case 'INTERNSHIP':
        return 'Thực tập';
      case 'FREELANCE':
        return 'Tự do';
      default:
        return type;
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.email &&
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === 'all' ||
      employee.position.department.id === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Quản lý nhân viên
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Thêm nhân viên
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{employees.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng nhân viên
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {employees.filter(e => e.status === 'ACTIVE').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang làm việc
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{departments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phòng ban
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <BadgeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{positions.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chức vụ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Trạng thái"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="ACTIVE">Đang làm việc</MenuItem>
              <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
              <MenuItem value="TERMINATED">Đã nghỉ việc</MenuItem>
              <MenuItem value="ON_LEAVE">Nghỉ phép</MenuItem>
              <MenuItem value="PROBATION">Thử việc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Phòng ban"
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Mã NV</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell>Phòng ban</TableCell>
                <TableCell>Chức vụ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Loại hợp đồng</TableCell>
                <TableCell>Ngày vào</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="100%" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <PersonIcon
                        sx={{ fontSize: 64, color: 'grey.300', mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        Chưa có nhân viên nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hãy thêm nhân viên đầu tiên
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map(employee => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Avatar
                          src={employee.user?.avatar}
                          alt={employee.fullName}
                          sx={{ width: 40, height: 40 }}
                        >
                          {employee.firstName[0] + employee.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {employee.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.user?.displayName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.employeeId}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {employee.email && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {employee.email}
                            </Typography>
                          </Box>
                        )}
                        {employee.phone && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {employee.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.position.department.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.position.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(employee.status)}
                        size="small"
                        color={getStatusColor(employee.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getContractTypeLabel(employee.contractType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(employee.hireDate).toLocaleDateString(
                            'vi-VN'
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(employee)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(employee.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Employee Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã nhân viên"
                value={formData.employeeId}
                onChange={e =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                disabled={!!selectedEmployee}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ"
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên"
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phòng ban"
                value={formData.departmentId}
                onChange={e =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                required
              >
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Chức vụ"
                value={formData.positionId}
                onChange={e =>
                  setFormData({ ...formData, positionId: e.target.value })
                }
                required
              >
                {positions
                  .filter(pos => pos.department.id === formData.departmentId)
                  .map(pos => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.title}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <MenuItem value="ACTIVE">Đang làm việc</MenuItem>
                <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
                <MenuItem value="TERMINATED">Đã nghỉ việc</MenuItem>
                <MenuItem value="ON_LEAVE">Nghỉ phép</MenuItem>
                <MenuItem value="PROBATION">Thử việc</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loại hợp đồng"
                value={formData.contractType}
                onChange={e =>
                  setFormData({ ...formData, contractType: e.target.value })
                }
              >
                <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
                <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
                <MenuItem value="CONTRACT">Hợp đồng</MenuItem>
                <MenuItem value="INTERNSHIP">Thực tập</MenuItem>
                <MenuItem value="FREELANCE">Tự do</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày vào làm"
                value={formData.hireDate}
                onChange={e =>
                  setFormData({ ...formData, hireDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Lương cơ bản"
                value={formData.salary}
                onChange={e =>
                  setFormData({ ...formData, salary: Number(e.target.value) })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedEmployee ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;
