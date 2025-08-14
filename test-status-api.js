// Test script to verify API status endpoint
const testStatusAPI = async () => {
  try {
    console.log('Testing Facebook sync status API...');
    
    const response = await fetch('http://localhost:3900/api/admin/social/facebook/sync/status');
    
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ API is working correctly!');
      
      if (data.stats) {
        console.log(`📊 Total synced items: ${data.stats.totalSyncs}`);
        console.log(`🔄 Last sync type: ${data.stats.lastSyncType}`);
        
        if (data.stats.breakdown) {
          console.log('📋 Breakdown:');
          Object.entries(data.stats.breakdown).forEach(([key, value]) => {
            console.log(`  - ${key}: ${value}`);
          });
        }
      }
      
      if (data.lastSync) {
        console.log(`⏰ Last sync: ${new Date(data.lastSync).toLocaleString()}`);
      } else {
        console.log('ℹ️ No sync data available yet');
      }
    } else {
      console.error('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testStatusAPI();
