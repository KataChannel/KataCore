const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMenuAPI() {
  try {
    console.log('🔍 Checking menu items in database...');
    
    // Check if menu_items table exists and has data
    const menuCount = await prisma.menu_items.count();
    console.log(`📊 Found ${menuCount} menu items in database`);
    
    if (menuCount === 0) {
      console.log('⚠️  No menu items found. Need to seed the database.');
      return;
    }
    
    // Get some sample menu items
    const sampleMenus = await prisma.menu_items.findMany({
      take: 5,
      include: {
        children: true
      }
    });
    
    console.log('📋 Sample menu items:');
    sampleMenus.forEach(menu => {
      console.log(`- ${menu.title} (${menu.path}) - Children: ${menu.children.length}`);
    });
    
    // Test the API endpoint locally
    console.log('\n🌐 Testing API endpoint...');
    const apiUrl = 'http://localhost:3902/api/admin/menu-items?adminView=true';
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API Response: Got ${data.length} menu items`);
        console.log('🎯 API endpoint is working correctly!');
      } else {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log('Error details:', errorText);
      }
    } catch (fetchError) {
      console.log('❌ Fetch Error:', fetchError.message);
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMenuAPI();
