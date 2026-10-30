'use client'

import { ArrowUpFromLine, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, plural, type ArticleView } from '@/lib/stock-utils'
import { ConservationChip, ExpiryBadge, StockBadge, StockGauge, STOCK_TONE } from './status'

export function StockTable({
  items,
  selectedId,
  onSelect,
  compact,
  onQuickExit,
}: {
  items: ArticleView[]
  selectedId: string | null
  onSelect: (id: string) => void
  compact: boolean
  onQuickExit: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/60 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-3 pl-5 pr-3 font-medium">Produit</th>
              {!compact && <th scope="col" className="px-3 py-3 font-medium">Catégorie · Plateforme</th>}
              <th scope="col" className="px-3 py-3 font-medium">Conservation</th>
              <th scope="col" className="px-3 py-3 font-medium">Stock utilisable</th>
              <th scope="col" className="px-3 py-3 font-medium">Statut</th>
              <th scope="col" className="px-3 py-3 font-medium">Prochaine péremption</th>
              <th scope="col" className="py-3 pl-3 pr-4 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => {
              const selected = a.id === selectedId
              return (
                <tr
                  key={a.id}
                  tabIndex={0}
                  aria-selected={selected}
                  onClick={() => onSelect(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(a.id)
                    }
                  }}
                  className={cn(
                    'group cursor-pointer border-b last:border-b-0 transition-colors',
                    'focus-visible:outline-none focus-visible:bg-accent/60',
                    selected ? 'bg-[#eaf4f1]' : 'hover:bg-muted/70',
                  )}
                >
                  <td className="relative py-3.5 pl-5 pr-3">
                    <span
                      className={cn(
                        'absolute inset-y-2 left-0 w-1 rounded-r-full',
                        selected ? 'bg-[#2a7a6e]' : STOCK_TONE[a.stockStatut].stripe,
                        !selected && a.stockStatut === 'ok' && 'opacity-0',
                      )}
                      aria-hidden
                    />
                    <p className="font-medium text-foreground">{a.designation}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {a.reference} <span className="text-border">|</span> {a.code}
                    </p>
                  </td>
                  {!compact && (
                    <td className="px-3 py-3.5">
                      <p className="text-foreground">{a.categorie}</p>
                      <p className="text-xs text-muted-foreground">{a.plateforme}</p>
                    </td>
                  )}
                  <td className="px-3 py-3.5">
                    <ConservationChip value={a.conservation} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="w-36">
                      <p className="tabular-nums">
                        <span className="text-base font-semibold text-foreground">{a.utilisable}</span>{' '}
                        <span className="text-muted-foreground">{plural(a.unite, a.utilisable)}</span>
                      </p>
                      <StockGauge
                        className="mt-1.5"
                        value={a.utilisable}
                        seuil={a.seuil}
                        cible={a.cible}
                        status={a.stockStatut}
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                        Seuil {a.seuil} · Cible {a.cible}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <StockBadge status={a.stockStatut} />
                  </td>
                  <td className="px-3 py-3.5">
                    {a.prochain ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="tabular-nums text-foreground">{formatDate(a.prochain.peremption)}</span>
                        <ExpiryBadge status={a.prochain.statut} jours={a.prochain.jours} />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Aucun lot</span>
                    )}
                  </td>
                  <td className="py-3.5 pl-3 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={a.utilisable === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          onQuickExit(a.id)
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        aria-label={`Sortir un lot de ${a.designation}`}
                        title={a.utilisable === 0 ? 'Aucun lot utilisable' : 'Sortie rapide (lot FEFO pré-sélectionné)'}
                        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-card px-2.5 text-xs font-medium text-foreground ring-1 ring-inset ring-border hover:bg-[#0f2926] hover:text-white hover:ring-[#0f2926] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ArrowUpFromLine className="size-3.5" aria-hidden />
                        <span className={cn(compact && 'sr-only')}>Sortir</span>
                      </button>
                      <ChevronRight
                        className={cn(
                          'size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5',
                          selected && 'text-[#2a7a6e]',
                        )}
                        aria-hidden
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
