// Debug menu loading in admin panel
console.log('=== MENU DEBUG ===');

// Check if we're in admin layout
if (window.location.pathname.startsWith('/admin')) {
  console.log('✅ In admin panel');
  
  // Check for menu items in DOM
  const menuItems = document.querySelectorAll('[data-menu-item]');
  console.log(`📋 Found ${menuItems.length} menu items in DOM`);
  
  // Check for database menu data
  if (window.__MENU_DEBUG__) {
    console.log('🗃️ Database menu data:', window.__MENU_DEBUG__);
  }
  
  // Check for errors
  const errors = document.querySelectorAll('[data-error]');
  if (errors.length > 0) {
    console.log('❌ Found errors:', errors);
  }
  
  // Check for loading state
  const loadingElements = document.querySelectorAll('[data-loading]');
  console.log(`⏳ Loading elements: ${loadingElements.length}`);
  
  // Log network requests to menu API
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[0] && args[0].includes('/api/admin/menu-items')) {
      console.log('🌐 Menu API request:', args[0]);
    }
    return originalFetch.apply(this, args).then(response => {
      if (args[0] && args[0].includes('/api/admin/menu-items')) {
        console.log('📥 Menu API response:', response.status);
        if (response.ok) {
          return response.clone().json().then(data => {
            console.log('📊 Menu data received:', data);
            window.__MENU_DEBUG__ = data;
            return response;
          });
        }
      }
      return response;
    });
  };
}
