import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { CalendarDays, ImagePlus, Info, MapPin, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { fileToDataUrl, uid, useDb } from '@/lib/store'
import { formatDate, formatSize } from '@/lib/export'
import { APPLICATION_STATUS_LABELS, type ApplicationStatus, type Artwork } from '@/lib/types'
import ArtworkCard from '@/components/ArtworkCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { cn } from '@/lib/utils'

const CURRENT_AUTHOR_KEY = 'art-venue-current-author'

export default function AuthorPage() {
  const { db, update } = useDb()
  const [authorId, setAuthorId] = useState<string>(() => {
    return localStorage.getItem(CURRENT_AUTHOR_KEY) || db.authors[0]?.id || ''
  })

  const author = db.authors.find((a) => a.id === authorId)
  const myArtworks = db.artworks
    .filter((w) => w.authorId === authorId)
    .sort((a, b) => b.createdAt - a.createdAt)
  const myApplications = db.applications
    .filter((a) => myArtworks.some((w) => w.id === a.artworkId))
    .sort((a, b) => b.submittedAt - a.submittedAt)

  const [editTarget, setEditTarget] = useState<Artwork | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Artwork | null>(null)
  const [submitExhibition, setSubmitExhibition] = useState<string | null>(null)

  const pickAuthor = (id: string) => {
    setAuthorId(id)
    localStorage.setItem(CURRENT_AUTHOR_KEY, id)
  }

  const openExhibitions = db.exhibitions
    .filter((e) => e.status === 'open')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-accent uppercase">Авторам</p>
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            Кабинет автора
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Ведите архив своих работ и заявляйте картины на выставки с открытым приёмом.
          </p>
        </div>
        <div className="w-full md:w-72">
          <Label htmlFor="author-select" className="mb-1.5 block text-xs text-muted-foreground">
            Вы работаете как
          </Label>
          <Select value={authorId} onValueChange={pickAuthor}>
            <SelectTrigger id="author-select" className="w-full">
              <SelectValue placeholder="Выберите автора" />
            </SelectTrigger>
            <SelectContent>
              {db.authors.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!author ? (
        <p className="text-sm text-muted-foreground">Выберите автора, чтобы продолжить.</p>
      ) : (
        <Tabs defaultValue="archive">
          <TabsList className="mb-6">
            <TabsTrigger value="archive">Каталог работ ({myArtworks.length})</TabsTrigger>
            <TabsTrigger value="exhibitions">Выставки ({openExhibitions.length})</TabsTrigger>
            <TabsTrigger value="applications">Мои заявки ({myApplications.length})</TabsTrigger>
          </TabsList>

          {/* АРХИВ */}
          <TabsContent value="archive">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Ваш личный каталог работ. Отсюда картины заявляются на выставки.
              </p>
              <Button onClick={() => setEditTarget('new')}>
                <Plus className="h-4 w-4" />
                Добавить картину
              </Button>
            </div>
            {myArtworks.length === 0 ? (
              <EmptyBox
                text="В каталоге пока пусто. Добавьте первую картину."
                action={
                  <Button variant="outline" onClick={() => setEditTarget('new')}>
                    <Plus className="h-4 w-4" />
                    Добавить картину
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myArtworks.map((w) => (
                  <div key={w.id} className="relative">
                    <ArtworkCard artwork={w} author={author} />
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditTarget(w)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Изменить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(w)}
                        aria-label={`Удалить «${w.title}»`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ВЫСТАВКИ С ОТКРЫТЫМ ПРИЁМОМ */}
          <TabsContent value="exhibitions">
            {openExhibitions.length === 0 ? (
              <EmptyBox text="Сейчас нет выставок с открытым приёмом заявок." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {openExhibitions.map((ex) => {
                  const submitted = db.applications.filter(
                    (a) => a.exhibitionId === ex.id && myArtworks.some((w) => w.id === a.artworkId),
                  )
                  const available = myArtworks.filter(
                    (w) => !db.applications.some((a) => a.exhibitionId === ex.id && a.artworkId === w.id),
                  )
                  return (
                    <div key={ex.id} className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-xs">
                      <h3 className="font-display text-xl font-semibold">{ex.title}</h3>
                      {ex.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{ex.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                      <p className="mt-2 text-xs font-medium text-accent">
                        Приём заявок до {formatDate(ex.deadline)}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground">
                          Заявлено работ: {submitted.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/exhibitions/${ex.id}`}>
                              <Info className="h-3.5 w-3.5" />
                              Подробнее
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            disabled={available.length === 0}
                            onClick={() => setSubmitExhibition(ex.id)}
                          >
                            <Send className="h-3.5 w-3.5" />
                            {available.length === 0 ? 'Все работы заявлены' : 'Заявить картины'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* МОИ ЗАЯВКИ */}
          <TabsContent value="applications">
            {myApplications.length === 0 ? (
              <EmptyBox text="У вас пока нет заявок. Заявите картины на выставку во вкладке «Выставки»." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="px-4 py-3 font-medium">Картина</th>
                      <th className="px-4 py-3 font-medium">Выставка</th>
                      <th className="px-4 py-3 font-medium">Подана</th>
                      <th className="px-4 py-3 font-medium">Статус</th>
                      <th className="px-4 py-3 font-medium">Комментарий</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map((a) => {
                      const artwork = myArtworks.find((w) => w.id === a.artworkId)
                      const ex = db.exhibitions.find((e) => e.id === a.exhibitionId)
                      return (
                        <tr key={a.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">
                            {artwork ? (
                              <Link
                                to={`/artworks/${artwork.id}`}
                                className="text-accent underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                              >
                                {artwork.title}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {ex ? (
                              <Link
                                to={`/exhibitions/${ex.id}`}
                                className="text-accent underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                              >
                                {ex.title}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(a.submittedAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <StatusBadge status={a.status} />
                              {a.received && (
                                <span className="rounded-full border border-sky-600/40 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                                  Передана
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="max-w-56 px-4 py-3 text-muted-foreground">{a.comment ?? '—'}</td>
                          <td className="px-4 py-3 text-right">
                            {a.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  update((d) => {
                                    d.applications = d.applications.filter((x) => x.id !== a.id)
                                  })
                                }
                              >
                                Отозвать
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Диалог добавления/редактирования картины */}
      {editTarget !== null && author && (
        <ArtworkFormDialog
          artwork={editTarget === 'new' ? null : editTarget}
          authorId={author.id}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Подтверждение удаления */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить картину?</DialogTitle>
            <DialogDescription>
              «{deleteTarget?.title}» будет удалена из каталога вместе со всеми заявками. Действие
              необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteTarget) return
                update((d) => {
                  d.artworks = d.artworks.filter((w) => w.id !== deleteTarget.id)
                  d.applications = d.applications.filter((a) => a.artworkId !== deleteTarget.id)
                })
                setDeleteTarget(null)
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог заявки на выставку */}
      {submitExhibition && (
        <SubmitDialog
          exhibitionId={submitExhibition}
          artworks={myArtworks.filter(
            (w) => !db.applications.some((a) => a.exhibitionId === submitExhibition && a.artworkId === w.id),
          )}
          onClose={() => setSubmitExhibition(null)}
        />
      )}
    </div>
  )
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        status === 'approved' && 'border-emerald-600/40 bg-emerald-50 text-emerald-700',
        status === 'rejected' && 'border-red-600/40 bg-red-50 text-red-700',
        status === 'pending' && 'border-amber-600/40 bg-amber-50 text-amber-700',
      )}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </Badge>
  )
}

function EmptyBox({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
      <ImagePlus className="h-10 w-10 text-muted-foreground/50" />
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  )
}

// ---------- Форма картины ----------

function ArtworkFormDialog({
  artwork,
  authorId,
  onClose,
}: {
  artwork: Artwork | null
  authorId: string
  onClose: () => void
}) {
  const { update } = useDb()
  const [title, setTitle] = useState(artwork?.title ?? '')
  const [year, setYear] = useState(artwork?.year ? String(artwork.year) : String(new Date().getFullYear()))
  const [technique, setTechnique] = useState(artwork?.technique ?? '')
  const [height, setHeight] = useState(artwork?.height ? String(artwork.height) : '')
  const [width, setWidth] = useState(artwork?.width ? String(artwork.width) : '')
  const [description, setDescription] = useState(artwork?.description ?? '')
  const [image, setImage] = useState<string | undefined>(artwork?.image)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const save = () => {
    const yearNum = Number(year)
    const heightNum = height.trim() ? Number(height) : undefined
    const widthNum = width.trim() ? Number(width) : undefined
    if (!title.trim()) return setError('Укажите название картины.')
    if (!Number.isInteger(yearNum) || yearNum < 1800 || yearNum > 2100)
      return setError('Укажите корректный год создания.')
    if (!technique.trim()) return setError('Укажите материалы и технику.')
    if (heightNum !== undefined && (!Number.isFinite(heightNum) || heightNum <= 0 || heightNum > 1000))
      return setError('Укажите корректную высоту в сантиметрах.')
    if (widthNum !== undefined && (!Number.isFinite(widthNum) || widthNum <= 0 || widthNum > 1000))
      return setError('Укажите корректную ширину в сантиметрах.')
    setError('')
    update((d) => {
      if (artwork) {
        const w = d.artworks.find((x) => x.id === artwork.id)
        if (w) {
          w.title = title.trim()
          w.year = yearNum
          w.technique = technique.trim()
          w.height = heightNum
          w.width = widthNum
          w.description = description.trim() || undefined
          w.image = image
        }
      } else {
        d.artworks.push({
          id: uid('art'),
          authorId,
          title: title.trim(),
          year: yearNum,
          technique: technique.trim(),
          height: heightNum,
          width: widthNum,
          description: description.trim() || undefined,
          image,
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
          <DialogTitle>{artwork ? 'Редактировать картину' : 'Добавить картину'}</DialogTitle>
          <DialogDescription>
            Поля «Название», «Год» и «Материалы и техника» обязательны.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="aw-title">Название *</Label>
            <Input id="aw-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Утро на Сретенке" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="aw-year">Год создания *</Label>
              <Input id="aw-year" type="number" min={1800} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="aw-height">Высота, см</Label>
              <Input id="aw-height" type="number" min={1} max={1000} step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="60" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="aw-width">Ширина, см</Label>
              <Input id="aw-width" type="number" min={1} max={1000} step="0.5" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="80" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="aw-tech">Материалы и техника *</Label>
            <Input id="aw-tech" value={technique} onChange={(e) => setTechnique(e.target.value)} placeholder="холст, масло" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="aw-desc">Описание</Label>
            <Textarea id="aw-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Пара слов о работе — для каталога и кураторов" />
          </div>
          <div className="grid gap-1.5">
            <Label>Изображение</Label>
            <div className="flex items-center gap-3">
              {image ? (
                <img src={image} alt="Превью" className="h-20 w-16 rounded-sm border border-border object-cover" />
              ) : (
                <div className="flex h-20 w-16 items-center justify-center rounded-sm border border-dashed border-border text-muted-foreground">
                  <ImagePlus className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  {image ? 'Заменить' : 'Загрузить'}
                </Button>
                {image && (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setImage(undefined)}>
                    Убрать
                  </Button>
                )}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) {
                  try {
                    setImage(await fileToDataUrl(f))
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Не удалось загрузить изображение')
                  }
                }
                e.target.value = ''
              }}
            />
          </div>
          {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save}>{artwork ? 'Сохранить' : 'Добавить в каталог'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Заявка картин на выставку ----------

function SubmitDialog({
  exhibitionId,
  artworks,
  onClose,
}: {
  exhibitionId: string
  artworks: Artwork[]
  onClose: () => void
}) {
  const { db, update } = useDb()
  const ex = db.exhibitions.find((e) => e.id === exhibitionId)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = () => {
    update((d) => {
      for (const artworkId of selected) {
        d.applications.push({
          id: uid('apl'),
          exhibitionId,
          artworkId,
          submittedAt: Date.now(),
          status: 'pending',
        })
      }
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>Заявить картины</DialogTitle>
          <DialogDescription>
            Выставка «{ex?.title}». Отметьте работы из каталога — они уйдут на модерацию организаторам.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {artworks.map((w) => (
            <label
              key={w.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={selected.has(w.id)}
                onCheckedChange={() => toggle(w.id)}
                aria-label={`Выбрать «${w.title}»`}
              />
              {w.image && (
                <img src={w.image} alt="" className="h-14 w-11 rounded-sm border border-border object-cover" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{w.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {w.technique}{formatSize(w) ? ` · ${formatSize(w)}` : ''} · {w.year}
                </span>
              </span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={selected.size === 0}>
            Подать заявку{selected.size > 0 ? ` (${selected.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
