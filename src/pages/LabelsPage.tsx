import { Link, useParams } from 'react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useDb } from '@/lib/store'
import { approvedRows, formatDateShort, formatSize } from '@/lib/export'
import { Button } from '@/components/ui/button'

/**
 * Печатная форма этикетажа: сетка этикеток вплотную (один рез между соседними).
 * На каждой этикетке — QR-код на страницу картины в каталоге.
 */
export default function LabelsPage() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>()
  const { db } = useDb()
  const exhibition = db.exhibitions.find((e) => e.id === exhibitionId)
  const rows = exhibition ? approvedRows(db, exhibition.id) : []

  if (!exhibition) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Выставка не найдена.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/organizer">Вернуться в кабинет организатора</Link>
        </Button>
      </div>
    )
  }

  const artworkUrl = (artworkId: string) =>
    `${window.location.origin}${window.location.pathname}#/artworks/${artworkId}`

  return (
    <div className="labels-page">
      {/* Панель управления — не печатается */}
      <div className="no-print sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/organizer">
              <ArrowLeft className="h-4 w-4" />
              К выставкам
            </Link>
          </Button>
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            Этикетаж — «{exhibition.title}» · {rows.length} шт.
          </span>
          <Button size="sm" onClick={() => window.print()} disabled={rows.length === 0}>
            <Printer className="h-4 w-4" />
            Печать
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="no-print mb-6 rounded-md border border-amber-600/30 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Нажмите «Печать» и выберите ориентацию «Книжная». Этикетки стоят вплотную — между соседними
          достаточно одного реза по пунктирной линии. QR-код ведёт на страницу картины в каталоге.
        </div>

        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            На выставке нет принятых работ — этикетки формируются только для них.
          </p>
        ) : (
          <div className="labels-grid grid grid-cols-1 gap-0 sm:grid-cols-2">
            {rows.map((r) => (
              <div
                key={r.application.id}
                className="label-card -m-px break-inside-avoid border border-dashed border-foreground/40 bg-card p-5"
              >
                {/* Блок выставки: название, даты, место + QR */}
                <div className="flex items-start justify-between gap-4 border-b border-foreground/25 pb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] leading-tight tracking-wide text-muted-foreground uppercase">
                      {exhibition.title}
                      <br />
                      {formatDateShort(exhibition.startDate)} — {formatDateShort(exhibition.endDate)}
                    </p>
                    {exhibition.location && (
                      <p className="mt-1.5 text-[10px] leading-tight tracking-wide text-muted-foreground uppercase">
                        {exhibition.location}
                      </p>
                    )}
                  </div>
                  <div className="qr-box shrink-0 bg-white p-1.5">
                    <QRCode value={artworkUrl(r.artwork.id)} size={72} />
                  </div>
                </div>

                {/* Блок картины на всю ширину */}
                <div className="pt-3">
                  <p className="text-sm font-semibold tracking-wide">{r.author?.name ?? 'Автор не указан'}</p>
                  <p className="font-display text-xl leading-snug font-semibold italic">
                    «{r.artwork.title}»
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    {r.artwork.year}. {r.artwork.technique}
                    {formatSize(r.artwork) ? `. ${formatSize(r.artwork)}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
