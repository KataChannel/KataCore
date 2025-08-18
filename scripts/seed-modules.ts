import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedModules() {
  try {
    console.log('🌱 Starting modules seed...');

    // Check if modules already exist
    const existingModules = await prisma.menu_items.findMany({
      where: {
        parentId: null, // Only top-level items
      }
    });

    if (existingModules.length > 0) {
      console.log('✅ Modules already exist, skipping seed');
      return;
    }

    const modulesData = [
      {
        title: 'Quản lý Khách hàng',
        titleVi: 'Quản lý Khách hàng',
        path: '/admin/crm',
        icon: 'users',
        permission: 'read:admin',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Quản lý Nhân sự',
        titleVi: 'Quản lý Nhân sự',
        path: '/admin/hrm',
        icon: 'user-group',
        permission: 'read:admin',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Quản lý Bán hàng',
        titleVi: 'Quản lý Bán hàng',
        path: '/sales',
        icon: 'chart-bar',
        permission: 'read:sales',
        sortOrder: 3,
        isActive: true,
      },
      {
        title: 'Quản lý Kho',
        titleVi: 'Quản lý Kho',
        path: '/inventory',
        icon: 'cube',
        permission: 'read:inventory',
        sortOrder: 4,
        isActive: true,
      },
      {
        title: 'Quản lý Tài chính',
        titleVi: 'Quản lý Tài chính',
        path: '/finance',
        icon: 'currency-dollar',
        permission: 'read:finance',
        sortOrder: 5,
        isActive: true,
      },
      {
        title: 'Quản lý Dự án',
        titleVi: 'Quản lý Dự án',
        path: '/projects',
        icon: 'clipboard-document-list',
        permission: 'read:projects',
        sortOrder: 6,
        isActive: true,
      },
      {
        title: 'Marketing',
        titleVi: 'Marketing',
        path: '/marketing',
        icon: 'megaphone',
        permission: 'read:marketing',
        sortOrder: 7,
        isActive: true,
      },
      {
        title: 'Chăm sóc Khách hàng',
        titleVi: 'Chăm sóc Khách hàng',
        path: '/support',
        icon: 'chat-bubble-left-right',
        permission: 'read:support',
        sortOrder: 8,
        isActive: true,
      },
      {
        title: 'Báo cáo & Phân tích',
        titleVi: 'Báo cáo & Phân tích',
        path: '/analytics',
        icon: 'document-chart-bar',
        permission: 'read:analytics',
        sortOrder: 9,
        isActive: true,
      },
      {
        title: 'Thương mại Điện tử',
        titleVi: 'Thương mại Điện tử',
        path: '/ecommerce',
        icon: 'computer-desktop',
        permission: 'read:ecommerce',
        sortOrder: 10,
        isActive: true,
      },
    ];

    // Create modules
    for (const moduleData of modulesData) {
      await prisma.menu_items.create({
        data: moduleData,
      });
      console.log(`✅ Created module: ${moduleData.title}`);
    }

    console.log('🎉 Modules seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedModules();
