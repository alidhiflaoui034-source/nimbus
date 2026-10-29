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

const NAV = [
  { label: 'Tableau de bord', icon: LayoutDashboard },
  { label: 'Catalogue', icon: BookOpen },
  { label: 'État du stock', icon: Warehouse, active: true },
  { label: 'Réceptions', icon: ArrowDownToLine },
  { label: 'Sorties', icon: ArrowUpFromLine },
  { label: 'Inventaires', icon: ClipboardList },
]

export function AppSidebar() {
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
          {NAV.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <a
                href="#"
                aria-current={active ? 'page' : undefined}
                title={label}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'justify-center lg:justify-start',
                  active
                    ? 'bg-sidebar-accent text-white shadow-[inset_3px_0_0_#5fb3a6]'
                    : 'hover:bg-sidebar-accent/60 hover:text-white',
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                <span className="hidden lg:inline">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <a
          href="#"
          title="Paramètres"
          className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent/60 hover:text-white lg:justify-start"
        >
          <Settings className="size-[18px]" aria-hidden />
          <span className="hidden lg:inline">Paramètres</span>
        </a>
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
