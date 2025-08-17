import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateEmployeeSchema } from '@/lib/validators/employee';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(emp);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateEmployeeSchema.parse(body);
    const updated = await prisma.employee.update({ where: { id }, data: parsed });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
