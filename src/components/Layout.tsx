import { NavLink, Outlet } from 'react-router'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Каталог', end: true },
  { to: '/author', label: 'Кабинет автора' },
  { to: '/organizer', label: 'Кабинет организатора' },
]

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:h-16 md:flex-nowrap md:gap-6 md:py-0 md:px-6">
          <NavLink to="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Palette className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-lg leading-none font-semibold tracking-tight">
              Территория искусства
            </span>
          </NavLink>
          <nav className="ml-auto flex flex-wrap items-center gap-1 md:gap-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-4',
                    isActive
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>Территория искусства — платформа выставок картин</span>
          <span>Каталог · архив авторов · кабинет организатора</span>
        </div>
      </footer>
    </div>
  )
}
