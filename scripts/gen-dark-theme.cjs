// Genera src/styles/theme-dark.css a partir de la paleta por defecto de Tailwind 4.
// Mismo enfoque que scripts/gen-dark-theme.cjs del Admin: .dark redefine la paleta
// y traduce los hex de marca usados como clases arbitrarias (bg-[#fdf2f7], …).
// Uso: node scripts/gen-dark-theme.cjs  (volver a correr si se agregan colores hex nuevos)
const fs = require('fs')
const theme = fs.readFileSync('node_modules/tailwindcss/theme.css', 'utf8')
const defaults = {}
for (const m of theme.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)) {
  (defaults[m[1]] ||= {})[m[2]] = m[3].trim()
}

const NEUTRALS = ['gray', 'slate', 'zinc', 'neutral', 'stone']
const CHROMATIC = Object.keys(defaults).filter(h => !NEUTRALS.includes(h))
const STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

// Grises oscuros con un toque cálido (familia guinda). En el portal gray-100 es el
// fondo de página y gray-50 el sub-panel dentro de tarjetas blancas.
const DARK_NEUTRAL = { 50: '#241c20', 100: '#141012', 200: '#31272c', 300: '#43383e', 400: '#6e6168', 500: '#968990', 600: '#b4a8ae', 700: '#cfc4c9', 800: '#e6dde1', 900: '#f4eef1', 950: '#faf7f8' }
const BASE = '#1c1619'

let dark = ''
let light = ''
for (const hue of [...NEUTRALS, ...CHROMATIC]) {
  const d = defaults[hue]; if (!d) continue
  for (const st of STOPS) {
    if (!d[st]) continue
    light += `  --color-${hue}-${st}: ${d[st]};\n`
    let v
    if (NEUTRALS.includes(hue)) v = DARK_NEUTRAL[st]
    else if (st === '50') v = `color-mix(in oklab, ${d['500']} 14%, ${BASE})`
    else if (st === '100') v = `color-mix(in oklab, ${d['500']} 22%, ${BASE})`
    else if (st === '200') v = `color-mix(in oklab, ${d['500']} 34%, ${BASE})`
    else if (st === '300') v = `color-mix(in oklab, ${d['500']} 55%, ${BASE})`
    else if (st === '700') v = d['300']
    else if (st === '800') v = d['200']
    else if (st === '900') v = d['100']
    else if (st === '950') v = d['50']
    else v = d[st] // 400/500/600 se mantienen
    dark += `  --color-${hue}-${st}: ${v};\n`
  }
}

const esc = (c) => c.replace(/([\[\]#/:.])/g, '\\$1')
const PSEUDO = { 'hover:': ':hover', 'focus:': ':focus', 'active:': ':active', 'focus-within:': ':focus-within' }
const map = (cls, decl, variants = ['']) => variants.map(v =>
  `  .dark .${esc(v + cls)}${PSEUDO[v] || ''} { ${decl} }`
).join('\n')

const LIGHT_PINKS = ['#fdf2f7', '#f9e8f0', '#fff0f5', '#faf7f4', '#ffcfe0', '#f3d4e2']
const WINE_TEXT = ['#551735', '#6b2145', '#7e2d55', '#8b3a62', '#9e4a72', '#a05c7e', '#c07a9a']
const WINE_FILL = ['#551735', '#6b2145', '#7e2d55']
const PINK_LINES = ['#e8b4cc', '#f9e8f0', '#f3d4e2', '#ffcfe0', '#c07a9a', '#9e4a72', '#6b2145', '#7e2d55']

const overrides = [
  map('bg-white', 'background-color: var(--sd-surface);', ['', 'hover:']),
  ...['90', '70'].map(o => map(`bg-white/${o}`, `background-color: color-mix(in oklab, var(--sd-surface) ${o}%, transparent);`)),
  ...[...LIGHT_PINKS, '#e8b4cc'].map(h => map(`bg-[${h}]`, 'background-color: var(--sd-brand-soft);', ['', 'hover:', 'active:'])),
  ...['50', '30'].map(o => map(`bg-[#fdf2f7]/${o}`, `background-color: color-mix(in oklab, var(--sd-brand-soft) ${o}%, transparent);`, ['hover:'])),
  ...WINE_TEXT.map(h => map(`text-[${h}]`, 'color: var(--sd-brand-ink);', ['', 'hover:'])),
  ...WINE_FILL.map(h => map(`bg-[${h}]`, 'background-color: var(--sd-brand);', ['', 'hover:', 'active:'])),
  ...PINK_LINES.map(h => map(`border-[${h}]`, 'border-color: var(--sd-line-strong);', ['', 'hover:', 'focus:'])),
  ...['#e8b4cc', '#9e4a72', '#7e2d55'].map(h => map(`ring-[${h}]`, '--tw-ring-color: var(--sd-brand-soft);', ['', 'focus:'])),
  ...['#fdf2f7', '#e8b4cc'].map(h => map(`from-[${h}]`, '--tw-gradient-from: var(--sd-brand-soft);')),
  ...['#fff0f5', '#ffcfe0'].map(h => map(`to-[${h}]`, '--tw-gradient-to: var(--sd-brand-soft);')),
].join('\n')

const css = `/* ═══════════════════════════════════════════════════════════════════════════
   Modo oscuro — GENERADO por scripts/gen-dark-theme.cjs (no editar a mano).
   Se activa con la clase .dark en <html> según la preferencia del teléfono.
   ═══════════════════════════════════════════════════════════════════════════ */

:root.dark {
  color-scheme: dark;
  --sd-paper: #141012;
  --sd-surface: #1c1619;
  --sd-brand: #8a2c5a;
  --sd-brand-soft: #3a1e2b;
  --sd-brand-ink: #f0b3cd;
  --sd-line-strong: #43383e;
${dark}}

/* Bloques que se mantienen claros aunque el teléfono esté en modo oscuro
   (tarjeta de login con estilos de marca fijos) */
:root.dark .force-light {
  color-scheme: light;
  color: #2a1a21;
  --sd-surface: #ffffff;
  --sd-brand: #551735;
  --sd-brand-soft: #fdf2f7;
  --sd-brand-ink: #551735;
  --sd-line-strong: #e8b4cc;
${light}}

@layer utilities {
${overrides}
}
`
fs.mkdirSync('src/styles', { recursive: true })
fs.writeFileSync('src/styles/theme-dark.css', css)
console.log('ok', CHROMATIC.length, 'hues', css.length, 'bytes')
