import type { Application, Artwork, Author, Db, Exhibition } from './types'

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** «60 × 80 см» — высота × ширина; пусто, если размер не задан */
export function formatSize(artwork: { height?: number; width?: number }): string {
  if (artwork.height && artwork.width) return `${artwork.height} × ${artwork.width} см`
  if (artwork.height) return `${artwork.height} см (высота)`
  if (artwork.width) return `${artwork.width} см (ширина)`
  return ''
}

export interface ApprovedRow {
  num: number
  artwork: Artwork
  author: Author | undefined
  application: Application
}

/** Принятые работы выставки в порядке заявки */
export function approvedRows(db: Db, exhibitionId: string): ApprovedRow[] {
  return db.applications
    .filter((a) => a.exhibitionId === exhibitionId && a.status === 'approved')
    .sort((a, b) => a.submittedAt - b.submittedAt)
    .map((application, i) => ({
      num: i + 1,
      artwork: db.artworks.find((w) => w.id === application.artworkId)!,
      author: db.authors.find((a) => a.id === db.artworks.find((w) => w.id === application.artworkId)?.authorId),
      application,
    }))
    .filter((r) => Boolean(r.artwork))
}

function csvEscape(v: string | number | undefined): string {
  const s = String(v ?? '')
  return `"${s.replace(/"/g, '""')}"`
}

/** Итоговая таблица выставки в CSV (разделитель «;», BOM — корректно открывается в Excel) */
export function exportExhibitionCsv(db: Db, exhibition: Exhibition) {
  const rows = approvedRows(db, exhibition.id)
  const header = ['№', 'Название', 'Автор', 'Год', 'Материалы и техника', 'Размер (в × ш), см', 'Описание', 'Получена', 'E-mail автора']
  const lines = [
    header.map(csvEscape).join(';'),
    ...rows.map((r) =>
      [
        r.num,
        r.artwork.title,
        r.author?.name ?? '—',
        r.artwork.year,
        r.artwork.technique,
        formatSize(r.artwork),
        r.artwork.description ?? '',
        r.application.received ? 'Да' : 'Нет',
        r.author?.email ?? '',
      ]
        .map(csvEscape)
        .join(';'),
    ),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(exhibition.title)}-итоговая-таблица.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
