const sharp = require('sharp');

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  const svgBuffer = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEFAE0"/>
          <stop offset="100%" stop-color="#E8E0C8"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <text x="600" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="72" fill="#2D3B2D" font-weight="bold">SereneStay.ai</text>
      <text x="600" y="340" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" fill="#5A6B5A">Find Your Perfect Healing Retreat</text>
      <text x="600" y="400" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#7C9A6E">56 curated destinations · AI-powered matching · 7 regions</text>
    </svg>
  `);

  await sharp(svgBuffer)
    .png()
    .toFile('public/og-image.png');

  // Also generate apple-touch-icon as PNG (180x180)
  const iconSvg = Buffer.from(`
    <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7C9A6E"/>
          <stop offset="100%" stop-color="#4A6741"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="40" fill="url(#g)"/>
      <text x="90" y="128" text-anchor="middle" font-family="Georgia,serif" font-size="110" fill="#FEFAE0" font-weight="bold">S</text>
    </svg>
  `);

  await sharp(iconSvg)
    .png()
    .toFile('public/apple-touch-icon.png');

  // Generate favicon.png (32x32)
  const faviconSvg = Buffer.from(`
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7C9A6E"/>
          <stop offset="100%" stop-color="#4A6741"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#g)"/>
      <text x="16" y="23" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#FEFAE0" font-weight="bold">S</text>
    </svg>
  `);

  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');

  console.log('Generated: og-image.png, apple-touch-icon.png, favicon.png');
}

generateOGImage().catch(console.error);
