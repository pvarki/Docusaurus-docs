const fs = require('fs');
const path = require('path');

function logFound(p)    { console.log(chalk.gray('  ↳ inline'), p); }
function logMissing(p)  { console.log(chalk.yellow('  ⚠︎ missing'), p); }

// Directory containing slide markdown
const slidesDir = path.resolve(__dirname, 'src/decks');
// Output directory for built slides (will be served as static assets)
const outBase = path.resolve(__dirname, 'src/decks/prebuilds');
// Path to your custom template
const templatePath = path.resolve(__dirname, 'reveal-template.html');

const inlineCSS = `
<style>
/* Global Mobile Overrides for very small screens */
@media (max-width: 300px) {
  .reveal, .reveal .slides, .reveal .slides section {
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
  }
}

.slide-content-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 20px;
  max-width: 90%;
  margin: 0 auto;
}

.slide-text {
  flex: 1.2;
  text-align: left;
  font-size: 1em;
  line-height: 1.5em;
}

.slide-img-right,
.slide-img-left {
  flex: 0.8;
  max-width: 60%;
}

.slide-img-right img,
.slide-img-left img {
  width: 100%;
  height: auto;
  display: block;
}

.slide-img-right {
  order: 2;
}

.slide-img-left {
  order: 0;
}

/* Optional: stack vertically on mobile */
@media (max-width: 700px) {
  .slide-content-grid {
    flex-direction: column;
    text-align: center;
  }

  .slide-img-right,
  .slide-img-left {
    order: 0;
    max-width: 100%;
  }
}

/* === Text with Small Logo Image === */
.slide-with-logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding: 20px;
  max-width: 80%;
  margin: 0 auto;
  text-align: left;
}

.slide-with-logo img {
  width: 150px;
  height: auto;
  flex-shrink: 0;
}

.logo-fixed {
  position: fixed;
  bottom: 12px;
  right: 12px;
  width: 140px;
  height: 80px;
  background: url('src/decks/img/logo_green.png') no-repeat center center;
  background-size: contain;
  opacity: 0.9;
  z-index: 1000;
  pointer-events: none;
}

/* ----- Desktop (Default) Layout ----- */
.phone-frame-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
}

.phone-frame-clip {
  overflow: visible; /* No clipping on desktop */
}

.phone-frame-image {
  position: relative;
  width: 280px;           /* Fixed width on desktop */
  max-width: 120vw;
  background: url('/img/frames/iphone.png') center/contain no-repeat;
  /* Maintain the phone frame's aspect ratio (350:725) */
  aspect-ratio: 350 / 725;
}

.phone-frame-screenshot {
  position: absolute;
  object-fit: cover;
}

.phone-frame-caption {
  flex: 1;
  min-width: 200px;
  text-align: left;
  font-size: 1em;
  padding: 0 10px;
  margin-top: 10px;
  word-wrap: break-word; /* Ensure long words wrap correctly */
  overflow-wrap: break-word; /* For modern browsers */
  white-space: normal; /* Ensure the text wraps within the container */
}

/* ----- Mobile (max-width: 500px) Layout ----- */
.phone-frame-caption {
  flex: 1;
  min-width: 200px;
  text-align: left;
  font-size: 1em;
  padding: 0 10px;
  margin-top: 10px;
  word-wrap: break-word; /* Ensure long words wrap correctly */
  overflow-wrap: break-word; /* For modern browsers */
  white-space: normal; /* Ensure the text wraps within the container */
}

/* ----- Mobile (max-width: 500px) Layout ----- */
@media (max-width: 500px) {
  /* Force slide content to align at the top */
  .reveal .slides section {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
  }
  
  /* Reduce header sizes so the slide title doesn't dominate */
  .reveal .slides section h1,
  .reveal .slides section h2,
  .reveal .slides section h3 {
    font-size: 0.9em !important;
    margin: 0.2em 0 !important;
    padding: 0 !important;
    line-height: 1em !important;
    text-align: center;
  }

  /* Also reduce regular text (paragraphs and list items) on mobile */
  .reveal .slides section p,
  .reveal .slides section li {
    font-size: 0.6em !important;
    line-height: 1.2em !important;
  }
  
  /* Use Flexbox for centering on mobile */
  .phone-frame-container {
    display: flex;
    flex-direction: column;  /* Stack image and caption vertically */
    justify-content: center; /* Vertically center content */
    align-items: center;  /* Horizontally center content */
    width: 100vw;
    height: 100vh;  /* Full height of the viewport */
    padding-left: 10vw;  /* Horizontal padding (left side) */
    padding-right: 10vw; /* Horizontal padding (right side) */
    padding-top: 0;   /* No top padding */
    padding-bottom: 0; /* No bottom padding */
    text-align: center;
    gap: 5px;  /* Reduced gap between image and caption */
  }
  
  /* Reserve about 55% of viewport height for the image area */
  .phone-frame-clip {
    width: 80%;
    overflow: hidden;
    height: 50vh; 
  }
  
  /* Make sure the image fills its container but smaller */
  .phone-frame-image {
    width: 70%;  /* Reduced width from 90% to 70% */
    height: 92%;  /* Reduced height from 90% to 70% */
    background-size: cover;
    background-position: center;
  }

  .phone-frame-screenshot {
    width: 70%;
    height: 92%;
    object-fit: cover;
    background-position: center;
  }

  /* Caption area: Allow for longer content with better wrapping and center it */
  .phone-frame-caption {
    font-size: 0.5em;
    text-align: left;  /* Center the text horizontally */
    width: 80%;  /* Make caption width 80% of the screen */
    height: auto; /* Allow the height to grow based on content */
    overflow: visible;  /* Allow content to be fully visible */
    margin-top: 10px;
    margin-left: auto;   /* Center the caption horizontally */
    margin-right: 50px;  /* Center the caption horizontally */
    word-break: break-word;  /* Ensure words break at long edges */
  }

  /* Ordered list styling */
  .phone-frame-caption ol {
    padding-left: 20px;
    font-size: 1em;
    line-height: 1.3em;
  }

  .phone-frame-caption ol li {
    line-height: 1.2em;
    margin-bottom: 5px; /* Added spacing between list items */
  }

 .screenshot-box img {
    width: 65vw;
    height: auto;
    aspect-ratio: 4 / 3;
    max-height: 45vh;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }

  .slide-content-grid {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 10px;
    gap: 10px;
  }

  .slide-text {
    padding: 0 10px;
    font-size: 0.6em;
    line-height: 1em;
  }
}

</style>
`;

// Custom snippet for the phone frame using CSS classes.
// Now, it accepts both "caption" (plain text/HTML) and "list" (a comma-separated, numbered list).
const phoneFrameSnippet = ({
  screenshot,
  alt,
  top,
  left,
  width,
  height,
  caption,
  list
}) => {
  let captionContent = "";
  if (list) {
    const items = list.split(",");
    captionContent = "<ol>";
    for (let i = 0; i < items.length; i++) {
      captionContent += "<li>" + items[i].trim() + "</li>";
    }
    captionContent += "</ol>";
  } else if (caption) {
    captionContent = caption;
  }

  const imgDir = path.resolve(__dirname, 'src/decks/img');
  const imgPath = path.resolve(imgDir, path.basename(screenshot));
  let screenshotData = screenshot;
  if (fs.existsSync(imgPath)) {
    const ext = path.extname(imgPath).slice(1);
    const mime = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      gif: 'image/gif',
      webp: 'image/webp'
    }[ext];
    if (mime) {
      const base64 = fs.readFileSync(imgPath).toString('base64');
      screenshotData = `data:${mime};base64,${base64}`;
    }
  }

  return `
<div class="phone-frame-container">
  <div class="phone-frame-clip">
    <div class="phone-frame-image">
      <img 
        src="${screenshotData}" 
        alt="${alt}" 
        class="phone-frame-screenshot"
        style="top: ${top}; left: ${left}; width: ${width}; height: ${height};"
      />
    </div>
  </div>
  <div class="phone-frame-caption">
    ${captionContent}
  </div>
</div>
`;
};

const screenshotBoxSnippet = ({
  screenshot,
  alt,
  top,
  left,
  width,
  height,
  caption,
  list
}) => {
  let captionContent = "";
  if (list) {
    const items = list.split(",");
    captionContent = "<ol>";
    for (let i = 0; i < items.length; i++) {
      captionContent += "<li>" + items[i].trim() + "</li>";
    }
    captionContent += "</ol>";
  } else if (caption) {
    captionContent = caption;
  }

  const imgDir = path.resolve(__dirname, 'src/decks/img');
  const imgPath = path.resolve(imgDir, path.basename(screenshot));
  let screenshotData = screenshot;
  if (fs.existsSync(imgPath)) {
    const ext = path.extname(imgPath).slice(1);
    const mime = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      gif: 'image/gif',
      webp: 'image/webp'
    }[ext];
    if (mime) {
      const base64 = fs.readFileSync(imgPath).toString('base64');
      screenshotData = `data:${mime};base64,${base64}`;
    }
  }

  return `
 <div class="slide-content-grid">
 <div class="slide-img-left screenshot-box">
     <img src="${screenshotData}" alt="${alt}" />
   </div>
   <div class="slide-text">
     ${caption}
   </div>
 </div>`;

};




function replaceScreenshotBoxSyntax(mdContent) {
  const regex = /@\[screenshotBox\]\(\s*([\s\S]*?)\s*\)/g;
  return mdContent.replace(regex, (match, inner) => {
    const params = {};
    inner.split(',').forEach(piece => {
      const [key, value] = piece.trim().split('=');
      if (key && value) {
        params[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
    return screenshotBoxSnippet(params);
  });
}

function replacePhoneFrameSyntax(mdContent) {
  // Match custom syntax including newlines within the parentheses.
  const phoneFrameRegex = /@\[phoneFrame\]\(\s*([\s\S]*?)\s*\)/g;
  return mdContent.replace(phoneFrameRegex, (match, inner) => {
    const params = {};
    // Split parameters by comma and extract key=value pairs.
    inner.split(',').forEach(piece => {
      const [key, value] = piece.trim().split('=');
      if (key && value) {
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

function inlineCSSImages(css, imgDir) {
  return css.replace(/url\((['"]?)(.*?)\1\)/g, (match, quote, url) => {
    if (url.startsWith('data:')) return match;
    const filePath = path.resolve(imgDir, path.basename(url));
    if (!fs.existsSync(filePath)) return match;
    const ext = path.extname(filePath).slice(1);
    const mime = ({
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      gif: 'image/gif',
      webp: 'image/webp'
    })[ext];
    if (!mime) return match;
    const base64 = fs.readFileSync(filePath).toString('base64');
    return `url("data:${mime};base64,${base64}")`;
  });
}

function inlineImgTags(html, imgDir) {
  return html.replace(/<img\s+[^>]*src=["'](.*?)["'][^>]*>/gi, (tag, url) => {
    if (url.startsWith('data:')) return tag;
    const filePath = path.resolve(imgDir, path.basename(url));
    if (!fs.existsSync(filePath)) return tag;
    const ext = path.extname(filePath).slice(1);
    const mime = ({
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      gif: 'image/gif',
      webp: 'image/webp'
    })[ext];
    if (!mime) return tag;
    const base64 = fs.readFileSync(filePath).toString('base64');
    return tag.replace(url, `data:${mime};base64,${base64}`);
  });
}

const allMarkdownFiles = getMarkdownFiles(slidesDir);

allMarkdownFiles.forEach(inputPath => {
  // Compute the relative path from slidesDir.
  let relPath = path.relative(slidesDir, inputPath); 
  
  // Split into parts by path separator.
  const parts = relPath.split(path.sep);
  
  // Use locale if available.
  let locale = 'en';
  if (parts[0] === 'en' || parts[0] === 'fi') {
    locale = parts.shift();
  }
  
  // The filename is the last part.
  const fileName = parts.pop();
  const deckName = fileName.replace(/\.md$/, '');
  
  // Combine remaining parts with the filename (without extension) to form the deck path.
  const deckPath = parts.concat(deckName).join('/');
  
  // Output folder: static/slides/<locale>/<deckPath>
  const outputDir = path.join(outBase, locale, deckPath);
  
  console.log(`▶️  Building Reveal.js slide: ${path.relative(slidesDir, inputPath)} → ${outputDir}`);
  
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Load the template.
    let template = fs.readFileSync(templatePath, 'utf8');
    // Inject the inline CSS before the closing </head> tag.
    const imgDir = path.resolve(__dirname, 'src/decks/img');
    const inlinedCSS = inlineCSSImages(inlineCSS, imgDir);
    template = template.replace('</head>', `${inlinedCSS}\n</head>`);
    
    let mdContent = fs.readFileSync(inputPath, 'utf8');
    // Remove YAML front matter (if any) and trim extra whitespace.
    mdContent = inlineImgTags(mdContent, imgDir);

    // Replace custom phone frame syntax.
    mdContent = replacePhoneFrameSyntax(mdContent);
    mdContent = replaceScreenshotBoxSyntax(mdContent);
    // Insert the processed Markdown into your Reveal template.
    template = template.replace('{{ mdContent }}', mdContent);
    

    // Calculate relative path back to project root from the output directory
    const relativeFromRoot = path.relative(outputDir, path.resolve(__dirname));
    const depth = relativeFromRoot.split(path.sep).length;
    const backtrack = '../'.repeat(depth);


    // Rewrite all asset paths to be relative to project root from HTML output
    template = template
      .replace(/href="node_modules\//g, `href="${backtrack}node_modules/`)
      .replace(/src="node_modules\//g, `src="${backtrack}node_modules/`)
      .replace(/href="custom.css"/g, `href="${backtrack}custom.css"`);
    
      
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, template, 'utf8');
    
    console.log(`✅ Built slide deck: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to build ${inputPath}`);
    console.error(err.message);
  }
});
