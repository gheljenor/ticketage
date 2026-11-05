import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useDb } from '@/lib/store'
import { formatSize } from '@/lib/export'
import { Button } from '@/components/ui/button'

/**
 * Публичная страница картины — сюда ведут QR-коды с этикеток
 * и ссылки из кабинетов.
 */
export default function ArtworkPage() {
  const { artworkId } = useParams<{ artworkId: string }>()
  const { db } = useDb()
  const artwork = db.artworks.find((w) => w.id === artworkId)

  if (!artwork) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Картина не найдена.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Вернуться в каталог</Link>
        </Button>
      </div>
    )
  }

  const author = db.authors.find((a) => a.id === artwork.authorId)
  const exhibitions = db.applications
    .filter((a) => a.artworkId === artwork.id && a.status === 'approved')
    .map((a) => db.exhibitions.find((e) => e.id === a.exhibitionId))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  const size = formatSize(artwork)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          К каталогу
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          {artwork.image ? (
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full rounded-lg border border-border object-contain shadow-xs"
            />
          ) : (
            <div className="flex aspect-[4/5] w-full items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
              Нет изображения
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-accent uppercase">
            {author?.name ?? 'Автор не указан'}
          </p>
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            «{artwork.title}»
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {artwork.year}. {artwork.technique}
            {size ? `. ${size}` : ''}
          </p>

          {artwork.description && (
            <p className="mt-6 max-w-prose text-base leading-relaxed text-foreground/80">
              {artwork.description}
            </p>
          )}

          {author?.bio && (
            <div className="mt-8 rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Об авторе
              </h2>
              <p className="text-sm font-medium">{author.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/75">{author.bio}</p>
            </div>
          )}

          {exhibitions.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Выставки
              </h2>
              <ul className="grid gap-1.5">
                {exhibitions.map((ex) => (
                  <li key={ex.id}>
                    <Link
                      to={`/exhibitions/${ex.id}`}
                      className="text-sm font-medium text-accent underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {ex.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
