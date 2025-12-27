/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Patch size-sensor@1.0.2 to guard ResizeObserver.disconnect
// Fixes: TypeError: Cannot read properties of undefined (reading 'disconnect')

const projectRoot = path.resolve(__dirname, '..');
const targetFile = path.join(
  projectRoot,
  'node_modules',
  'size-sensor',
  'dist',
  'size-sensor.min.js'
);

function fail(message) {
  console.error(`[patch-size-sensor] ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`[patch-size-sensor] ${message}`);
}

try {
  if (!fs.existsSync(targetFile)) {
    fail(`Target not found: ${targetFile}`);
    return;
  }

  const original = fs.readFileSync(targetFile, 'utf8');

  // Already patched?
  if (original.includes('i&&i.disconnect&&i.disconnect')) {
    ok('Already patched.');
    return;
  }

  // Patch the ResizeObserver destroy() implementation.
  // Original snippet: function t(){i.disconnect(),o=[],i=void 0,...}
  // We replace only the disconnect call portion.
  const from = 'function t(){i.disconnect(),';
  const to = 'function t(){try{i&&i.disconnect&&i.disconnect()}catch(e){},';

  if (!original.includes(from)) {
    fail('Unexpected file format; patch marker not found.');
    return;
  }

  const patched = original.replace(from, to);
  fs.writeFileSync(targetFile, patched, 'utf8');
  ok('Patched successfully.');
} catch (err) {
  fail(err && err.message ? err.message : String(err));
}
