import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function postBuild() {
  const websiteDist = path.join(rootDir, 'dist-website');
  const finalDist = path.join(rootDir, 'dist');
  const cmsDataSrc = path.join(rootDir, 'public', 'cms');
  const cmsDataDest = path.join(finalDist, 'cms');

  console.log("🚀 Starting post-build processing...");

  // 1. Ensure dist exists and is clean
  if (fs.existsSync(finalDist)) {
    fs.rmSync(finalDist, { recursive: true, force: true });
  }
  fs.mkdirSync(finalDist, { recursive: true });

  // 2. Copy website assets
  if (!fs.existsSync(websiteDist)) {
    throw new Error(`Website build not found at ${websiteDist}. Run 'npm run build:website' first.`);
  }
  
  console.log("📦 Copying website assets...");
  copyDir(websiteDist, finalDist);

  // 3. Copy ALL public assets to dist (includes uploads, icons, etc)
  console.log("📂 Syncing public assets (uploads, data)...");
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, finalDist);
  }

  // 4. Generate static HTML files for each page slug
  console.log("📄 Generating static page routes...");
  const pagesFile = path.join(cmsDataSrc, 'pages.json');
  if (fs.existsSync(pagesFile)) {
    const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
    const indexHtmlTemplate = fs.readFileSync(path.join(websiteDist, 'index.html'), 'utf8');

    pages.forEach(page => {
      if (page.slug && page.slug !== 'index') {
        const pagePath = path.join(finalDist, `${page.slug}.html`);
        // In a real SvelteKit SSG, we would pre-render the content.
        // For this "SPA-SSG" hybrid, we provide the index.html at the correct location.
        fs.writeFileSync(pagePath, indexHtmlTemplate);
        console.log(`   - Generated ${page.slug}.html`);
      }
    });
  }

  console.log("✅ Post-build complete! Your site is ready in 'dist/'.");
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

postBuild().catch(err => {
  console.error("❌ Post-build failed:", err);
  process.exit(1);
});
