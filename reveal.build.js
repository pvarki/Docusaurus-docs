// reveal.build.js
const fs = require('fs');
const path = require('path');

// Directory containing slide markdown
const slidesDir = path.resolve(__dirname, 'slides');
// Output directory for built slides (will be served as static assets)
const outBase = path.resolve(__dirname, 'static/slides');
// Path to your custom template
const templatePath = path.resolve(__dirname, 'reveal-template.html');

const phoneFrameSnippet = ({
  screenshot,
  alt,
  top,
  left,
  width,
  height,
  caption,
}) => `
<div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 20px;">
  <!-- Left: Phone frame with screenshot -->
  <div 
    style="
      flex: 0 0 auto;
      position: relative; 
      width: 280px; 
      max-width: 98vw; 
      background: url('/img/frames/iphone.png') center/contain no-repeat;
      aspect-ratio: 350 / 725;
    "
  >
    <img 
      src="${screenshot}" 
      alt="${alt}"
      style="
        position: absolute;
        top: ${top};
        left: ${left};
        width: ${width}; 
        height: ${height}; 
        object-fit: cover;
      "
    />
  </div>
  <!-- Right: Caption text -->
  <div style="flex: 1; min-width: 200px; text-align: left;">
    <p style="margin: 0; padding: 0; font-size: 1.1em;">
      ${caption}
    </p>
  </div>
</div>

`;

function replacePhoneFrameSyntax(mdContent) {
  // Use [\s\S]*? to match everything including newlines
  const phoneFrameRegex = /@\[phoneFrame\]\(\s*([\s\S]*?)\s*\)/g;
  return mdContent.replace(phoneFrameRegex, (match, inner) => {
    const params = {};
    // Split parameters by comma. Trim each piece.
    inner.split(',').forEach(piece => {
      const [key, value] = piece.trim().split('=');
      if (key && value) {
        // Remove quotes around the value, if any
        params[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
    return phoneFrameSnippet(params);
  });
}


// Recursively retrieve markdown file paths from the slides directory.
function getMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else {
      if (file.endsWith('.md')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const allMarkdownFiles = getMarkdownFiles(slidesDir);

allMarkdownFiles.forEach(inputPath => {
  // Compute the relative path from slidesDir.
  // Example: if inputPath is "slides/en/deployapp/login/01-login.md"
  // then relPath will be "en/deployapp/login/01-login.md"
  let relPath = path.relative(slidesDir, inputPath); 
  
  // Split into parts by path separator.
  const parts = relPath.split(path.sep);
  
  // Assume the first part is the locale if it's "en" or "fi", otherwise default to "en"
  let locale = 'en';
  if (parts[0] === 'en' || parts[0] === 'fi') {
    locale = parts.shift();
  }
  
  // The filename is the last part.
  const fileName = parts.pop(); // e.g., "01-login.md" or "index.md"
  const deckName = fileName.replace(/\.md$/, ''); // remove the .md extension
  
  // The deckPath is the joined remaining parts plus the file name.
  // For example, if parts now is ["deployapp", "login"] and fileName is "01-login.md",
  // deckPath becomes "deployapp/login/01-login".
  const deckPath = parts.concat(deckName).join('/');
  
  // Output folder will be: static/slides/<locale>/<deckPath>
  const outputDir = path.join(outBase, locale, deckPath);
  
  console.log(`▶️  Building Reveal.js slide: ${path.relative(slidesDir, inputPath)} → ${outputDir}`);
  
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let template = fs.readFileSync(templatePath, 'utf8');
    let mdContent = fs.readFileSync(inputPath, 'utf8');
    // Strip YAML front matter if present and trim extra whitespace.
    mdContent = mdContent.replace(/^---[\s\S]+?---\n/, '').trim();
    // Process custom phone frame syntax.
    mdContent = replacePhoneFrameSyntax(mdContent);
    // Insert final MD into the reveal template.
    template = template.replace('{{ mdContent }}', mdContent);
    
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, template, 'utf8');
    
    console.log(`✅ Built slide deck: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to build ${inputPath}`);
    console.error(err.message);
  }
});
