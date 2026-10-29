import { Snowflake, Sun, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conservation } from '@/lib/stock-data'
import {
  EXPIRY_LABEL,
  STOCK_LABEL,
  formatJours,
  type ExpiryStatus,
  type StockStatus,
} from '@/lib/stock-utils'

export const STOCK_TONE: Record<StockStatus, { dot: string; pill: string; bar: string; stripe: string }> = {
  ok: {
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    bar: 'bg-emerald-500',
    stripe: 'bg-emerald-500',
  },
  bas: {
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-800 ring-amber-200',
    bar: 'bg-amber-500',
    stripe: 'bg-amber-500',
  },
  rupture: {
    dot: 'bg-red-600',
    pill: 'bg-red-50 text-red-700 ring-red-200',
    bar: 'bg-red-600',
    stripe: 'bg-red-600',
  },
}

export const EXPIRY_TONE: Record<ExpiryStatus, { pill: string; border: string; text: string }> = {
  perime: { pill: 'bg-red-600 text-white ring-red-600', border: 'border-l-red-600', text: 'text-red-700' },
  urgent: { pill: 'bg-orange-50 text-orange-800 ring-orange-300', border: 'border-l-orange-500', text: 'text-orange-700' },
  proche: { pill: 'bg-amber-50 text-amber-800 ring-amber-200', border: 'border-l-amber-400', text: 'text-amber-700' },
  ok: { pill: 'bg-slate-50 text-slate-600 ring-slate-200', border: 'border-l-emerald-500', text: 'text-muted-foreground' },
}

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  const tone = STOCK_TONE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        tone.pill,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', tone.dot)} aria-hidden />
      {STOCK_LABEL[status]}
    </span>
  )
}

export function ExpiryBadge({
  status,
  jours,
  showDays = true,
  className,
}: {
  status: ExpiryStatus
  jours?: number
  showDays?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap tabular-nums',
        EXPIRY_TONE[status].pill,
        className,
      )}
    >
      {EXPIRY_LABEL[status]}
      {showDays && jours !== undefined && (
        <span className="opacity-80">· {formatJours(jours)}</span>
      )}
    </span>
  )
}

const CONSERVATION_STYLE: Record<Conservation, { icon: typeof Sun; className: string; label: string }> = {
  '15–25 °C': { icon: Sun, className: 'bg-stone-50 text-stone-700 ring-stone-200', label: 'Ambiant' },
  '2–8 °C': { icon: Thermometer, className: 'bg-sky-50 text-sky-800 ring-sky-200', label: 'Réfrigéré' },
  '≤ -20 °C': { icon: Snowflake, className: 'bg-indigo-50 text-indigo-800 ring-indigo-200', label: 'Congelé' },
}

export function ConservationChip({ value, compact = false }: { value: Conservation; compact?: boolean }) {
  const style = CONSERVATION_STYLE[value]
  const Icon = style.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        style.className,
      )}
      title={style.label}
    >
      <Icon className="size-3.5" aria-hidden />
      {value}
      {!compact && <span className="sr-only">{` (${style.label})`}</span>}
    </span>
  )
}

export function StockGauge({
  value,
  seuil,
  cible,
  status,
  className,
}: {
  value: number
  seuil: number
  cible: number
  status: StockStatus
  className?: string
}) {
  const pct = Math.min(value / cible, 1) * 100
  const seuilPct = Math.min(seuil / cible, 1) * 100
  return (
    <div
      className={cn('relative h-1.5 w-full rounded-full bg-muted', className)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={cible}
      aria-valuenow={value}
      aria-label={`Stock ${value} sur ${cible} cible, seuil ${seuil}`}
    >
      <div className={cn('h-full rounded-full', STOCK_TONE[status].bar)} style={{ width: `${pct}%` }} />
      <span
        className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-foreground/50"
        style={{ left: `${seuilPct}%` }}
        aria-hidden
      />
    </div>
  )
}
