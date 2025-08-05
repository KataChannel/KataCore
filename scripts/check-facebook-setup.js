#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkFacebookSetup() {
  console.log('🔍 Checking Facebook Login Setup...\n');

  // Check .env file
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');

  const requiredEnvVars = {
    'NEXT_PUBLIC_FACEBOOK_APP_ID': null,
    'FACEBOOK_APP_SECRET': null,
    'NEXT_PUBLIC_FACEBOOK_API_VERSION': null,
  };

  // Parse env variables
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && key in requiredEnvVars) {
      requiredEnvVars[key] = value;
    }
  });

  // Check required variables
  let allEnvVarsSet = true;
  console.log('📋 Environment Variables:');
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      console.log(`❌ ${key}: Not set`);
      allEnvVarsSet = false;
    } else {
      // Mask sensitive values
      const displayValue = key.includes('SECRET') ? '*'.repeat(8) : value;
      console.log(`✅ ${key}: ${displayValue}`);
    }
  }

  if (!allEnvVarsSet) {
    console.log('\n⚠️  Some required environment variables are missing.');
    console.log('Please set them in your .env file:');
    console.log('NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id');
    console.log('FACEBOOK_APP_SECRET=your_app_secret');
    console.log('NEXT_PUBLIC_FACEBOOK_API_VERSION=v23.0');
    return false;
  }

  // Check if files exist
  const requiredFiles = [
    'app/api/auth/facebook/route.ts',
    'src/components/auth/SocialLoginButton.tsx',
    'src/types/social-auth.d.ts',
    'src/lib/auth/unified-auth.service.ts'
  ];

  console.log('\n📁 Required Files:');
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('\n⚠️  Some required files are missing.');
    return false;
  }

  // Check Facebook App ID format
  const appId = requiredEnvVars['NEXT_PUBLIC_FACEBOOK_APP_ID'];
  if (appId && !/^\d+$/.test(appId)) {
    console.log('\n⚠️  Facebook App ID should be numeric');
    return false;
  }

  // Success
  console.log('\n✅ Facebook Login setup looks good!');
  console.log('\n📝 Next steps:');
  console.log('1. Ensure your Facebook App is configured for your domain');
  console.log('2. Test login on HTTPS (Facebook requires HTTPS)');
  console.log('3. Check Facebook App permissions (email, public_profile)');
  console.log('4. Run your app: npm run dev:https');
  
  return true;
}

// Run the check
if (require.main === module) {
  checkFacebookSetup();
}

module.exports = checkFacebookSetup;
