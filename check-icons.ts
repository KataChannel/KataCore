import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIcons() {
  try {
    const icons = await prisma.menu_items.findMany({
      select: {
        icon: true
      },
      distinct: ['icon'],
      where: {
        icon: {
          not: undefined
        }
      },
      orderBy: {
        icon: 'asc'
      }
    });

    console.log('Icons trong database:');
    icons.forEach(item => {
      console.log(`- ${item.icon}`);
    });

    const menuCount = await prisma.menu_items.count();
    console.log(`\nTổng số menu items: ${menuCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIcons();
