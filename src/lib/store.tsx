import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Db } from './types'
import { buildSeed } from './seed'

const STORAGE_KEY = 'art-venue-db-v3'

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Db
      if (parsed && Array.isArray(parsed.artworks) && Array.isArray(parsed.exhibitions)) {
        return parsed
      }
    }
  } catch {
    // повреждённые данные — пересоздаём
  }
  const seed = buildSeed()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  } catch {
    // localStorage недоступен — работаем в памяти
  }
  return seed
}

interface DbContextValue {
  db: Db
  /** Применить изменение и сохранить */
  update: (fn: (draft: Db) => void) => void
  /** Сбросить к демонстрационным данным */
  reset: () => void
}

const DbContext = createContext<DbContextValue | null>(null)

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
      // квота переполнена (большие изображения) — данные живут до перезагрузки
    }
  }, [db])

  const update = (fn: (draft: Db) => void) => {
    setDb((prev) => {
      const draft: Db = structuredClone(prev)
      fn(draft)
      return draft
    })
  }

  const reset = () => setDb(buildSeed())

  return <DbContext.Provider value={{ db, update, reset }}>{children}</DbContext.Provider>
}

export function useDb(): DbContextValue {
  const ctx = useContext(DbContext)
  if (!ctx) throw new Error('useDb вне DbProvider')
  return ctx
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Уменьшает загруженное изображение до разумного размера для localStorage */
export function fileToDataUrl(file: File, maxSide = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Не удалось распознать изображение'))
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        if (scale >= 1) {
          resolve(reader.result as string)
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
