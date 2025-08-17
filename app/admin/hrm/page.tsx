"use client";

import React from 'react';
import { Container, Box, Typography } from '@mui/joy';
import EmployeeTable from './components/EmployeeTable';

export default function HRMAdminPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <Typography level="h2">HRM - Employee Management</Typography>
      </Box>
      <Box sx={{ mt: 3 }}>
        <EmployeeTable />
      </Box>
    </Container>
  );
}
