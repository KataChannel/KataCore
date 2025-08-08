#!/bin/bash

# Script cập nhật Prisma models trong app/api theo schema mới
# Sync API routes with updated Prisma schema

echo "🔄 Đang cập nhật Prisma models trong app/api..."

# Chuyển đến thư mục dự án
cd /chikiet/kataoffical/tazagroup

# Tạo backup trước khi cập nhật
echo "📦 Tạo backup các file API hiện tại..."
mkdir -p backups/api_$(date +%Y%m%d_%H%M%S)
cp -r app/api/* backups/api_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo "Không có file API để backup"

# Generate Prisma Client mới
echo "🔧 Generating Prisma Client mới..."
npx prisma generate

# Tạo script helper để tạo API routes
echo "📝 Tạo script helper để generate API routes..."

cat > scripts/generate_api_routes.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Đọc schema Prisma và extract models
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Extract model names từ schema
const modelMatches = schemaContent.match(/model\s+(\w+)\s*{/g);
const models = modelMatches ? modelMatches.map(match => match.match(/model\s+(\w+)/)[1]) : [];

console.log('📊 Models tìm thấy trong schema:', models);

// Models không cần tạo API (system models)
const excludeModels = [
  'sessions', 
  'audit_logs',
  'call_history_overview',
  'user_settings'
];

// Filter models cần tạo API
const apiModels = models.filter(model => !excludeModels.includes(model));

console.log('🎯 Models sẽ tạo API routes:', apiModels);

// Template cho API route cơ bản
const generateRouteTemplate = (modelName) => {
  const capitalizedModel = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  
  return `// app/api/${modelName}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/${modelName} - Lấy danh sách ${modelName}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.${modelName}.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.${modelName}.count(),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching ${modelName}:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy dữ liệu ${modelName}' },
      { status: 500 }
    );
  }
}

// POST /api/${modelName} - Tạo mới ${modelName}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const new${capitalizedModel} = await prisma.${modelName}.create({
      data: body,
    });

    return NextResponse.json(new${capitalizedModel}, { status: 201 });
  } catch (error) {
    console.error('Error creating ${modelName}:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo ${modelName}' },
      { status: 500 }
    );
  }
}
`;
};

// Template cho API route với ID
const generateIdRouteTemplate = (modelName) => {
  const capitalizedModel = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  
  return `// app/api/${modelName}/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/${modelName}/[id] - Lấy ${modelName} theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ${modelName.slice(0, -1)} = await prisma.${modelName}.findUnique({
      where: { id: params.id },
    });

    if (!${modelName.slice(0, -1)}) {
      return NextResponse.json(
        { error: '${capitalizedModel} không tìm thấy' },
        { status: 404 }
      );
    }

    return NextResponse.json(${modelName.slice(0, -1)});
  } catch (error) {
    console.error('Error fetching ${modelName}:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy ${modelName}' },
      { status: 500 }
    );
  }
}

// PUT /api/${modelName}/[id] - Cập nhật ${modelName}
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updated${capitalizedModel} = await prisma.${modelName}.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(updated${capitalizedModel});
  } catch (error) {
    console.error('Error updating ${modelName}:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật ${modelName}' },
      { status: 500 }
    );
  }
}

// DELETE /api/${modelName}/[id] - Xóa ${modelName}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.${modelName}.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '${capitalizedModel} đã được xóa' });
  } catch (error) {
    console.error('Error deleting ${modelName}:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa ${modelName}' },
      { status: 500 }
    );
  }
}
`;
};

// Tạo thư mục API và routes
apiModels.forEach(modelName => {
  const apiDir = path.join(__dirname, '../app/api', modelName);
  const idDir = path.join(apiDir, '[id]');
  
  // Tạo thư mục
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  if (!fs.existsSync(idDir)) {
    fs.mkdirSync(idDir, { recursive: true });
  }
  
  // Tạo route.ts chính
  const routePath = path.join(apiDir, 'route.ts');
  if (!fs.existsSync(routePath)) {
    fs.writeFileSync(routePath, generateRouteTemplate(modelName));
    console.log(`✅ Tạo ${routePath}`);
  } else {
    console.log(`⚠️  ${routePath} đã tồn tại, bỏ qua`);
  }
  
  // Tạo route.ts cho ID
  const idRoutePath = path.join(idDir, 'route.ts');
  if (!fs.existsSync(idRoutePath)) {
    fs.writeFileSync(idRoutePath, generateIdRouteTemplate(modelName));
    console.log(`✅ Tạo ${idRoutePath}`);
  } else {
    console.log(`⚠️  ${idRoutePath} đã tồn tại, bỏ qua`);
  }
});

// Tạo file prisma client helper nếu chưa có
const prismaLibPath = path.join(__dirname, '../lib/prisma.ts');
if (!fs.existsSync(prismaLibPath)) {
  const prismaLibContent = `// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
`;
  
  fs.writeFileSync(prismaLibPath, prismaLibContent);
  console.log('✅ Tạo lib/prisma.ts');
}

console.log('🎉 Hoàn thành tạo API routes cho các models!');
EOF

echo "🚀 Chạy script generate API routes..."
node scripts/generate_api_routes.js

echo "✅ Hoàn thành cập nhật Prisma models trong API!"
echo "📝 Kiểm tra thư mục app/api để xem các routes đã được tạo"

# Hiển thị cấu trúc API đã tạo
echo "📂 Cấu trúc API đã tạo:"
find app/api -name "*.ts" -type f | head -20 || echo "Chưa có file API nào"
