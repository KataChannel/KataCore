#!/usr/bin/env node

/**
 * Command Line Tool for Super Admin Management
 * Usage: node scripts/super-admin-cli.js [command] [options]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function error(message) {
  log('❌ ' + message, 'red');
}

function success(message) {
  log('✅ ' + message, 'green');
}

function info(message) {
  log('ℹ️  ' + message, 'blue');
}

function warning(message) {
  log('⚠️  ' + message, 'yellow');
}

// Help text
function showHelp() {
  log('\n🛡️  TazaCore Super Admin CLI Tool', 'cyan');
  log('═══════════════════════════════════', 'cyan');
  log('\nUsage: node scripts/super-admin-cli.js [command] [options]\n');
  
  log('Commands:', 'bright');
  log('  init                    Initialize system with Super Admin');
  log('  check                   Check system initialization status');
  log('  create                  Create new Super Admin user');
  log('  run-script              Run the TypeScript creation script');
  log('  list                    List all Super Admins');
  log('  help                    Show this help message\n');
  
  log('Options:', 'bright');
  log('  --email <email>         Admin email (default: admin@taza.com)');
  log('  --password <password>   Admin password (default: TazaAdmin@2024!)');
  log('  --name <name>           Display name (default: Super Administrator)');
  log('  --username <username>   Username (default: superadmin)');
  log('  --setup-key <key>       System setup key (default: TazaSetup2024)\n');
  
  log('Examples:', 'bright');
  log('  node scripts/super-admin-cli.js init');
  log('  node scripts/super-admin-cli.js init --email admin@company.com --password MySecurePass123');
  log('  node scripts/super-admin-cli.js check');
  log('  node scripts/super-admin-cli.js run-script\n');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};
  
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      options[key] = value;
    }
  }
  
  return { command, options };
}

// Default configuration
function getDefaultConfig(options = {}) {
  return {
    email: options.email || 'admin@taza.com',
    password: options.password || 'TazaAdmin@2024!',
    displayName: options.name || 'Super Administrator',
    username: options.username || 'superadmin',
    setupKey: options['setup-key'] || 'TazaSetup2024'
  };
}

// Check if we're in the correct project directory
function checkProjectStructure() {
  const requiredFiles = [
    'package.json',
    'src/lib/prisma.ts',
    'src/lib/auth',
    'scripts/create-super-admin.ts'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      error(`Required file not found: ${file}`);
      error('Please run this script from the TazaCore project root directory.');
      process.exit(1);
    }
  }
}

// Run TypeScript script
async function runCreateScript(options = {}) {
  try {
    info('Running Super Admin creation script...');
    
    // Check if TypeScript is available
    try {
      execSync('npx tsx --version', { stdio: 'pipe' });
    } catch {
      error('TypeScript execution environment (tsx) not found. Installing...');
      execSync('npm install -g tsx', { stdio: 'inherit' });
    }
    
    const config = getDefaultConfig(options);
    
    // Set environment variables for the script
    process.env.ADMIN_EMAIL = config.email;
    process.env.ADMIN_PASSWORD = config.password;
    process.env.ADMIN_DISPLAY_NAME = config.displayName;
    process.env.ADMIN_USERNAME = config.username;
    
    // Run the TypeScript script
    execSync('npx tsx scripts/create-super-admin.ts', { 
      stdio: 'inherit',
      env: process.env
    });
    
    success('Super Admin creation script completed successfully!');
    info(`Super Admin credentials:`);
    info(`  Email: ${config.email}`);
    info(`  Password: ${config.password}`);
    warning('Please change the default password after first login!');
    
  } catch (error) {
    error('Failed to run creation script: ' + error.message);
    process.exit(1);
  }
}

// Check system status via API
async function checkSystemStatus() {
  try {
    info('Checking system initialization status...');
    
    // Try to start the development server temporarily to check API
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/initialize');
      const data = await response.json();
      
      if (data.initialized) {
        success('System is already initialized');
        info(`Super Admin exists: ${data.superAdmin.exists}`);
        if (data.superAdmin.exists) {
          info(`Super Admin email: ${data.superAdmin.email}`);
          info(`Created at: ${new Date(data.superAdmin.createdAt).toLocaleDateString()}`);
        }
        info(`System stats: ${JSON.stringify(data.stats, null, 2)}`);
      } else {
        warning('System is not initialized yet');
        info('Run "node scripts/super-admin-cli.js init" to initialize');
      }
    } catch (apiError) {
      warning('Could not connect to API server. System may not be running.');
      info('Try starting the development server with "npm run dev" first.');
      
      // Fall back to database check
      info('Attempting direct database check...');
      await runDatabaseCheck();
    }
    
  } catch (error) {
    error('Failed to check system status: ' + error.message);
    process.exit(1);
  }
}

// Direct database check using Prisma
async function runDatabaseCheck() {
  try {
    // Run a simple Prisma query to check for Super Admin
    const checkScript = `
      import { prisma } from './src/lib/prisma';
      
      async function check() {
        try {
          const superAdmin = await prisma.user.findFirst({
            where: {
              role: {
                name: {
                  in: ['Super Administrator', 'super_administrator']
                }
              }
            },
            include: { role: true }
          });
          
          if (superAdmin) {
            console.log('✅ Super Admin found in database');
            console.log('📧 Email:', superAdmin.email);
            console.log('👤 Display Name:', superAdmin.displayName);
            console.log('🎯 Role:', superAdmin.role?.name);
            console.log('📅 Created:', superAdmin.createdAt);
          } else {
            console.log('⚠️  No Super Admin found in database');
          }
        } catch (error) {
          console.log('❌ Database check failed:', error.message);
        } finally {
          await prisma.$disconnect();
        }
      }
      
      check();
    `;
    
    // Write temporary check script
    fs.writeFileSync('/tmp/check-super-admin.ts', checkScript);
    
    // Run the check
    execSync('npx tsx /tmp/check-super-admin.ts', { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync('/tmp/check-super-admin.ts');
    
  } catch (error) {
    error('Database check failed: ' + error.message);
  }
}

// Initialize system via API
async function initializeSystem(options = {}) {
  try {
    info('Initializing TazaCore system...');
    
    const config = getDefaultConfig(options);
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setupKey: config.setupKey,
          adminData: {
            email: config.email,
            password: config.password,
            displayName: config.displayName,
            username: config.username
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        success('System initialized successfully!');
        info('Super Admin created with the following credentials:');
        info(`  Email: ${result.data.credentials.email}`);
        info(`  Password: ${result.data.credentials.password}`);
        warning(result.data.credentials.warning);
      } else {
        error('Initialization failed: ' + result.error);
        
        if (result.error.includes('already initialized')) {
          info('System is already set up. Use "check" command to view status.');
        }
      }
    } catch (apiError) {
      warning('Could not connect to API server. Falling back to script method...');
      await runCreateScript(options);
    }
    
  } catch (error) {
    error('Failed to initialize system: ' + error.message);
    process.exit(1);
  }
}

// List Super Admins
async function listSuperAdmins() {
  try {
    info('Listing all Super Administrators...');
    
    const listScript = `
      import { prisma } from './src/lib/prisma';
      
      async function listSuperAdmins() {
        try {
          const superAdmins = await prisma.user.findMany({
            where: {
              role: {
                name: {
                  in: ['Super Administrator', 'super_administrator']
                }
              }
            },
            include: {
              role: true,
              employee: true
            }
          });
          
          if (superAdmins.length === 0) {
            console.log('⚠️  No Super Administrators found');
            return;
          }
          
          console.log(\`✅ Found \${superAdmins.length} Super Administrator(s):\`);
          console.log('');
          
          superAdmins.forEach((admin, index) => {
            console.log(\`[\${index + 1}] Super Administrator\`);
            console.log(\`    📧 Email: \${admin.email}\`);
            console.log(\`    👤 Display Name: \${admin.displayName}\`);
            console.log(\`    🆔 Username: \${admin.username || 'N/A'}\`);
            console.log(\`    ✅ Active: \${admin.isActive ? 'Yes' : 'No'}\`);
            console.log(\`    🔒 Verified: \${admin.isVerified ? 'Yes' : 'No'}\`);
            console.log(\`    📅 Created: \${admin.createdAt}\`);
            console.log(\`    🕐 Last Login: \${admin.lastLoginAt || 'Never'}\`);
            console.log(\`    🎯 Role: \${admin.role?.name}\`);
            if (admin.employee) {
              console.log(\`    👨‍💼 Employee: \${admin.employee.firstName} \${admin.employee.lastName}\`);
            }
            console.log('');
          });
        } catch (error) {
          console.log('❌ Error listing Super Admins:', error.message);
        } finally {
          await prisma.$disconnect();
        }
      }
      
      listSuperAdmins();
    `;
    
    // Write temporary list script
    fs.writeFileSync('/tmp/list-super-admins.ts', listScript);
    
    // Run the script
    execSync('npx tsx /tmp/list-super-admins.ts', { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync('/tmp/list-super-admins.ts');
    
  } catch (error) {
    error('Failed to list Super Admins: ' + error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const { command, options } = parseArgs();
  
  // Check project structure
  checkProjectStructure();
  
  log('\n🛡️  TazaCore Super Admin CLI', 'cyan');
  log('═══════════════════════════════', 'cyan');
  
  switch (command) {
    case 'init':
    case 'initialize':
      await initializeSystem(options);
      break;
      
    case 'check':
    case 'status':
      await checkSystemStatus();
      break;
      
    case 'create':
    case 'run-script':
      await runCreateScript(options);
      break;
      
    case 'list':
      await listSuperAdmins();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      if (command) {
        error(`Unknown command: ${command}`);
      } else {
        error('No command specified');
      }
      log('\nUse "help" to see available commands\n');
      process.exit(1);
  }
  
  log('');
}

// Run the CLI
main().catch((error) => {
  error('CLI execution failed: ' + error.message);
  process.exit(1);
});
