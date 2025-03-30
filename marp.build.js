// marp.build.js

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const slidesDir = path.resolve(__dirname, 'slides')
const outBase = path.resolve(__dirname, 'static/slides')
const snippetPath = path.join(slidesDir, 'global-swipe-snippet.md')

// Make a .tmp folder for combined MD, outside "slides"
const tmpDir = path.resolve(__dirname, '.tmp')
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

const slideFiles = fs
  .readdirSync(slidesDir)
  .filter(f => f.endsWith('.md') && f !== 'global-swipe-snippet.md')

for (const file of slideFiles) {
  const name = file.replace(/\.md$/, '')
  const inputPath = path.join(slidesDir, file)
  const outPath = path.join(outBase, `${name}.html`)

  console.log(`▶️  Building Marp slide: ${file} → ${outPath}`)

  try {
    const mainContent = fs.readFileSync(inputPath, 'utf-8')
    const snippetContent = fs.readFileSync(snippetPath, 'utf-8')

    // Combine contents
    const combinedContent = `${mainContent}\n\n${snippetContent}`

    // Use a temp file in .tmp folder, so Nodemon won't see it
    const tmpFile = path.join(tmpDir, `${name}-combined.md`)
    fs.writeFileSync(tmpFile, combinedContent, 'utf-8')

    // Run Marp on the temp file
    execSync(
      `npx marp "${tmpFile}" --html --allow-local-files --no-stdin -o "${outPath}"`,
      { stdio: 'inherit' }
    )

    // Optionally remove tmpFile if you don’t need it afterward
    // fs.unlinkSync(tmpFile)

  } catch (err) {
    console.error(`❌ Failed to build ${file}`)
    console.error(err.message)
  }
}
