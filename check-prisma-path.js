import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

console.log('� Checking Prisma client path resolution...');

try {
  console.log('✅ Successfully imported PrismaClient');
  
  // Check the client version
  const client = new PrismaClient();
  console.log('📊 Client info:', {
    hasRoleModel: typeof client.role !== 'undefined',
    methods: Object.keys(client.role || {}),
  });
  
  await client.$disconnect();
} catch (error) {
  console.error('❌ Error:', error.message);
}
