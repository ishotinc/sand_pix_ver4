const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { name: 'friendly-tone', text: 'Friendly Tone', color: '#FFB6C1' },
  { name: 'professional-tone', text: 'Professional Tone', color: '#4682B4' },
  { name: 'innovative-tone', text: 'Innovative Tone', color: '#9370DB' },
  { name: 'trustworthy-tone', text: 'Trustworthy Tone', color: '#2E8B57' },
  { name: 'warm-colors', text: 'Warm Colors', color: '#FF6347' },
  { name: 'cool-colors', text: 'Cool Colors', color: '#4169E1' },
  { name: 'monochrome', text: 'Monochrome', color: '#696969' },
  { name: 'vivid-colors', text: 'Vivid Colors', color: '#FF1493' },
  { name: 'pastel-colors', text: 'Pastel Colors', color: '#FFE4E1' },
  { name: 'high-density', text: 'High Density', color: '#708090' },
  { name: 'asymmetric', text: 'Asymmetric', color: '#FF8C00' },
  { name: 'photo-centric', text: 'Photo-Centric', color: '#8B4513' }
];

const outputDir = path.join(__dirname, '../public/images/swipe');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generatePlaceholder(image) {
  const width = 400;
  const height = 600;
  
  // Create SVG with text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${image.color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="30" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${image.text}
      </text>
    </svg>
  `;
  
  try {
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 80 })
      .toFile(path.join(outputDir, `${image.name}.jpg`));
    
    console.log(`Generated: ${image.name}.jpg`);
  } catch (error) {
    console.error(`Error generating ${image.name}.jpg:`, error);
  }
}

// Generate all placeholders
async function generateAll() {
  console.log('Generating placeholder images...');
  
  for (const image of images) {
    await generatePlaceholder(image);
  }
  
  console.log('All placeholder images generated successfully!');
}

generateAll();