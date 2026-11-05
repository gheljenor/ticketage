import type { Artwork, Author } from '@/lib/types'
import { formatSize } from '@/lib/export'

interface Props {
  artwork: Artwork
  author?: Author
  /** Номер в каталоге выставки */
  num?: number
  onClick?: () => void
}

export default function ArtworkCard({ artwork, author, num, onClick }: Props) {
  const inner = (
    <>
      <div className="relative overflow-hidden bg-muted">
        {artwork.image ? (
          <img
            src={artwork.image}
            alt={artwork.title}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center text-sm text-muted-foreground">
            Нет изображения
          </div>
        )}
        {typeof num === 'number' && (
          <span className="absolute top-2 left-2 rounded-sm bg-background/90 px-1.5 py-0.5 font-display text-xs font-semibold tracking-wide">
            № {num}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-display text-lg leading-snug font-semibold">{artwork.title}</h3>
        <p className="text-sm font-medium text-foreground/80">{author?.name ?? 'Автор не указан'}</p>
        <p className="text-sm text-muted-foreground">
          {artwork.technique}
          {formatSize(artwork) ? ` · ${formatSize(artwork)}` : ''} · {artwork.year}
        </p>
      </div>
    </>
  )

  const cls =
    'group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-xs transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring outline-none'

  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  ) : (
    <article className={cls}>{inner}</article>
  )
}
