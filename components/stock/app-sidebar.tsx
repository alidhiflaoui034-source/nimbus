'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Settings,
  Warehouse,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStock } from '@/lib/stock-store'

const NAV = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: null },
  { label: 'Catalogue', icon: BookOpen, href: null },
  { label: 'État du stock', icon: Warehouse, href: '/' },
  { label: 'Réceptions', icon: ArrowDownToLine, href: null },
  { label: 'Sorties', icon: ArrowUpFromLine, href: null },
  { label: 'Inventaires', icon: ClipboardList, href: '/inventaires' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { activeSession } = useStock()

  return (
    <aside className="sticky top-0 flex h-screen w-[72px] shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:w-60">
      <div className="flex h-16 items-center gap-2.5 px-4 lg:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2a7a6e] text-white">
          <FlaskConical className="size-5" aria-hidden />
        </span>
        <span className="hidden text-lg font-semibold tracking-tight text-white lg:block">StockLab</span>
      </div>

      <nav aria-label="Navigation principale" className="mt-4 flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ label, icon: Icon, href }) => {
            const active = href !== null && pathname === href
            const showLive = href === '/inventaires' && activeSession !== null
            const className = cn(
              'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              'justify-center lg:justify-start',
              active
                ? 'bg-sidebar-accent text-white shadow-[inset_3px_0_0_#5fb3a6]'
                : 'hover:bg-sidebar-accent/60 hover:text-white',
              href === null && 'opacity-70',
            )
            const content = (
              <>
                <Icon className="size-[18px] shrink-0" aria-hidden />
                <span className="hidden lg:inline">{label}</span>
                {showLive && (
                  <>
                    <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-400 lg:static lg:ml-auto lg:size-auto lg:rounded-full lg:bg-amber-400/15 lg:px-2 lg:py-0.5 lg:text-[11px] lg:font-semibold lg:text-amber-300">
                      <span className="hidden lg:inline">En cours</span>
                    </span>
                    <span className="sr-only"> — comptage en cours</span>
                  </>
                )}
              </>
            )
            return (
              <li key={label}>
                {href ? (
                  <Link href={href} aria-current={active ? 'page' : undefined} title={label} className={className}>
                    {content}
                  </Link>
                ) : (
                  <span title={`${label} (bientôt disponible)`} aria-disabled="true" className={cn(className, 'cursor-default')}>
                    {content}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <span
          title="Paramètres"
          className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-70 lg:justify-start"
        >
          <Settings className="size-[18px]" aria-hidden />
          <span className="hidden lg:inline">Paramètres</span>
        </span>
        <div className="mt-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2a7a6e] text-xs font-semibold text-white">
            BD
          </span>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium text-white">ben ali D.</p>
            <p className="truncate text-xs text-sidebar-foreground/70">Labo. Microbiologie</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
