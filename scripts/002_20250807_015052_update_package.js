const fs = require('fs');
const path = require('path');

try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Update scripts for Bun
    packageJson.scripts = {
        ...packageJson.scripts,
        "dev": "bun --bun next dev -p 3900",
        "dev:turbo": "bun --bun next dev --turbo -p 3900",
        "build": "bun --bun next build",
        "start": "bun --bun next start -p 3900",
        "lint": "bun --bun next lint",
        "type-check": "bun --bun tsc --noEmit",
        "bun:install": "bun install",
        "bun:update": "bun update",
        "bun:clean": "rm -rf node_modules bun.lockb && bun install"
    };

    // Add Bun-specific configuration
    packageJson.trustedDependencies = packageJson.trustedDependencies || [];
    if (!packageJson.trustedDependencies.includes("sharp")) {
        packageJson.trustedDependencies.push("sharp");
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for Bun');
} catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
}
