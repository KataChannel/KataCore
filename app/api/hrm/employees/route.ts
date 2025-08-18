import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEmployeeSchema } from '@/lib/validators/employee';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '25', 10);
    const department = url.searchParams.get('department') || undefined;
    const position = url.searchParams.get('position') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const company = url.searchParams.get('company') || undefined;
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const startDateFrom = url.searchParams.get('startDateFrom') || undefined;
    const startDateTo = url.searchParams.get('startDateTo') || undefined;
    const salaryFrom = url.searchParams.get('salaryFrom') || undefined;
    const salaryTo = url.searchParams.get('salaryTo') || undefined;

    const where: any = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filter functionality
    if (department) where.department = department;
    if (position) where.position = { contains: position, mode: 'insensitive' };
    if (status) where.status = status;
    if (company) where.company = { contains: company, mode: 'insensitive' };
    
    // Date range filtering
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
      if (startDateTo) where.startDate.lte = new Date(startDateTo);
    }

    // Salary range filtering (if you have salary field in your schema)
    // Note: This assumes you have a salary field in your Employee model
    // if (salaryFrom || salaryTo) {
    //   where.salary = {};
    //   if (salaryFrom) where.salary.gte = parseFloat(salaryFrom);
    //   if (salaryTo) where.salary.lte = parseFloat(salaryTo);
    // }

    // Sorting
    const validSortFields = ['name', 'employeeCode', 'department', 'position', 'startDate', 'createdAt', 'updatedAt'];
    const orderBy: any = {};
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc'; // Default sort
    }

    const total = await prisma.employee.count({ where });
    const data = await prisma.employee.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy
    });

    return NextResponse.json({ data, total, page, pageSize });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createEmployeeSchema.parse(body);
    const created = await prisma.employee.create({ data: parsed });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 400 });
  }
}
