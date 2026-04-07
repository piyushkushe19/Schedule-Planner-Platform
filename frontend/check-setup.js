#!/usr/bin/env node
/**
 * Schedulr Frontend Setup Checker
 * Run with: node check-setup.js
 */
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;

function check(label, test) {
  try {
    const result = test();
    if (result === false) throw new Error('returned false');
    console.log(`  ✅ ${label}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${label}: ${e.message}`);
    failed++;
  }
}

console.log('\n🔍 Schedulr Frontend Setup Check\n');

console.log('📦 Config files:');
check('package.json valid', () => JSON.parse(fs.readFileSync('package.json', 'utf8')));
check('vite.config.js exists', () => fs.existsSync('vite.config.js'));
check('tailwind.config.js is CJS', () => {
  const c = fs.readFileSync('tailwind.config.js', 'utf8');
  if (c.includes('export default') && !c.includes('module.exports')) throw new Error('Using ESM export, needs module.exports');
});
check('postcss.config.js is CJS', () => {
  const c = fs.readFileSync('postcss.config.js', 'utf8');
  if (c.includes('export default') && !c.includes('module.exports')) throw new Error('Using ESM export, needs module.exports');
});
check('postcss.config.js loadable', () => require('./postcss.config.js'));
check('tailwind.config.js loadable', () => require('./tailwind.config.js'));

console.log('\n📁 Source files:');
const required = [
  'src/main.jsx', 'src/App.jsx', 'src/index.css',
  'src/hooks/useAuth.jsx',
  'src/services/api.js', 'src/services/bookingService.js',
  'src/utils/timezone.js', 'src/utils/helpers.js',
  'src/components/common/Spinner.jsx',
  'src/components/common/Alert.jsx',
  'src/components/common/ProtectedRoute.jsx',
  'src/components/layout/DashboardLayout.jsx',
  'src/pages/LandingPage.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/RegisterPage.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/AvailabilityPage.jsx',
  'src/pages/BookingsPage.jsx',
  'src/pages/ProfilePage.jsx',
  'src/pages/BookingPage.jsx',
  'src/pages/BookingConfirmPage.jsx',
];
required.forEach(f => check(f, () => fs.existsSync(f)));

console.log('\n🚫 Banned imports:');
function srcFiles() {
  function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d =>
      d.isDirectory() ? walk(path.join(dir, d.name)) :
      (d.name.endsWith('.jsx') || d.name.endsWith('.js')) ? [path.join(dir, d.name)] : []
    );
  }
  return walk('src');
}
check("No date-fns imports", () => {
  const found = srcFiles().filter(f => /from ['"]date-fns/.test(fs.readFileSync(f,'utf8')));
  if (found.length) throw new Error(found.map(f=>path.relative('.',f)).join(', '));
});
check("No date-fns-tz imports", () => {
  const found = srcFiles().filter(f => /date-fns-tz/.test(fs.readFileSync(f,'utf8')));
  if (found.length) throw new Error(found.map(f=>path.relative('.',f)).join(', '));
});
check("No HTML entities in JSX", () => {
  const found = srcFiles().filter(f => /&amp;|&lt;|&gt;/.test(fs.readFileSync(f,'utf8')));
  if (found.length) throw new Error(found.map(f=>path.relative('.',f)).join(', '));
});

console.log('\n📦 Dependencies:');
check('node_modules installed', () => {
  if (!fs.existsSync('node_modules/react')) throw new Error('Run: npm install');
});
check('react available', () => require('node_modules/react/package.json').version);
check('react-dom available', () => require('node_modules/react-dom/package.json').version);
check('react-router-dom available', () => require('node_modules/react-router-dom/package.json').version);
check('axios available', () => require('node_modules/axios/package.json').version);
check('vite available', () => require('node_modules/vite/package.json').version);
check('tailwindcss available', () => require('node_modules/tailwindcss/package.json').version);

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('\n🎉 All checks passed! Run: npm run dev\n');
} else {
  console.log('\n⚠️  Fix the issues above then run: npm run dev\n');
}
