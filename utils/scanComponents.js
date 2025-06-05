const globby = require('globby').globby;
const fs = require('fs-extra');
const path = require('path');
const reactDocgen = require('react-docgen');
const crypto = require('crypto');
const { chromium } = require('playwright');

function hashComponent(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

function guessType(name = '') {
  const key = name.toLowerCase();
  if (key.includes('button')) return 'Button';
  if (key.includes('input') || key.includes('field')) return 'Input';
  if (key.includes('card')) return 'Card';
  if (key.includes('modal')) return 'Modal';
  return 'Other';
}

async function renderScreenshot(componentName, id) {
  console.log(`Rendering screenshot for component: ${componentName}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const html = `<html><body><${componentName}>Example</${componentName}></body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  const screenshotPath = `/tmp/${id}.png`;
  await page.screenshot({ path: screenshotPath });
  await browser.close();
  const data = await fs.readFile(screenshotPath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

async function scanComponents(rootDir) {
  console.log("📂 Scanning root directory:", rootDir);
  const files = await globby(['**/*.{js,jsx,ts,tsx}'], { cwd: rootDir, absolute: true });
  console.log(`🔍 Found ${files.length} potential component files`);

  const components = [];
  const seenHashes = new Map();

  for (const file of files) {
    try {
      const code = await fs.readFile(file, 'utf8');
      console.log(`📄 Reading and parsing: ${file}`);

      const parsed = reactDocgen.parse(code);
      console.log(`✅ Parsed component: ${parsed.displayName || path.basename(file)}`);

      const hash = hashComponent(JSON.stringify(parsed.props || {}));
      const componentName = parsed.displayName || path.basename(file);
      const screenshot = await renderScreenshot(componentName, hash);

      const component = {
        name: componentName,
        type: guessType(componentName),
        path: file.replace(rootDir, ''),
        props: Object.keys(parsed.props || {}),
        isDuplicate: seenHashes.has(hash),
        screenshot
      };

      seenHashes.set(hash, true);
      components.push(component);
    } catch (err) {
      console.log(`❌ Failed to parse ${file}: ${err.message}`);
    }
  }

  console.log(`✅ Finished scanning. Total components found: ${components.length}`);
  return components;
}

module.exports = { scanComponents };
