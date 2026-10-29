import { AlarmClock, CircleOff, PackageCheck, TrendingDown, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuickFilter = 'all' | 'rupture' | 'bas' | 'perime' | 'urgent'

type Tile = {
  key: QuickFilter
  label: string
  hint: string
  value: number
  icon: typeof AlarmClock
  tone: string
  activeRing: string
}

export function SummaryStrip({
  counts,
  active,
  onChange,
}: {
  counts: Record<QuickFilter, number>
  active: QuickFilter
  onChange: (key: QuickFilter) => void
}) {
  const tiles: Tile[] = [
    {
      key: 'all',
      label: 'Références suivies',
      hint: 'Tout afficher',
      value: counts.all,
      icon: PackageCheck,
      tone: 'bg-[#e2efec] text-[#0f2926]',
      activeRing: 'ring-[#2a7a6e]',
    },
    {
      key: 'rupture',
      label: 'En rupture',
      hint: 'Plus aucun stock utilisable',
      value: counts.rupture,
      icon: CircleOff,
      tone: 'bg-red-50 text-red-700',
      activeRing: 'ring-red-500',
    },
    {
      key: 'bas',
      label: 'Stock bas',
      hint: 'Sous le seuil minimum',
      value: counts.bas,
      icon: TrendingDown,
      tone: 'bg-amber-50 text-amber-700',
      activeRing: 'ring-amber-500',
    },
    {
      key: 'urgent',
      label: 'Périment sous 7 j',
      hint: 'À utiliser en priorité',
      value: counts.urgent,
      icon: AlarmClock,
      tone: 'bg-orange-50 text-orange-700',
      activeRing: 'ring-orange-500',
    },
    {
      key: 'perime',
      label: 'Avec lots périmés',
      hint: 'À retirer du stock',
      value: counts.perime,
      icon: TriangleAlert,
      tone: 'bg-red-600 text-white',
      activeRing: 'ring-red-600',
    },
  ]

  return (
    <div role="group" aria-label="Filtres rapides" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {tiles.map(({ key, label, hint, value, icon: Icon, tone, activeRing }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? 'all' : key)}
            className={cn(
              'group flex items-center gap-3 rounded-xl bg-card p-3.5 text-left shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)] transition',
              'hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(15,41,38,0.08),0_8px_24px_-8px_rgba(15,41,38,0.2)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive && cn('ring-2', activeRing),
            )}
          >
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tone)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-semibold leading-none tabular-nums">{value}</span>
              <span className="mt-1 block text-sm font-medium leading-tight">{label}</span>
              <span className="sr-only">{hint}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
