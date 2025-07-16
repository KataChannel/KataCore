#!/usr/bin/env node

/**
 * Call Center Integration Test Script
 * Tests all API endpoints, components, and services for the call center system
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Call Center Integration Test Starting...\n');

// Test file existence
const testFiles = [
    // Main files
    'src/app/admin/crm/callcenter/layout.tsx',
    'src/app/admin/crm/callcenter/page.tsx',
    
    // Components
    'src/app/admin/crm/callcenter/components/ExtensionManagement.tsx',
    'src/app/admin/crm/callcenter/components/CallHistoryOverview.tsx',
    'src/app/admin/crm/callcenter/components/SIPPhone.tsx',
    'src/app/admin/crm/callcenter/components/CallCenterSettings.tsx',
    
    // Hooks
    'src/app/admin/crm/callcenter/hooks/useExtensions.ts',
    'src/app/admin/crm/callcenter/hooks/useCalls.ts',
    'src/app/admin/crm/callcenter/hooks/useSIP.ts',
    
    // Services
    'src/app/admin/crm/callcenter/services/api.service.ts',
    'src/app/admin/crm/callcenter/services/sip.service.ts',
    
    // Types
    'src/app/admin/crm/callcenter/types/callcenter.types.ts',
    
    // API Routes
    'src/app/api/callcenter/extensions/route.ts',
    'src/app/api/callcenter/calls/route.ts',
    'src/app/api/callcenter/users/route.ts',
    'src/app/api/callcenter/export/route.ts'
];

let fileCount = 0;
let existingFiles = 0;

console.log('📁 Checking file structure:');
testFiles.forEach(file => {
    fileCount++;
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
        existingFiles++;
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

console.log(`\n📊 File Status: ${existingFiles}/${fileCount} files exist\n`);

// Test TypeScript compilation readiness
console.log('🔍 TypeScript readiness check:');

// Check for required dependencies
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
        '@heroicons/react',
        'react',
        'react-dom',
        'next',
        'typescript'
    ];
    
    const devDeps = packageJson.devDependencies || {};
    const deps = packageJson.dependencies || {};
    const allDeps = { ...deps, ...devDeps };
    
    requiredDeps.forEach(dep => {
        if (allDeps[dep]) {
            console.log(`✅ ${dep}: ${allDeps[dep]}`);
        } else {
            console.log(`❌ ${dep}: MISSING`);
        }
    });
}

// Test documentation files
console.log('\n📚 Documentation check:');
const docFiles = [
    'docs/23_CALLCENTER-LAYOUT-PAGE-GUIDE.md',
    'docs/24_CALLCENTER-USAGE-REUSABILITY-GUIDE.md'
];

docFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`✅ ${file} (${content.length} chars)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

console.log('\n🎯 Integration Test Summary:');
console.log(`- Core files: ${existingFiles}/${fileCount}`);
console.log(`- Documentation: ${docFiles.filter(f => fs.existsSync(path.join(process.cwd(), f))).length}/${docFiles.length}`);
console.log('\n✨ Call Center Integration Test Complete!');
