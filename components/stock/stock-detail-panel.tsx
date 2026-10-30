'use client'

import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Filter,
  History,
  Layers,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MouvementType } from '@/lib/stock-data'
import { formatDate, formatDateTime, formatJours, plural, type ArticleView } from '@/lib/stock-utils'
import { EXPIRY_TONE, ExpiryBadge } from './status'

const MOVE_STYLE: Record<MouvementType, { label: string; icon: typeof Undo2; chip: string; qty: string }> = {
  reception: { label: 'Réception', icon: ArrowDownToLine, chip: 'bg-emerald-100 text-emerald-800', qty: 'text-emerald-700' },
  sortie: { label: 'Sortie', icon: ArrowUpFromLine, chip: 'bg-sky-100 text-sky-800', qty: 'text-foreground' },
  retour: { label: 'Retour', icon: Undo2, chip: 'bg-violet-100 text-violet-800', qty: 'text-violet-700' },
  rebut: { label: 'Rebut', icon: Trash2, chip: 'bg-red-100 text-red-700', qty: 'text-red-700' },
  inventaire: { label: 'Ajustement inventaire', icon: ClipboardCheck, chip: 'bg-amber-100 text-amber-800', qty: 'text-amber-700' },
}

export function StockDetailPanel({
  article,
  onClose,
  onDiscard,
  onQuickExit,
}: {
  article: ArticleView
  onClose: () => void
  onDiscard: (articleId: string, lot: string) => void
  onQuickExit: () => void
}) {
  const [lotFilter, setLotFilter] = useState<string | null>(null)
  const total = article.lotsView.reduce((s, l) => s + l.quantite, 0)
  const firstUsable = article.lotsView.find((l) => l.statut !== 'perime')
  const movements = article.mouvements
    .filter((mv) => !lotFilter || mv.lot === lotFilter)
    .slice(0, 10)

  return (
    <section
      aria-labelledby="detail-title"
      className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_rgba(15,41,38,0.06),0_12px_32px_-12px_rgba(15,41,38,0.28)]"
    >
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 id="detail-title" className="truncate text-base font-semibold text-foreground">
            {article.designation}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{article.utilisable}</span>{' '}
            {plural(article.unite, article.utilisable)} {article.utilisable > 1 ? 'utilisables' : 'utilisable'} · {article.lotsView.length}{' '}
            {article.lotsView.length > 1 ? 'lots' : 'lot'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onQuickExit}
            disabled={article.utilisable === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ArrowUpFromLine className="size-3.5" aria-hidden />
            Sortir un lot
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le détail"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pb-2 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="size-4 text-[#2a7a6e]" aria-hidden />
              Lots en stock
            </h3>
            <span className="text-xs text-muted-foreground">Ordre d’utilisation (FEFO)</span>
          </div>

          {article.lotsView.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Aucun lot en stock. Une réception est nécessaire.
            </p>
          ) : (
            <ol className="mt-3 flex flex-col gap-2">
              {article.lotsView.map((lot) => {
                const active = lotFilter === lot.numero
                const isFirst = firstUsable?.numero === lot.numero
                const share = total ? (lot.quantite / total) * 100 : 0
                return (
                  <li key={lot.numero}>
                    <div
                      className={cn(
                        'rounded-lg border border-l-4 bg-card transition-colors',
                        EXPIRY_TONE[lot.statut].border,
                        lot.statut === 'perime' && 'bg-red-50/60',
                        active && 'border-[#2a7a6e] bg-[#eef6f3]',
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setLotFilter(active ? null : lot.numero)}
                        className="flex w-full flex-col gap-2 rounded-lg px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-foreground">{lot.numero}</span>
                            {isFirst && (
                              <span className="rounded bg-[#0f2926] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                À utiliser en 1er
                              </span>
                            )}
                          </span>
                          <span className="text-sm tabular-nums">
                            <span className="font-semibold">{lot.quantite}</span>{' '}
                            <span className="text-muted-foreground">{plural(article.unite, lot.quantite)}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            Exp. {formatDate(lot.peremption)}{' '}
                            <span className={cn('font-medium', EXPIRY_TONE[lot.statut].text)}>
                              ({formatJours(lot.jours)})
                            </span>
                          </span>
                          <ExpiryBadge status={lot.statut} showDays={false} />
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted" aria-hidden>
                          <div
                            className={cn(
                              'h-full rounded-full',
                              lot.statut === 'perime' ? 'bg-red-400' : 'bg-[#2a7a6e]/70',
                            )}
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </button>
                      {lot.statut === 'perime' && (
                        <div className="flex items-center justify-between gap-2 border-t border-red-200 px-3 py-2">
                          <span className="text-xs text-red-700">Non comptabilisé dans le stock utilisable</span>
                          <button
                            type="button"
                            onClick={() => onDiscard(article.id, lot.numero)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            Mettre au rebut
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <History className="size-4 text-[#2a7a6e]" aria-hidden />
              Derniers mouvements
            </h3>
            {lotFilter ? (
              <button
                type="button"
                onClick={() => setLotFilter(null)}
                className="inline-flex items-center gap-1 rounded-full bg-[#e2efec] px-2 py-0.5 text-xs font-medium text-[#0f2926] hover:bg-[#d3e7e2]"
              >
                <Filter className="size-3" aria-hidden />
                Lot {lotFilter}
                <X className="size-3" aria-label="Retirer le filtre" />
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">Cliquez un lot pour filtrer</span>
            )}
          </div>

          {movements.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucun mouvement enregistré.</p>
          ) : (
            <ol className="relative mt-4 flex flex-col">
              {movements.map((mv, i) => {
                const style = MOVE_STYLE[mv.type]
                const Icon = style.icon
                const { date, time } = formatDateTime(mv.date)
                const last = i === movements.length - 1
                return (
                  <li key={mv.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {!last && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden />}
                    <span className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full', style.chip)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pt-0.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {style.label}
                          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                            lot {mv.lot}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date} · {time} · {mv.personne}
                          {mv.motif && ` · ${mv.motif}`}
                        </p>
                      </div>
                      <span className={cn('shrink-0 text-sm font-semibold tabular-nums', style.qty)}>
                        {mv.quantite > 0 ? `+${mv.quantite}` : mv.quantite}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
