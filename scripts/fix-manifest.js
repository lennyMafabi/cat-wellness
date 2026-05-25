// Post-build script to fix Next.js 14.2.0 route group manifest issue
// Vercel's build system looks for manifests in (site) folder but Next.js generates them at root
// This script copies the root manifest to the location Vercel expects

const fs = require('fs');
const path = require('path');

const rootManifest = path.join(process.cwd(), '.next', 'server', 'app', 'page_client-reference-manifest.js');
const siteDir = path.join(process.cwd(), '.next', 'server', 'app', '(site)');
const siteManifest = path.join(siteDir, 'page_client-reference-manifest.js');

try {
  // Check if root manifest exists
  if (fs.existsSync(rootManifest)) {
    // Ensure (site) directory exists
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }
    
    // Copy the manifest to the (site) directory
    fs.copyFileSync(rootManifest, siteManifest);
    console.log('✓ Fixed manifest for (site) route group');
  }
} catch (error) {
  console.warn('Warning: Could not fix manifest file:', error.message);
  // Don't fail the build if this script fails - it's just a workaround
  process.exit(0);
}
