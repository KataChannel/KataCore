const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple HR icon SVG since we need proper PWA icons
const hrIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="white" stroke-width="16"/>
  
  <!-- HR Icon - People/Users -->
  <g fill="white">
    <!-- Person 1 -->
    <circle cx="200" cy="180" r="30"/>
    <ellipse cx="200" cy="280" rx="50" ry="40"/>
    
    <!-- Person 2 -->
    <circle cx="312" cy="180" r="30"/>
    <ellipse cx="312" cy="280" rx="50" ry="40"/>
    
    <!-- Building/Department icon -->
    <rect x="220" y="350" width="72" height="80" rx="8" fill="white"/>
    <rect x="235" y="365" width="12" height="12" fill="#4f46e5"/>
    <rect x="255" y="365" width="12" height="12" fill="#4f46e5"/>
    <rect x="275" y="365" width="12" height="12" fill="#4f46e5"/>
    <rect x="235" y="385" width="12" height="12" fill="#4f46e5"/>
    <rect x="255" y="385" width="12" height="12" fill="#4f46e5"/>
    <rect x="275" y="385" width="12" height="12" fill="#4f46e5"/>
    
    <!-- HR Text -->
    <text x="256" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">HR</text>
  </g>
</svg>
`;

async function generateIcons() {
  const iconsDir = path.join(__dirname, 'public', 'icons');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Write the SVG file
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), hrIconSvg);

  // Generate PNG icons for different sizes
  for (const size of sizes) {
    try {
      await sharp(Buffer.from(hrIconSvg))
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

      console.log(`✓ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error);
    }
  }

  // Generate favicon.ico
  try {
    await sharp(Buffer.from(hrIconSvg))
      .resize(32, 32)
      .ico()
      .toFile(path.join(__dirname, 'public', 'favicon.ico'));

    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error);
  }

  console.log('✓ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
