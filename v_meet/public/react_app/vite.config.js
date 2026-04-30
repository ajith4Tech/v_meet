import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Plugin: after every build, copy dist/index.html → ../../../www/v_meet_app.html
// and inject the Frappe CSRF token script tag so the template works correctly.
function syncFrappeHtml() {
  return {
    name: 'sync-frappe-html',
    closeBundle() {
      const distHtml = resolve(__dirname, 'dist/index.html')
      const wwwHtml  = resolve(__dirname, '../../www/v_meet_app.html')

      let html = readFileSync(distHtml, 'utf-8')

      // Remove any pre-existing csrf_token script blocks (from a previous sync)
      html = html.replace(/<script>\s*window\.csrf_token\s*=\s*[^<]+<\/script>\s*/g, '')

      // Inject CSRF token script before the first <script> tag
      const csrfScript = `<script>\n      window.csrf_token = "{{ frappe.session.csrf_token }}";\n    </script>\n    `
      html = html.replace('<script type="module"', csrfScript + '<script type="module"')

      // Also inject Google Fonts / Material Symbols if not already present
      if (!html.includes('fonts.googleapis.com')) {
        const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>\n    `
        html = html.replace('</head>', fonts + '</head>')
      }

      writeFileSync(wwwHtml, html, 'utf-8')
      console.log('✅ Synced dist/index.html → www/v_meet_app.html')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), syncFrappeHtml()],
  base: '/assets/v_meet/react_app/dist/',
  build: {
    outDir: 'dist',
  }
})
