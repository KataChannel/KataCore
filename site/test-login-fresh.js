#!/usr/bin/env node

// Script to login and get a fresh token
const fetch = require('node-fetch');

async function login() {
  console.log('🔑 Attempting to login...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'super@admin.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Access Token:', data.accessToken);
      console.log('User:', data.user);
      
      // Test the /api/auth/me endpoint with the fresh token
      console.log('\n🔍 Testing /api/auth/me with fresh token...');
      const meResponse = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const meData = await meResponse.json();
      console.log('Me Response:', meData);
      
    } else {
      console.error('❌ Login failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

login();
