'use client'

import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, plural, type ArticleView } from '@/lib/stock-utils'
import { ConservationChip, ExpiryBadge, StockBadge, StockGauge, STOCK_TONE } from './status'

export function StockCards({
  items,
  selectedId,
  onSelect,
  compact,
}: {
  items: ArticleView[]
  selectedId: string | null
  onSelect: (id: string) => void
  compact: boolean
  onQuickExit?: (id: string) => void
}) {
  return (
    <ul
      className={cn(
        'grid gap-4',
        compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3',
      )}
    >
      {items.map((a) => {
        const selected = a.id === selectedId
        return (
          <li key={a.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(a.id)}
              className={cn(
                'relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-card text-left transition',
                'shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)]',
                'hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,41,38,0.08),0_10px_28px_-10px_rgba(15,41,38,0.25)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected && 'ring-2 ring-[#2a7a6e]',
              )}
            >
              <span className={cn('h-1 w-full', STOCK_TONE[a.stockStatut].stripe)} aria-hidden />
              <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{a.designation}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {a.reference} | {a.code}
                    </p>
                  </div>
                  <StockBadge status={a.stockStatut} />
                </div>

                <div>
                  <div className="flex items-end justify-between">
                    <p className="tabular-nums">
                      <span className="text-3xl font-semibold leading-none tracking-tight">{a.utilisable}</span>{' '}
                      <span className="text-sm text-muted-foreground">{plural(a.unite, a.utilisable)} {a.utilisable > 1 ? 'utilisables' : 'utilisable'}</span>
                    </p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Layers className="size-3.5" aria-hidden />
                      {a.lotsView.length} {a.lotsView.length > 1 ? 'lots' : 'lot'}
                    </span>
                  </div>
                  <StockGauge
                    className="mt-3"
                    value={a.utilisable}
                    seuil={a.seuil}
                    cible={a.cible}
                    status={a.stockStatut}
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>Seuil min {a.seuil}</span>
                    <span>Cible {a.cible}</span>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-dashed pt-3">
                  <ConservationChip value={a.conservation} />
                  {a.prochain ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground tabular-nums">{formatDate(a.prochain.peremption)}</span>
                      <ExpiryBadge status={a.prochain.statut} jours={a.prochain.jours} />
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Aucun lot en stock</span>
                  )}
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
