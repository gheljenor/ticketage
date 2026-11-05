import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search, Images, CalendarDays, MapPin } from 'lucide-react'
import { useDb } from '@/lib/store'
import { formatDate, formatSize } from '@/lib/export'
import type { Artwork, Author } from '@/lib/types'
import ArtworkCard from '@/components/ArtworkCard'
import ExhibitionStatusBadge from '@/components/ExhibitionStatusBadge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface CatalogItem {
  artwork: Artwork
  author?: Author
  exhibitions: string[]
  num: number
}

export default function CatalogPage() {
  const { db } = useDb()
  const [query, setQuery] = useState('')
  const [exhibitionFilter, setExhibitionFilter] = useState<string>('all')
  const [selected, setSelected] = useState<CatalogItem | null>(null)

  // Каталог = работы, принятые на выставки (approved)
  const items = useMemo<CatalogItem[]>(() => {
    const byArtwork = new Map<string, string[]>()
    for (const app of db.applications) {
      if (app.status !== 'approved') continue
      const ex = db.exhibitions.find((e) => e.id === app.exhibitionId)
      if (!ex) continue
      const list = byArtwork.get(app.artworkId) ?? []
      list.push(ex.title)
      byArtwork.set(app.artworkId, list)
    }
    return db.artworks
      .filter((w) => byArtwork.has(w.id))
      .map((w, i) => ({
        artwork: w,
        author: db.authors.find((a) => a.id === w.authorId),
        exhibitions: byArtwork.get(w.id)!,
        num: i + 1,
      }))
      .sort((a, b) => b.artwork.year - a.artwork.year || a.artwork.title.localeCompare(b.artwork.title, 'ru'))
      .map((item, i) => ({ ...item, num: i + 1 }))
  }, [db])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (exhibitionFilter !== 'all' && !item.exhibitions.includes(exhibitionFilter)) return false
      if (!q) return true
      return (
        item.artwork.title.toLowerCase().includes(q) ||
        (item.author?.name.toLowerCase().includes(q) ?? false) ||
        item.artwork.technique.toLowerCase().includes(q)
      )
    })
  }, [items, query, exhibitionFilter])

  const exhibitionTitles = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => i.exhibitions.forEach((t) => set.add(t)))
    return [...set]
  }, [items])

  const activeExhibitions = db.exhibitions.filter((e) => e.status !== 'draft')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      {/* Шапка каталога */}
      <div className="mb-8 max-w-2xl md:mb-12">
        <p className="mb-2 text-xs font-medium tracking-[0.18em] text-accent uppercase">Каталог</p>
        <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-5xl">
          Картины текущих выставок
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Работы, отобранные кураторами в экспозиции. Нажмите на карточку, чтобы увидеть подробности
          и выставки, где представлена картина.
        </p>
      </div>

      {/* Действующие выставки */}
      {activeExhibitions.length > 0 && (
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {activeExhibitions.map((ex) => (
            <div
              key={ex.id}
              className="rounded-lg border border-border bg-card p-4 shadow-xs"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <ExhibitionStatusBadge status={ex.status} />
              </div>
              <h2 className="font-display text-lg font-semibold">
                <Link
                  to={`/exhibitions/${ex.id}`}
                  className="underline-offset-4 outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {ex.title}
                </Link>
              </h2>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(ex.startDate)} — {formatDate(ex.endDate)}
                </span>
                {ex.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {ex.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название, автор, техника…"
            className="pl-9"
            aria-label="Поиск по каталогу"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={exhibitionFilter === 'all'}
            onClick={() => setExhibitionFilter('all')}
            label="Все выставки"
          />
          {exhibitionTitles.map((t) => (
            <FilterChip
              key={t}
              active={exhibitionFilter === t}
              onClick={() => setExhibitionFilter(t)}
              label={t}
            />
          ))}
        </div>
      </div>

      {/* Сетка карточек */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Images className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? 'Пока ни одна работа не принята в экспозиции.'
              : 'По вашему запросу ничего не найдено.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <ArtworkCard
              key={item.artwork.id}
              artwork={item.artwork}
              author={item.author}
              num={item.num}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      )}

      {/* Карточка картины */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90dvh]">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selected.artwork.title}</DialogTitle>
                <DialogDescription>
                  {selected.author?.name ?? 'Автор не указан'} · {selected.artwork.year}
                </DialogDescription>
              </DialogHeader>
              {selected.artwork.image && (
                <img
                  src={selected.artwork.image}
                  alt={selected.artwork.title}
                  className="w-full rounded-md border border-border object-contain"
                />
              )}
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">Материалы и техника</dt>
                  <dd className="mt-0.5">{selected.artwork.technique}</dd>
                </div>
                {formatSize(selected.artwork) && (
                  <div>
                    <dt className="text-xs tracking-wide text-muted-foreground uppercase">Размер (в × ш)</dt>
                    <dd className="mt-0.5">{formatSize(selected.artwork)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">Год создания</dt>
                  <dd className="mt-0.5">{selected.artwork.year}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">Выставки</dt>
                  <dd className="mt-0.5">{selected.exhibitions.join(' · ')}</dd>
                </div>
              </dl>
              {selected.artwork.description && (
                <p className="text-sm leading-relaxed text-foreground/80">{selected.artwork.description}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
