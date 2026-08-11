import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ********************************** Content Security Policy **********************************
// GitHub Pages cannot set response headers, so the policy ships as a meta tag.
// Two directives behave differently in meta form and are documented in SECURITY.md:
// frame-ancestors and report-uri are ignored entirely.
//
// style-src-attr is split out from style-src deliberately. react-confetti sets an
// inline style attribute on its canvas, and the health meter sets its own width,
// so style attributes have to be allowed. Splitting the directive means inline
// <style> elements stay blocked, which a blanket style-src 'unsafe-inline' would
// have permitted.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://alcoser-cursor-bucket.s3.us-east-2.amazonaws.com",
  "media-src 'self' https://alcoser-sound-bucket.s3.us-east-2.amazonaws.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests'
].join('; ');

// Applied to the build only. The dev server injects its own stylesheets and HMR
// client, which this policy would block.
const csp = () => ({
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml() {
    return [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend'
      }
    ];
  }
});

// ********************************** Vite Config **********************************
// base matches the GitHub Pages project path. If the repository is renamed, this
// and the homepage field in package.json both have to change or the deployed
// bundle will request its assets from the wrong path.
export default defineConfig({
  base: '/text-rpg/',
  plugins: [react(), csp()],
  build: {
    outDir: 'build',
    sourcemap: false
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
    restoreMocks: true
  }
});
