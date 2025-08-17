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

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (department) where.department = department;
    if (position) where.position = position;
    if (status) where.status = status;

    const total = await prisma.employee.count({ where });
    const data = await prisma.employee.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
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
