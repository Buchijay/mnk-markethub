const https = require('https');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'src', 'app', 'fonts');
const fonts = [
  {
    name: 'Geist-Variable.woff2',
    url: 'https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-sans/Geist-Variable.woff2',
  },
  {
    name: 'GeistMono-Variable.woff2',
    url: 'https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-mono/GeistMono-Variable.woff2',
  }
];

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(filepath).size;
        resolve(size);
      });
    }).on('error', reject);
  });
}

async function downloadAllFonts() {
  // Clear old files
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  // Remove old small files
  try {
    fs.readdirSync(fontDir).forEach(file => {
      const filePath = path.join(fontDir, file);
      const stat = fs.statSync(filePath);
      if (file.endsWith('.woff') && stat.size < 100) {
        fs.unlinkSync(filePath);
        console.log(`Removed old file: ${file}`);
      }
    });
  } catch (e) {}

  for (const font of fonts) {
    const filepath = path.join(fontDir, font.name);
    console.log(`\nDownloading ${font.name}...`);
    
    try {
      const size = await downloadFile(font.url, filepath);
      console.log(`✓ Downloaded successfully (${(size / 1024).toFixed(2)} KB)`);
    } catch (err) {
      console.error(`✗ Failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\n✓ All fonts downloaded successfully!');
  console.log(`\nFonts are in: ${fontDir}`);
  console.log('\nNote: These are .woff2 fonts (modern, compressed format).');
  console.log('To use in your next.config.ts or font imports:');
  console.log('  - Geist-Variable.woff2 is the sans-serif variable font');
  console.log('  - GeistMono-Variable.woff2 is the monospace variable font');
  process.exit(0);
}

downloadAllFonts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
