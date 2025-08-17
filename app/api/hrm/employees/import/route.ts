import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEmployeeSchema } from '@/lib/validators/employee';
import { authService } from '@/lib/auth/authService';

function normalizeRow(row: any) {
  const copy: any = { ...row };

  // Normalize status from Vietnamese or sample values to internal enum
  if (typeof copy.status === 'string') {
    const s = copy.status.trim().toLowerCase();
    if (['chính thức', 'chinh thuc', 'chinhthuc', 'chínhthức', 'chính thức '].includes(s)) {
      copy.status = 'active';
    } else if (['thử việc', 'thu viec', 'thuviec', 'thửvịec'].includes(s)) {
      copy.status = 'inactive';
    } else if (s === 'active' || s === 'inactive') {
      copy.status = s;
    } else {
      // fallback to active
      copy.status = 'active';
    }
  }

  // Parse startDate if in DD/MM/YYYY or similar
  if (copy.startDate && typeof copy.startDate === 'string') {
    const v = copy.startDate.trim();
    const parts = v.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts.map((p: string) => parseInt(p, 10));
      if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
        const dt = new Date(Date.UTC(y, m - 1, d));
        copy.startDate = dt.toISOString();
      }
    }
    // else leave as-is and let the validator decide
  }

  return copy;
}

export async function POST(request: Request) {
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

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected array' }, { status: 400 });
    }

    const created: any[] = [];
    for (const item of body) {
      try {
        const normalized = normalizeRow(item);
        const parsed = createEmployeeSchema.parse(normalized);
        const rec = await prisma.employee.create({ data: parsed });
        created.push(rec);
      } catch (err) {
        // skip invalid rows but continue
        console.warn('Skipping invalid row', err);
      }
    }

    return NextResponse.json({ createdCount: created.length, created });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
