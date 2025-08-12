#!/usr/bin/env node

/**
 * Long-Lived Token Exchange Script
 * ================================
 * 
 * Convert short-lived Facebook token to long-lived token
 * Run: node scripts/exchange-long-lived-token.cjs
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 Facebook Long-Lived Token Exchange Tool\n');

async function exchangeToken() {
  try {
    // Get user input
    const shortLivedToken = await askQuestion('Enter your short-lived token: ');
    const appId = await askQuestion('Enter your Facebook App ID: ');
    const appSecret = await askQuestion('Enter your Facebook App Secret: ');
    
    console.log('\n🔄 Exchanging token...');
    
    // Build URL
    const url = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
    url.searchParams.append('grant_type', 'fb_exchange_token');
    url.searchParams.append('client_id', appId);
    url.searchParams.append('client_secret', appSecret);
    url.searchParams.append('fb_exchange_token', shortLivedToken);

    // Make request
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('❌ Exchange failed:');
      console.error('Error:', data.error?.message || 'Unknown error');
      console.error('Type:', data.error?.type || 'Unknown type');
      process.exit(1);
    }

    // Success!
    console.log('\n✅ Exchange successful!');
    console.log('\n📋 Long-Lived Token Details:');
    console.log(`Token: ${data.access_token}`);
    console.log(`Expires in: ${data.expires_in} seconds`);
    console.log(`Days: ${Math.floor(data.expires_in / 86400)} days`);
    console.log(`Token type: ${data.token_type || 'bearer'}`);
    
    console.log('\n💾 Save to Environment Variables:');
    console.log(`NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN=${data.access_token}`);
    
    console.log('\n💾 Or save to localStorage (in browser console):');
    console.log(`localStorage.setItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN', '${data.access_token}');`);
    
    console.log('\n🎉 You can now use this token for 60 days!');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Quick test mode
if (process.argv[2] === '--test') {
  console.log('🧪 Test Mode - Using sample data\n');
  
  // Test with sample data
  const testToken = 'EAAIZCuUzXcokBPFDegEMUjKnK2ZCOJ81StOBn6l4u9Kk2uSfLsdl4WTPkRjNZBJmqoATdHYFKgkhEQGZBniZCkiuZCJUDDWUKEWZCNu8Y6yguiHI9lZBZB5n8FuZAKMbWXuazXuXsjZAxcSeW1Upg8ef8L8pZCH6BIiZA1Ct9Uq1eLcqB95Sd856w8HLXANcYBd964mZAuNtFP6fR6ZCpoZADYZBghWZCLSUPQfS9jBt7cIFT1jeFXGns0F04ZD';
  
  console.log('📋 Sample Configuration:');
  console.log('Short-lived token:', testToken.substring(0, 50) + '...');
  console.log('✅ Use Facebook Graph API Explorer to get real tokens');
  console.log('🔗 https://developers.facebook.com/tools/explorer/');
  
  rl.close();
} else {
  // Interactive mode
  exchangeToken();
}

console.log('\n💡 Tips:');
console.log('- Get short-lived tokens from Facebook Graph API Explorer');
console.log('- Long-lived tokens last 60 days vs 1-2 hours for regular tokens');
console.log('- Page access tokens never expire when generated from long-lived user tokens');
console.log('- Always keep your App Secret secure and never commit it to version control!');
