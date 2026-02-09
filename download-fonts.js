const https = require('https');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'src', 'app', 'fonts');
const fonts = [
  {
    name: 'GeistVF.woff',
    urls: [
      'https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist/GeistVF.woff',
      'https://raw.githubusercontent.com/vercel/geist-font/main/packages/font/files/geist/GeistVF.woff',
    ]
  },
  {
    name: 'GeistMonoVF.woff',
    urls: [
      'https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-mono/GeistMonoVF.woff',
      'https://raw.githubusercontent.com/vercel/geist-font/main/packages/font/files/geist-mono/GeistMonoVF.woff',
    ]
  }
];

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 5000, redirects: 5 }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`Following redirect from ${url}`);
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(filepath).size;
        if (size < 1000) {
          reject(new Error(`Downloaded file is too small: ${size} bytes`));
        } else {
          resolve();
        }
      });
    }).on('error', reject);
  });
}

async function downloadAllFonts() {
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  for (const font of fonts) {
    const filepath = path.join(fontDir, font.name);
    console.log(`\nDownloading ${font.name}...`);
    
    let success = false;
    for (const url of font.urls) {
      try {
        console.log(`  Trying: ${url}`);
        await downloadFile(url, filepath);
        const size = fs.statSync(filepath).size;
        console.log(`  ✓ Successfully downloaded ${font.name} (${size} bytes)`);
        success = true;
        break;
      } catch (err) {
        console.log(`  ✗ Failed: ${err.message}`);
      }
    }
    
    if (!success) {
      console.error(`✗ Failed to download ${font.name} from all sources`);
      process.exit(1);
    }
  }

  console.log('\n✓ All fonts downloaded successfully!');
  process.exit(0);
}

downloadAllFonts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
