'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, EyeOff, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStock } from '@/lib/stock-store'
import { zoneLabel } from '@/lib/inventory-data'
import { formatDateTime } from '@/lib/stock-utils'

export function InventoryHistory({ highlightId }: { highlightId: string | null }) {
  const { sessions } = useStock()
  const [openId, setOpenId] = useState<string | null>(highlightId)
  const closed = sessions
    .filter((s) => s.closedAt)
    .sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))

  const totalLines = closed.reduce((s, x) => s + x.lines.length, 0)
  const totalEcarts = closed.reduce((s, x) => s + x.lines.filter((l) => l.compte !== l.theorique).length, 0)
  const avgRate = totalLines ? Math.round(((totalLines - totalEcarts) / totalLines) * 100) : 100

  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="history-title" className="flex items-center gap-2 text-base font-semibold">
          <History className="size-4 text-[#2a7a6e]" aria-hidden />
          Historique des inventaires
        </h2>
        <dl className="flex gap-5 text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">Conformité moyenne</dt>
            <dd className="font-semibold tabular-nums">{avgRate}%</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">Écarts corrigés</dt>
            <dd className="font-semibold tabular-nums">{totalEcarts}</dd>
          </div>
        </dl>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)]">
        {closed.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">Aucun inventaire validé pour le moment.</p>
        ) : (
          <ul className="divide-y">
            {closed.map((s) => {
              const ecarts = s.lines.filter((l) => l.compte !== l.theorique)
              const rate = Math.round(((s.lines.length - ecarts.length) / s.lines.length) * 100)
              const { date, time } = formatDateTime(s.closedAt ?? '')
              const open = openId === s.id
              return (
                <li key={s.id} className={cn(highlightId === s.id && 'bg-emerald-50/50')}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : s.id)}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-4 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/60 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_90px_120px_24px]"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{s.numero}</span>
                        {s.blind && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                            <EyeOff className="size-3" aria-hidden /> Aveugle
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {date} · {time} · {s.by}
                      </span>
                    </span>
                    <span className="hidden text-sm md:block">{zoneLabel(s.zone)}</span>
                    <span className="hidden text-sm tabular-nums text-muted-foreground md:block">{s.lines.length} lots</span>
                    <span className="flex items-center gap-2 md:justify-start">
                      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <span
                          className={cn('block h-full rounded-full', rate === 100 ? 'bg-emerald-500' : rate >= 80 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${rate}%` }}
                        />
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{rate}%</span>
                    </span>
                    <ChevronDown
                      className={cn('hidden size-4 text-muted-foreground transition-transform md:block', open && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4">
                      {ecarts.length === 0 ? (
                        <p className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">Aucun écart constaté.</p>
                      ) : (
                        <ul className="divide-y rounded-lg border bg-card">
                          {ecarts.map((l) => {
                            const diff = (l.compte ?? 0) - l.theorique
                            return (
                              <li key={l.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                <span className="min-w-0 truncate">
                                  {l.designation} <span className="font-mono text-xs text-muted-foreground">· {l.lot}</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2 tabular-nums">
                                  <span className="text-muted-foreground">{l.theorique}</span>
                                  <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                                  <span className="font-semibold">{l.compte}</span>
                                  <span className={cn('w-10 text-right text-xs font-semibold', diff > 0 ? 'text-sky-700' : 'text-red-700')}>
                                    {diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`}
                                  </span>
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
