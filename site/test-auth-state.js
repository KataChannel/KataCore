// Test script to check authentication state
async function testAuthState() {
  console.log('=== Testing Auth State ===');
  
  // Check localStorage
  const token = localStorage.getItem('accessToken');
  console.log('Token in localStorage:', token ? 'EXISTS' : 'NOT FOUND');
  
  if (token) {
    console.log('Token length:', token.length);
    // Try to call /api/auth/me
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
      } else {
        const error = await response.text();
        console.log('API Error:', error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }
  
  // Check cookies
  console.log('Document cookies:', document.cookie);
  
  console.log('=== End Test ===');
}

// Run the test
testAuthState();
