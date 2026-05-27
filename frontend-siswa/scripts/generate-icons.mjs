import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '../public/icons');
mkdirSync(outputDir, { recursive: true });

function generateSVG(size) {
  const r = size / 2;
  const fontSize = size * 0.38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#grad)"/>
  <text x="${r}" y="${r + fontSize * 0.38}" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">🎓</text>
  <text x="${r}" y="${size * 0.88}" font-family="Arial,sans-serif" font-size="${size * 0.13}" font-weight="600" fill="rgba(255,255,255,0.85)" text-anchor="middle">Siswa</text>
</svg>`;
}

// Tulis SVG sebagai file (bisa langsung dipakai browser)
writeFileSync(join(outputDir, 'icon-192x192.svg'), generateSVG(192));
writeFileSync(join(outputDir, 'icon-512x512.svg'), generateSVG(512));

// Buat PNG minimal menggunakan raw BMP/PPM → tidak perlu library
// Lebih praktis: buat PNG 1x1 placeholder dulu, lalu pakai SVG sebagai icon
// Next.js dan browser modern support SVG dalam manifest

// Update manifest untuk pakai SVG
import { readFileSync } from 'fs';
const manifestPath = join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.icons = [
  { src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
  { src: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
];
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✓ Icons generated: public/icons/icon-192x192.svg & icon-512x512.svg');
console.log('✓ manifest.json updated to use SVG icons');
