const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directory containing your slide markdown files
const slidesDir = path.resolve(__dirname, 'slides');
// Output directory for built slides (will be served as static assets)
const outBase = path.resolve(__dirname, 'static/slides');
// Path to your custom template
const templatePath = path.resolve(__dirname, 'reveal-template.html');

// Ensure the output base directory exists
if (!fs.existsSync(outBase)) {
  fs.mkdirSync(outBase, { recursive: true });
}

// Get all Markdown files in slides/
const slideFiles = fs.readdirSync(slidesDir).filter(f => f.endsWith('.md'));

slideFiles.forEach(file => {
  const name = file.replace(/\.md$/, '');
  const inputPath = path.join(slidesDir, file);
  // Output folder for each slide deck
  const outputDir = path.join(outBase, name);

  console.log(`▶️  Building Reveal.js slide: ${file} → ${outputDir}`);

  try {
    // Ensure output directory exists before writing
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    // Read your template file
    let template = fs.readFileSync(templatePath, 'utf8');
    // Read your markdown slide content, strip front matter if present, and trim extra whitespace
    const mdContent = fs.readFileSync(inputPath, 'utf8')
      .replace(/^---[\s\S]+?---\n/, '')
      .trim();
    template = template.replace('{{ mdContent }}', mdContent);

    // Define output path
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, template, 'utf8');

    console.log(`✅ Built slide deck: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to build ${file}`);
    console.error(err.message);
  }
});
