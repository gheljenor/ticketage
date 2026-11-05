import { Link, useParams } from 'react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { useDb } from '@/lib/store'
import { approvedRows, formatDateShort, formatSize } from '@/lib/export'
import { Button } from '@/components/ui/button'

/**
 * Итоговая таблица выставки — печатная форма.
 * Самая правая колонка — превью картины (единственное отличие от CSV-версии).
 */
export default function TablePage() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>()
  const { db } = useDb()
  const exhibition = db.exhibitions.find((e) => e.id === exhibitionId)

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

  const rows = approvedRows(db, exhibition.id)

  return (
    <div className="table-page">
      {/* Панель управления — не печатается */}
      <div className="no-print sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/organizer">
              <ArrowLeft className="h-4 w-4" />
              К выставкам
            </Link>
          </Button>
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            Итоговая таблица — «{exhibition.title}» · {rows.length} работ
          </span>
          <Button size="sm" onClick={() => window.print()} disabled={rows.length === 0}>
            <Printer className="h-4 w-4" />
            Печать
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            {exhibition.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Итоговая таблица экспозиции · {formatDateShort(exhibition.startDate)} —{' '}
            {formatDateShort(exhibition.endDate)}
            {exhibition.location ? ` · ${exhibition.location}` : ''} · принято работ: {rows.length}
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            На выставке нет принятых работ.
          </p>
        ) : (
          <table className="result-table w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-10">№</th>
                <th>Название</th>
                <th>Автор</th>
                <th className="w-14">Год</th>
                <th>Материалы и техника</th>
                <th>Размер (в × ш)</th>
                <th className="w-20">Получена</th>
                <th className="w-24">Превью</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.application.id}>
                  <td className="text-center font-display font-semibold">{r.num}</td>
                  <td className="font-medium">«{r.artwork.title}»</td>
                  <td>{r.author?.name ?? '—'}</td>
                  <td className="text-center">{r.artwork.year}</td>
                  <td>{r.artwork.technique}</td>
                  <td>{formatSize(r.artwork) || '—'}</td>
                  <td className="text-center">{r.application.received ? 'Да' : '—'}</td>
                  <td className="preview-cell">
                    {r.artwork.image ? (
                      <img src={r.artwork.image} alt={r.artwork.title} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
