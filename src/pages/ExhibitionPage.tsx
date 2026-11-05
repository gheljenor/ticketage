import { Link, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, ClipboardList, Inbox, MapPin, Send } from 'lucide-react'
import { useDb } from '@/lib/store'
import { approvedRows, formatDate } from '@/lib/export'
import ExhibitionStatusBadge from '@/components/ExhibitionStatusBadge'
import ArtworkCard from '@/components/ArtworkCard'
import { Button } from '@/components/ui/button'

/**
 * Публичная страница выставки: описание, требования к картинам,
 * место и даты проведения, сроки приёма заявок, принятые работы.
 */
export default function ExhibitionPage() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>()
  const { db } = useDb()
  const exhibition = db.exhibitions.find((e) => e.id === exhibitionId)

  if (!exhibition) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Выставка не найдена.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Вернуться в каталог</Link>
        </Button>
      </div>
    )
  }

  const rows = approvedRows(db, exhibition.id)
  const accepting = exhibition.status === 'open'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          К каталогу
        </Link>
      </Button>

      <div className="mb-8 max-w-3xl">
        <div className="mb-3">
          <ExhibitionStatusBadge status={exhibition.status} />
        </div>
        <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-5xl">
          {exhibition.title}
        </h1>
        {exhibition.description && (
          <p className="mt-4 text-base leading-relaxed text-foreground/80">{exhibition.description}</p>
        )}
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {/* Даты и место */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <h2 className="mb-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Место и даты
          </h2>
          <dl className="grid gap-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <dt className="text-xs text-muted-foreground">Проведение</dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <dt className="text-xs text-muted-foreground">Приём заявок</dt>
                <dd className="mt-0.5 text-sm font-medium">до {formatDate(exhibition.deadline)}</dd>
              </div>
            </div>
            {exhibition.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <dt className="text-xs text-muted-foreground">Площадка</dt>
                  <dd className="mt-0.5 text-sm font-medium">{exhibition.location}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        {/* Требования к картинам */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <ClipboardList className="h-4 w-4" />
            Требования к картинам
          </h2>
          {exhibition.requirements ? (
            <p className="text-sm leading-relaxed text-foreground/80">{exhibition.requirements}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Организаторы не указали особых требований. Общие правила: готовая к показу работа,
              оформление и крепление — на авторе.
            </p>
          )}
          {accepting && (
            <div className="mt-5 border-t border-border pt-4">
              <Button asChild>
                <Link to="/author">
                  <Send className="h-4 w-4" />
                  Заявить картины из кабинета автора
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Принятые работы */}
      <div>
        <h2 className="mb-4 font-display text-2xl font-semibold">
          Принятые работы
          <span className="ml-2 text-base font-normal text-muted-foreground">({rows.length})</span>
        </h2>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Экспозиция ещё формируется — кураторы не приняли ни одной работы.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((r) => (
              <ArtworkCard key={r.artwork.id} artwork={r.artwork} author={r.author} num={r.num} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
