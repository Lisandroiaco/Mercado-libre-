// Builds the app with an in-memory router and inlines JS + CSS into one HTML file (demo/mercadito.html).
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

execSync(`npx vite build --outDir dist-single --base ./ ${process.env.NOMIN ? '--minify false' : ''}`, {
  stdio: 'inherit',
  env: { ...process.env, VITE_ROUTER: 'memory' },
})
const assets = readdirSync('dist-single/assets')
const js = readFileSync(`dist-single/assets/${assets.find((f) => f.endsWith('.js'))}`, 'utf8').replaceAll('</script', '<\\/script')
const css = readFileSync(`dist-single/assets/${assets.find((f) => f.endsWith('.css'))}`, 'utf8')
const favicon = Buffer.from(readFileSync('public/favicon.svg')).toString('base64')

const html = `<title>Mercadito</title>
<meta name="description" content="Marketplace demo hecho con React, TypeScript y Tailwind.">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
mkdirSync('demo', { recursive: true })
writeFileSync('demo/mercadito.html', html)
console.log(`demo/mercadito.html: ${(html.length / 1024).toFixed(0)} KB`)
