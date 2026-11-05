// Генератор абстрактных SVG-превью для демонстрационных картин.
// Каждая «картина» — детерминированная композиция из своего seed.

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PALETTES: string[][] = [
  ['#2b3a42', '#8a9a5b', '#d9c7a2', '#b3502e', '#efe7d8'],
  ['#1e2a38', '#4f6d7a', '#c0b283', '#d4a373', '#f4f1ea'],
  ['#3d2c2e', '#7f5539', '#b08968', '#ddb892', '#ede0d4'],
  ['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4'],
  ['#283618', '#606c38', '#dda15e', '#bc6c25', '#fefae0'],
  ['#0d3b66', '#faf0ca', '#f4d35e', '#ee964b', '#f95738'],
  ['#403d39', '#8e806a', '#ccc5b9', '#eb5e28', '#fffcf2'],
  ['#335c67', '#fff3b0', '#e09f3e', '#9e2a2b', '#540b0e'],
]

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function artworkImage(seedKey: string, w = 640, h = 800): string {
  const rnd = mulberry32(hashStr(seedKey))
  const palette = PALETTES[Math.floor(rnd() * PALETTES.length)]
  const bg = palette[palette.length - 1]
  const ink = palette[0]
  const shapes: string[] = []

  const kind = Math.floor(rnd() * 4)
  const n = 5 + Math.floor(rnd() * 5)

  if (kind === 0) {
    // круги и дуги
    for (let i = 0; i < n; i++) {
      const cx = rnd() * w
      const cy = rnd() * h
      const r = 30 + rnd() * (w / 3)
      const c = palette[Math.floor(rnd() * (palette.length - 1))]
      const op = 0.35 + rnd() * 0.6
      if (rnd() > 0.4) {
        shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${c}" opacity="${op.toFixed(2)}"/>`)
      } else {
        shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${c}" stroke-width="${(4 + rnd() * 14).toFixed(0)}" opacity="${op.toFixed(2)}"/>`)
      }
    }
  } else if (kind === 1) {
    // горизонтальные мазки
    let y = 0
    while (y < h) {
      const sh = 20 + rnd() * 120
      const c = palette[Math.floor(rnd() * palette.length)]
      shapes.push(`<rect x="0" y="${y.toFixed(0)}" width="${w}" height="${sh.toFixed(0)}" fill="${c}" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`)
      y += sh + rnd() * 30
    }
    const cx = w * (0.3 + rnd() * 0.4)
    const cy = h * (0.25 + rnd() * 0.4)
    shapes.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(40 + rnd() * 70).toFixed(0)}" fill="${ink}" opacity="0.85"/>`)
  } else if (kind === 2) {
    // диагональные полосы
    for (let i = 0; i < n + 3; i++) {
      const c = palette[Math.floor(rnd() * palette.length)]
      const x = rnd() * w
      const wd = 20 + rnd() * 90
      const op = 0.4 + rnd() * 0.6
      shapes.push(`<rect x="${x.toFixed(0)}" y="${(-h * 0.3).toFixed(0)}" width="${wd.toFixed(0)}" height="${(h * 1.8).toFixed(0)}" fill="${c}" opacity="${op.toFixed(2)}" transform="rotate(${(12 + rnd() * 24).toFixed(0)} ${w / 2} ${h / 2})"/>`)
    }
  } else {
    // треугольники и линии
    for (let i = 0; i < n + 2; i++) {
      const c = palette[Math.floor(rnd() * palette.length)]
      const x1 = rnd() * w, y1 = rnd() * h
      const x2 = rnd() * w, y2 = rnd() * h
      const x3 = rnd() * w, y3 = rnd() * h
      if (rnd() > 0.35) {
        shapes.push(`<polygon points="${x1.toFixed(0)},${y1.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)} ${x3.toFixed(0)},${y3.toFixed(0)}" fill="${c}" opacity="${(0.35 + rnd() * 0.55).toFixed(2)}"/>`)
      } else {
        shapes.push(`<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="${c}" stroke-width="${(3 + rnd() * 10).toFixed(0)}" opacity="0.8"/>`)
      }
    }
  }

  // лёгкая зернистость
  const grain: string[] = []
  for (let i = 0; i < 40; i++) {
    grain.push(`<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}" fill="${ink}" opacity="${(0.05 + rnd() * 0.1).toFixed(2)}"/>`)
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="${w}" height="${h}" fill="${bg}"/>` +
    shapes.join('') + grain.join('') +
    `<rect width="${w}" height="${h}" fill="none" stroke="${ink}" stroke-opacity="0.25" stroke-width="2"/>` +
    `</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
