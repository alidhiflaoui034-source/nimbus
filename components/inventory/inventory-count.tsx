'use client'

import { useMemo, useState } from 'react'
import { Check, CheckCheck, ClipboardCheck, EyeOff, Minus, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStock } from '@/lib/stock-store'
import { zoneLabel, type InventoryLine, type InventorySession } from '@/lib/inventory-data'
import { daysUntil, expiryStatus, formatDate, formatDateTime, plural } from '@/lib/stock-utils'
import { ConservationChip, ExpiryBadge } from '@/components/stock/status'
import { InventoryReviewDialog } from './inventory-review-dialog'

type LineFilter = 'all' | 'todo' | 'ecart' | 'ok'

export function InventoryCount({ session, onClosed }: { session: InventorySession; onClosed: (id: string) => void }) {
  const { setCount, markRemainingConform, closeInventory, cancelInventory } = useStock()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LineFilter>('all')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const total = session.lines.length
  const counted = session.lines.filter((l) => l.compte !== null)
  const ecarts = counted.filter((l) => l.compte !== l.theorique)
  const remaining = total - counted.length
  const pct = total ? Math.round((counted.length / total) * 100) : 0
  const started = formatDateTime(session.startedAt)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const visible = session.lines.filter((l) => {
      if (q && !`${l.designation} ${l.reference} ${l.lot}`.toLowerCase().includes(q)) return false
      if (filter === 'todo') return l.compte === null
      if (filter === 'ecart') return l.compte !== null && l.compte !== l.theorique
      if (filter === 'ok') return l.compte !== null && (session.blind || l.compte === l.theorique)
      return true
    })
    const map = new Map<string, InventoryLine[]>()
    for (const l of visible) map.set(l.articleId, [...(map.get(l.articleId) ?? []), l])
    return [...map.values()]
  }, [session, query, filter])

  const FILTERS: { id: LineFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Tous', count: total },
    { id: 'todo', label: 'À compter', count: remaining },
    ...(session.blind
      ? [{ id: 'ok' as const, label: 'Comptés', count: counted.length }]
      : [
          { id: 'ecart' as const, label: 'Écarts', count: ecarts.length },
          { id: 'ok' as const, label: 'Conformes', count: counted.length - ecarts.length },
        ]),
  ]

  return (
    <div className="flex flex-col gap-5">
      <section
        aria-label="Session en cours"
        className="overflow-hidden rounded-xl bg-[#0f2926] text-white shadow-[0_12px_32px_-16px_rgba(15,41,38,0.6)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 lg:px-6">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#9fd0c7]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2 py-0.5 font-semibold text-amber-300">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-300" aria-hidden />
                Comptage en cours
              </span>
              {session.blind && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                  <EyeOff className="size-3" aria-hidden /> À l&apos;aveugle
                </span>
              )}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {session.numero} <span className="font-normal text-white/60">·</span> {zoneLabel(session.zone)}
            </h2>
            <p className="mt-0.5 text-sm text-white/65">
              Démarré le {started.date} à {started.time} par {session.by}
            </p>
          </div>
          {confirmCancel ? (
            <div className="flex items-center gap-2 rounded-lg bg-white/10 p-1.5 pl-3 text-sm">
              <span>Abandonner le comptage ?</span>
              <button type="button" onClick={cancelInventory} className="rounded-md bg-red-500 px-3 py-1.5 font-medium hover:bg-red-600">
                Abandonner
              </button>
              <button type="button" onClick={() => setConfirmCancel(false)} className="rounded-md px-3 py-1.5 hover:bg-white/10">
                Non
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 ring-1 ring-inset ring-white/20 hover:bg-white/10 hover:text-white"
            >
              Abandonner
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 border-t border-white/10">
          <Stat label="Lots comptés" value={`${counted.length}/${total}`} />
          <Stat label="Restants" value={String(remaining)} />
          <Stat label={session.blind ? 'Écarts' : 'Écarts détectés'} value={session.blind ? 'Masqués' : String(ecarts.length)} tone={!session.blind && ecarts.length > 0 ? 'warn' : undefined} />
        </div>
        <div
          className="h-1.5 bg-white/10"
          role="progressbar"
          aria-label="Progression du comptage"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-[#5fb3a6] transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une référence ou scanner un n° de lot"
            aria-label="Rechercher dans l’inventaire"
            className="h-10 w-full rounded-lg bg-card pl-9 pr-3 text-sm shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div role="radiogroup" aria-label="Filtrer les lignes" className="flex rounded-lg bg-card p-1 shadow-sm ring-1 ring-inset ring-border">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.id ? 'bg-[#0f2926] text-white' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              <span className={cn('rounded px-1 text-xs tabular-nums', filter === f.id ? 'bg-white/15' : 'bg-muted')}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-sm">
          Aucune ligne ne correspond à ce filtre.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((lines) => (
            <li key={lines[0].articleId} className="overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{lines[0].designation}</p>
                  <p className="font-mono text-xs text-muted-foreground">{lines[0].reference}</p>
                </div>
                <ConservationChip value={lines[0].conservation} />
              </div>
              <ul className="divide-y">
                {lines.map((l) => (
                  <CountRow key={l.key} line={l} blind={session.blind} onChange={(v) => setCount(l.key, v)} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card/95 px-4 py-3 shadow-[0_8px_30px_-8px_rgba(15,41,38,0.35)] ring-1 ring-border backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {remaining > 0 ? (
            <>
              <span className="font-semibold text-foreground tabular-nums">{remaining}</span> {remaining > 1 ? 'lots restent' : 'lot reste'} à compter
            </>
          ) : (
            <span className="font-medium text-emerald-700">Tous les lots sont comptés, prêt à valider.</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {!session.blind && remaining > 0 && (
            <button
              type="button"
              onClick={markRemainingConform}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ring-1 ring-inset ring-border hover:bg-muted"
            >
              <CheckCheck className="size-4" aria-hidden />
              Restants conformes
            </button>
          )}
          <button
            type="button"
            disabled={remaining > 0}
            onClick={() => setReviewOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <ClipboardCheck className="size-4" aria-hidden />
            Rapprocher et valider
          </button>
        </div>
      </div>

      {reviewOpen && (
        <InventoryReviewDialog
          session={session}
          onClose={() => setReviewOpen(false)}
          onConfirm={() => {
            const id = closeInventory()
            setReviewOpen(false)
            if (id) onClosed(id)
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className="border-r border-white/10 px-5 py-3 last:border-r-0 lg:px-6">
      <p className="text-xs text-white/60">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums', tone === 'warn' && 'text-amber-300')}>{value}</p>
    </div>
  )
}

function CountRow({ line, blind, onChange }: { line: InventoryLine; blind: boolean; onChange: (v: number | null) => void }) {
  const jours = daysUntil(line.peremption)
  const statut = expiryStatus(jours)
  const diff = line.compte === null ? null : line.compte - line.theorique
  const base = line.compte ?? (blind ? 0 : line.theorique)

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 transition-colors',
        line.compte !== null && (blind || diff === 0) && 'bg-emerald-50/40',
        !blind && diff !== null && diff !== 0 && 'bg-amber-50/60',
      )}
    >
      <div className="min-w-0 flex-1 basis-48">
        <p className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{line.lot}</span>
          <ExpiryBadge status={statut} jours={jours} />
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">Exp. {formatDate(line.peremption)}</p>
      </div>

      <div className="w-24 text-sm tabular-nums">
        <p className="text-xs text-muted-foreground">Théorique</p>
        <p className="font-medium">
          {blind ? <span className="text-muted-foreground">Masqué</span> : `${line.theorique} ${plural(line.unite, line.theorique)}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg bg-card ring-1 ring-inset ring-input focus-within:ring-2 focus-within:ring-ring">
          <button
            type="button"
            aria-label={`Diminuer le compte du lot ${line.lot}`}
            disabled={base <= 0 && line.compte !== null}
            onClick={() => onChange(Math.max(0, base - (line.compte === null && !blind ? 1 : line.compte === null ? 0 : 1)))}
            className="flex size-9 items-center justify-center rounded-l-lg hover:bg-muted disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={line.compte ?? ''}
            placeholder="—"
            aria-label={`Quantité comptée pour le lot ${line.lot}`}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            className="h-9 w-14 border-x border-input bg-transparent text-center text-base font-semibold tabular-nums [appearance:textfield] placeholder:text-muted-foreground focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label={`Augmenter le compte du lot ${line.lot}`}
            onClick={() => onChange(line.compte === null ? (blind ? 1 : line.theorique + 1) : line.compte + 1)}
            className="flex size-9 items-center justify-center rounded-r-lg hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {!blind && (
          <button
            type="button"
            onClick={() => onChange(line.theorique)}
            aria-label={`Lot ${line.lot} conforme au théorique`}
            title="Conforme au théorique"
            className={cn(
              'flex size-9 items-center justify-center rounded-lg ring-1 ring-inset transition-colors',
              diff === 0 ? 'bg-emerald-600 text-white ring-emerald-600' : 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50',
            )}
          >
            <Check className="size-4" />
          </button>
        )}
        {line.compte !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Effacer le compte du lot ${line.lot}`}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="ml-auto w-24 text-right">
        <VariancePill diff={diff} blind={blind} />
      </div>
    </li>
  )
}

function VariancePill({ diff, blind }: { diff: number | null; blind: boolean }) {
  if (diff === null)
    return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">À compter</span>
  if (blind)
    return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">Compté</span>
  if (diff === 0)
    return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">Conforme</span>
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset',
        diff > 0 ? 'bg-sky-50 text-sky-800 ring-sky-200' : 'bg-red-50 text-red-700 ring-red-200',
      )}
    >
      Écart {diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`}
    </span>
  )
}
