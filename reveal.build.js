const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Directory containing your slide markdown files
const slidesDir = path.resolve(__dirname, 'slides')
// Output directory for built slides (will be served as static assets)
const outBase = path.resolve(__dirname, 'static/slides')

// Ensure the output base directory exists
if (!fs.existsSync(outBase)) {
  fs.mkdirSync(outBase, { recursive: true })
}

// Get all Markdown files in slides/
const slideFiles = fs.readdirSync(slidesDir)
  .filter(f => f.endsWith('.md'))

slideFiles.forEach(file => {
  const name = file.replace(/\.md$/, '')
  const inputPath = path.join(slidesDir, file)
  // We'll output to a folder named after the slide file inside static/slides
  const outputDir = path.join(outBase, name)

  console.log(`▶️  Building Reveal.js slide: ${file} → ${outputDir}`)

  try {
    // The --static flag tells reveal-md to build a static version.
    // Reveal-md will create a folder (if not existing) with an index.html inside.
    execSync(`npx reveal-md "${inputPath}" --static "${outputDir}"`, { stdio: 'inherit' })
  } catch (err) {
    console.error(`❌ Failed to build ${file}`)
    console.error(err.message)
  }
})
