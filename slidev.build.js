const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const slidesDir = path.resolve(__dirname, 'slides');
const outBase = path.resolve(__dirname, 'static/slidev');

const slideFiles = fs.readdirSync(slidesDir).filter(f => f.endsWith('.md'));

for (const file of slideFiles) {
  const name = file.replace(/\.md$/, '');
  const inputPath = path.join(slidesDir, file);
  const outPath = path.join(outBase, name);
  const base = `/slidev/${name}/`; // This is the URL at which the deck will be served
  
  console.log(`▶️  Building ${file} → ${outPath} (base: ${base})`);
  try {
    execSync(`npx slidev build "${inputPath}" --base "${base}" --out "${outPath}"`, {
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(`❌ Failed to build ${file}`);
    console.error(err.message);
  }
}

