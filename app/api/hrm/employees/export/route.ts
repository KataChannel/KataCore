import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { authService } from '@/lib/auth/authService';

const SAMPLE = [
  {
    name: 'HỒ KHÁNH LINH',
    phone: '0834117613',
    email: 'lingho104@gmail.com',
    position: 'Lead Team ADS TZ',
    department: 'Marketing',
    company: 'Taza Skin Clinic',
    status: 'Chính thức',
    startdate: '03/09/2020'
  },
  {
    name: 'NGUYỄN THỊ TRÚC UYÊN',
    phone: '0763168949',
    email: 'trucuyen.coach@gmail.com',
    position: 'Nhân viên Ads',
    department: 'Marketing',
    company: 'Taza Skin Clinic',
    status: 'Chính thức',
    startdate: '25/07/2022'
  },
  {
    name: 'NGUYỄN MẬU ĐẠT',
    phone: '0372140337',
    email: 'datagency7923@gmail.com',
    position: 'Nhân viên Ads',
    department: 'Marketing',
    company: 'Taza Skin Clinic',
    status: 'Chính thức',
    startdate: '26/05/2025'
  },
  {
    name: 'HOÀNG TUYẾT NGÂN',
    phone: '0964554140',
    email: 'ngan45900@gmail.com',
    position: 'Lead Team ADS TA',
    department: 'Marketing',
    company: 'Timona Academy',
    status: 'Chính thức',
    startdate: '24/08/2020'
  },
  {
    name: 'BÙI ANH THƯ',
    phone: '0798680725',
    email: 'anhanhthu0725@gmail.com',
    position: 'Nhân viên Ads',
    department: 'Marketing',
    company: 'Timona Academy',
    status: 'Chính thức',
    startdate: '01/08/2023'
  },
  {
    name: 'HOÀNG THỊ MỸ TRINH',
    phone: '0869918605',
    email: 'mytrinhdangiu1704@gmail.com',
    position: 'Intern Content',
    department: 'Marketing',
    company: 'Elasome',
    status: 'Thử việc',
    startdate: '13/08/2025'
  },
  {
    name: 'HÀ VĂN HẠNH',
    phone: '0968976181',
    email: 'nhatsang.rtc2@gmail.com',
    position: 'Lead Content',
    department: 'Marketing',
    company: 'Hderma',
    status: 'Chính thức',
    startdate: '03/08/2020'
  },
  {
    name: 'VÕ THỊ THANH MAI',
    phone: '0813719717',
    email: 'thanhmai146202@gmail.com',
    position: 'Truyền thông',
    department: 'Marketing',
    company: 'Hderma',
    status: 'Thử việc',
    startdate: '01/06/2025'
  }
];

function formatDateToDDMMYYYY(date?: Date | string | null) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapStatusToVn(status?: string) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'active' || s === 'chính thức' || s === 'chinh thuc') return 'Chính thức';
  if (s === 'inactive' || s === 'thử việc' || s === 'thu viec') return 'Thử việc';
  return status;
}

export async function GET(request: Request) {
  try {
    // Auth: require bearer token
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    try {
      authService.verifyToken(token);
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isTemplate = url.searchParams.get('template') === '1' || url.searchParams.get('template') === 'true';
    if (isTemplate) {
      const ws = XLSX.utils.json_to_sheet(SAMPLE);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="employees-template.xlsx"`
        }
      });
    }

    // Build where same as list
    const search = url.searchParams.get('search') || undefined;
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

    const rows = await prisma.employee.findMany({ where, orderBy: { createdAt: 'desc' } });

    const exportRows = rows.map(r => ({
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      position: r.position || '',
      department: r.department || '',
      company: r.company || '',
      status: mapStatusToVn(r.status),
      startdate: formatDateToDDMMYYYY(r.startDate)
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="employees-export.xlsx"`
      }
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
