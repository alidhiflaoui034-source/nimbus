'use client'

import { useEffect } from 'react'
import { ArrowRight, CheckCircle2, ClipboardCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { zoneLabel, type InventorySession } from '@/lib/inventory-data'
import { plural } from '@/lib/stock-utils'

export function InventoryReviewDialog({
  session,
  onClose,
  onConfirm,
}: {
  session: InventorySession
  onClose: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const ecarts = session.lines.filter((l) => l.compte !== l.theorique)
  const conformes = session.lines.length - ecarts.length
  const rate = session.lines.length ? Math.round((conformes / session.lines.length) * 100) : 100
  const surplus = ecarts.reduce((s, l) => s + Math.max(0, (l.compte ?? 0) - l.theorique), 0)
  const manque = ecarts.reduce((s, l) => s + Math.max(0, l.theorique - (l.compte ?? 0)), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2926]/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <h2 id="review-title" className="text-lg font-semibold">
              Rapprochement · {session.numero}
            </h2>
            <p className="text-sm text-muted-foreground">
              {zoneLabel(session.zone)} · {session.lines.length} lots comptés
            </p>
          </div>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/70 p-3">
              <dt className="text-xs text-muted-foreground">Conformité</dt>
              <dd className={cn('text-2xl font-semibold tabular-nums', rate === 100 ? 'text-emerald-700' : 'text-foreground')}>{rate}%</dd>
            </div>
            <div className="rounded-lg bg-sky-50 p-3">
              <dt className="text-xs text-sky-800">Excédents</dt>
              <dd className="text-2xl font-semibold text-sky-800 tabular-nums">+{surplus}</dd>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <dt className="text-xs text-red-700">Manquants</dt>
              <dd className="text-2xl font-semibold text-red-700 tabular-nums">−{manque}</dd>
            </div>
          </dl>

          <h3 className="mt-6 text-sm font-semibold">
            Écarts à ajuster ({ecarts.length})
          </h3>
          {ecarts.length === 0 ? (
            <p className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="size-4" aria-hidden /> Le stock physique correspond au stock théorique.
            </p>
          ) : (
            <ul className="mt-2 divide-y rounded-lg border">
              {ecarts.map((l) => {
                const diff = (l.compte ?? 0) - l.theorique
                return (
                  <li key={l.key} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.designation}</p>
                      <p className="text-xs text-muted-foreground">
                        Lot <span className="font-mono">{l.lot}</span>
                        {l.compte === 0 && ' · sera retiré du stock'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-sm tabular-nums">
                      <span className="text-muted-foreground">{l.theorique}</span>
                      <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                      <span className="font-semibold">
                        {l.compte} {plural(l.unite, l.compte ?? 0)}
                      </span>
                      <span
                        className={cn(
                          'w-12 rounded-full px-2 py-0.5 text-center text-xs font-semibold',
                          diff > 0 ? 'bg-sky-50 text-sky-800' : 'bg-red-50 text-red-700',
                        )}
                      >
                        {diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            La validation remplace les quantités en stock par les quantités comptées et enregistre un mouvement « Ajustement inventaire » pour chaque écart.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t bg-muted/50 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
            Revenir au comptage
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ClipboardCheck className="size-4" aria-hidden />
            Valider l&apos;inventaire
          </button>
        </footer>
      </div>
    </div>
  )
}
