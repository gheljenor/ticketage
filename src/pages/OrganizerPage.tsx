import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  CalendarDays,
  Check,
  Download,
  FileSpreadsheet,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { uid, useDb } from '@/lib/store'
import { approvedRows, exportExhibitionCsv, formatDate, formatSize } from '@/lib/export'
import {
  type Application,
  type Exhibition,
  type ExhibitionStatus,
} from '@/lib/types'
import { StatusBadge } from '@/pages/AuthorPage'
import ExhibitionStatusBadge from '@/components/ExhibitionStatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

export default function OrganizerPage() {
  const { db, update } = useDb()
  const [createOpen, setCreateOpen] = useState(false)
  const [editEx, setEditEx] = useState<Exhibition | null>(null)
  const [deleteEx, setDeleteEx] = useState<Exhibition | null>(null)
  const [moderationExId, setModerationExId] = useState<string>(db.exhibitions[0]?.id ?? '')
  const [exportExId, setExportExId] = useState<string>(db.exhibitions[0]?.id ?? '')
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  const exhibitions = useMemo(
    () => [...db.exhibitions].sort((a, b) => b.createdAt - a.createdAt),
    [db.exhibitions],
  )

  const moderationEx = db.exhibitions.find((e) => e.id === moderationExId)
  const exportEx = db.exhibitions.find((e) => e.id === exportExId)

  const exApplications = (exId: string) =>
    db.applications
      .filter((a) => a.exhibitionId === exId)
      .sort((a, b) => a.submittedAt - b.submittedAt)

  const setStatus = (exId: string, status: ExhibitionStatus) =>
    update((d) => {
      const ex = d.exhibitions.find((e) => e.id === exId)
      if (ex) ex.status = status
    })

  const approve = (appId: string) =>
    update((d) => {
      const a = d.applications.find((x) => x.id === appId)
      if (a) {
        a.status = 'approved'
        a.comment = undefined
      }
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.18em] text-accent uppercase">Организаторам</p>
        <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
          Кабинет организатора
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Создавайте выставки, модерируйте заявки авторов, формируйте итоговую таблицу экспозиции
          и этикетаж для печати.
        </p>
      </div>

      <Tabs defaultValue="exhibitions">
        <TabsList className="mb-6">
          <TabsTrigger value="exhibitions">Выставки ({exhibitions.length})</TabsTrigger>
          <TabsTrigger value="moderation">Модерация</TabsTrigger>
          <TabsTrigger value="export">Экспорт и этикетаж</TabsTrigger>
        </TabsList>

        {/* ВЫСТАВКИ */}
        <TabsContent value="exhibitions">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Статус «Приём заявок» открывает выставку для авторов.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Новая выставка
            </Button>
          </div>
          {exhibitions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              Выставок пока нет. Создайте первую.
            </div>
          ) : (
            <div className="grid gap-4">
              {exhibitions.map((ex) => {
                const apps = exApplications(ex.id)
                const pending = apps.filter((a) => a.status === 'pending').length
                const approved = apps.filter((a) => a.status === 'approved').length
                return (
                  <div
                    key={ex.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-xs md:flex-row md:items-start"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl font-semibold">{ex.title}</h3>
                        <ExhibitionStatusBadge status={ex.status} />
                      </div>
                      {ex.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ex.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                        <span>Дедлайн заявок: {formatDate(ex.deadline)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                          На рассмотрении: {pending}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                          Принято: {approved}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                          Всего заявок: {apps.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 md:w-44">
                      <Select value={ex.status} onValueChange={(v) => setStatus(ex.id, v as ExhibitionStatus)}>
                        <SelectTrigger aria-label="Статус выставки">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Черновик</SelectItem>
                          <SelectItem value="open">Приём заявок</SelectItem>
                          <SelectItem value="closed">Приём завершён</SelectItem>
                          <SelectItem value="running">Открыта</SelectItem>
                          <SelectItem value="finished">Закрыта</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setEditEx(ex)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Изменить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteEx(ex)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* МОДЕРАЦИЯ */}
        <TabsContent value="moderation">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-96">
              <Label htmlFor="mod-ex" className="mb-1.5 block text-xs text-muted-foreground">
                Выставка
              </Label>
              <Select value={moderationExId} onValueChange={setModerationExId}>
                <SelectTrigger id="mod-ex">
                  <SelectValue placeholder="Выберите выставку" />
                </SelectTrigger>
                <SelectContent>
                  {exhibitions.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!moderationEx ? (
            <EmptyNote text="Сначала создайте выставку во вкладке «Выставки»." />
          ) : exApplications(moderationEx.id).length === 0 ? (
            <EmptyNote text="На эту выставку пока не поступило заявок." />
          ) : (
            <div className="grid gap-3">
              {exApplications(moderationEx.id).map((a) => {
                const artwork = db.artworks.find((w) => w.id === a.artworkId)
                const author = db.authors.find((x) => x.id === artwork?.authorId)
                if (!artwork) return null
                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-xs sm:flex-row"
                  >
                    {artwork.image && (
                      <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="h-28 w-[88px] shrink-0 rounded-md border border-border object-cover sm:h-32 sm:w-[104px]"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-lg font-semibold">{artwork.title}</h4>
                        <StatusBadge status={a.status} />
                        {a.received && (
                          <span className="rounded-full border border-sky-600/40 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                            Получена
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {author?.name ?? 'Автор не указан'} · {artwork.technique}
                        {formatSize(artwork) ? ` · ${formatSize(artwork)}` : ''} · {artwork.year}
                      </p>
                      {artwork.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-foreground/75">{artwork.description}</p>
                      )}
                      {a.comment && (
                        <p className="mt-1.5 text-xs text-red-700">Комментарий: {a.comment}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Подана {new Date(a.submittedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                      <Button
                        size="sm"
                        variant={a.status === 'approved' ? 'secondary' : 'default'}
                        disabled={a.status === 'approved'}
                        onClick={() => approve(a.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Принять
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={a.status === 'rejected' || a.received}
                        onClick={() => {
                          setRejectTarget(a)
                          setRejectComment(a.comment ?? '')
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Отклонить
                      </Button>
                      {a.status === 'approved' && (
                        <Button
                          size="sm"
                          variant={a.received ? 'default' : 'outline'}
                          className={a.received ? 'bg-sky-700 hover:bg-sky-700' : ''}
                          onClick={() =>
                            update((d) => {
                              const x = d.applications.find((y) => y.id === a.id)
                              if (x) x.received = !x.received
                            })
                          }
                        >
                          <PackageCheck className="h-3.5 w-3.5" />
                          {a.received ? 'Вернуть' : 'Получить'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ЭКСПОРТ И ЭТИКЕТАЖ */}
        <TabsContent value="export">
          <div className="mb-5 w-full md:w-96">
            <Label htmlFor="export-ex" className="mb-1.5 block text-xs text-muted-foreground">
              Выставка
            </Label>
            <Select value={exportExId} onValueChange={setExportExId}>
              <SelectTrigger id="export-ex">
                <SelectValue placeholder="Выберите выставку" />
              </SelectTrigger>
              <SelectContent>
                {exhibitions.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!exportEx ? (
            <EmptyNote text="Сначала создайте выставку во вкладке «Выставки»." />
          ) : (
            <ExportPanel exhibition={exportEx} />
          )}
        </TabsContent>
      </Tabs>

      {/* Создание выставки */}
      {createOpen && <ExhibitionFormDialog onClose={() => setCreateOpen(false)} />}

      {/* Редактирование выставки */}
      {editEx && <ExhibitionFormDialog exhibition={editEx} onClose={() => setEditEx(null)} />}

      {/* Удаление выставки */}
      <Dialog open={deleteEx !== null} onOpenChange={(o) => !o && setDeleteEx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить выставку?</DialogTitle>
            <DialogDescription>
              «{deleteEx?.title}» и все заявки на неё будут удалены. Картины останутся в архивах
              авторов.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEx(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteEx) return
                update((d) => {
                  d.exhibitions = d.exhibitions.filter((e) => e.id !== deleteEx.id)
                  d.applications = d.applications.filter((a) => a.exhibitionId !== deleteEx.id)
                })
                setDeleteEx(null)
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Отклонение заявки */}
      <Dialog open={rejectTarget !== null} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить заявку</DialogTitle>
            <DialogDescription>
              При необходимости укажите причину — автор увидит её в своём кабинете.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={3}
            placeholder="Например: не соответствует тематике выставки"
            aria-label="Комментарий для автора"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectTarget) return
                update((d) => {
                  const a = d.applications.find((x) => x.id === rejectTarget.id)
                  if (a) {
                    a.status = 'rejected'
                    a.comment = rejectComment.trim() || undefined
                  }
                })
                setRejectTarget(null)
              }}
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <ShieldCheck className="h-10 w-10 text-muted-foreground/50" />
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

// ---------- Панель экспорта ----------

function ExportPanel({ exhibition }: { exhibition: Exhibition }) {
  const { db } = useDb()
  const rows = approvedRows(db, exhibition.id)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-xs">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Итоговая таблица</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Список принятых картин выставки «{exhibition.title}». Основной формат — страница для
          печати с превью работ; дополнительно доступен CSV для Excel.
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Принято работ: {rows.length} · получено: {rows.filter((r) => r.application.received).length}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild disabled={rows.length === 0}>
            <Link to={`/organizer/table/${exhibition.id}`}>
              <Printer className="h-4 w-4" />
              Открыть для печати
            </Link>
          </Button>
          <Button variant="outline" onClick={() => exportExhibitionCsv(db, exhibition)} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            Скачать CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-xs">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Printer className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Этикетаж</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Лист этикеток для печати и прикрепления к картинам: номер в экспозиции, название, автор,
          год, техника и размер.
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Этикеток: {rows.length}
        </p>
        <div className="mt-4">
          <Button asChild variant={rows.length === 0 ? 'outline' : 'default'} disabled={rows.length === 0}>
            <Link to={`/organizer/labels/${exhibition.id}`}>
              <Printer className="h-4 w-4" />
              Открыть этикетки
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------- Форма создания/редактирования выставки ----------

function ExhibitionFormDialog({ exhibition, onClose }: { exhibition?: Exhibition; onClose: () => void }) {
  const { update } = useDb()
  const today = new Date().toISOString().slice(0, 10)
  const [title, setTitle] = useState(exhibition?.title ?? '')
  const [description, setDescription] = useState(exhibition?.description ?? '')
  const [requirements, setRequirements] = useState(exhibition?.requirements ?? '')
  const [location, setLocation] = useState(exhibition?.location ?? '')
  const [startDate, setStartDate] = useState(exhibition?.startDate ?? today)
  const [endDate, setEndDate] = useState(exhibition?.endDate ?? today)
  const [deadline, setDeadline] = useState(exhibition?.deadline ?? today)
  const [status, setStatus] = useState<ExhibitionStatus>(exhibition?.status ?? 'open')
  const [error, setError] = useState('')

  const save = () => {
    if (!title.trim()) return setError('Укажите название выставки.')
    if (!startDate || !endDate || !deadline) return setError('Заполните все даты.')
    if (endDate < startDate) return setError('Дата окончания раньше даты начала.')
    if (deadline > startDate) return setError('Дедлайн заявок не может быть позже начала выставки.')
    setError('')
    update((d) => {
      if (exhibition) {
        const ex = d.exhibitions.find((e) => e.id === exhibition.id)
        if (ex) {
          ex.title = title.trim()
          ex.description = description.trim() || undefined
          ex.requirements = requirements.trim() || undefined
          ex.location = location.trim() || undefined
          ex.startDate = startDate
          ex.endDate = endDate
          ex.deadline = deadline
          ex.status = status
        }
      } else {
        d.exhibitions.push({
          id: uid('ex'),
          title: title.trim(),
          description: description.trim() || undefined,
          requirements: requirements.trim() || undefined,
          location: location.trim() || undefined,
          startDate,
          endDate,
          deadline,
          status,
          createdAt: Date.now(),
        })
      }
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>{exhibition ? 'Редактировать выставку' : 'Новая выставка'}</DialogTitle>
          <DialogDescription>
            {exhibition
              ? 'Изменения сразу отразятся в каталоге и в кабинетах авторов.'
              : 'После создания переведите статус в «Приём заявок», чтобы авторы могли подавать работы.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ex-title">Название *</Label>
            <Input id="ex-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Тихие берега" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ex-desc">Описание</Label>
            <Textarea id="ex-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Концепция, формат, требования к работам" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ex-req">Требования к картинам</Label>
            <Textarea id="ex-req" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="Размер, техника, оформление, ограничение по числу работ от автора" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ex-loc">Площадка</Label>
            <Input id="ex-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Зал, город" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ex-start">Открытие *</Label>
              <Input id="ex-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ex-end">Закрытие *</Label>
              <Input id="ex-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ex-deadline">Дедлайн заявок *</Label>
              <Input id="ex-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ex-status">Статус</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ExhibitionStatus)}>
                <SelectTrigger id="ex-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="open">Приём заявок</SelectItem>
                  <SelectItem value="closed">Приём завершён</SelectItem>
                  <SelectItem value="running">Открыта</SelectItem>
                  <SelectItem value="finished">Закрыта</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save}>{exhibition ? 'Сохранить' : 'Создать выставку'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
