import React from 'react';

function AuthDebugInfo() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('=== AUTH DEBUG INFO ===');
      console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
      console.log('localStorage authToken:', localStorage.getItem('authToken'));
      
      // Check cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});
      
      console.log('Cookies:', cookies);
      console.log('========================');
    }
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999 
    }}>
      Auth Debug: Check Console
    </div>
  );
}

export default AuthDebugInfo;
