'use client'

import { ChevronDown, LayoutGrid, Rows3, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'table' | 'cards'

export type Filters = {
  query: string
  categorie: string
  plateforme: string
  conservation: string
  statut: string
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  categorie: '',
  plateforme: '',
  conservation: '',
  statut: '',
}

type Options = { categories: string[]; plateformes: string[]; conservations: string[] }

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 appearance-none rounded-lg border bg-card pl-3 pr-9 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          value ? 'border-[#2a7a6e] bg-[#f2f8f6] font-medium text-[#0f2926]' : 'border-input text-foreground',
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </label>
  )
}

export function StockToolbar({
  filters,
  onChange,
  options,
  view,
  onViewChange,
  resultCount,
  onReset,
  hasActiveFilters,
}: {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  options: Options
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  resultCount: number
  onReset: () => void
  hasActiveFilters: boolean
}) {
  const toOpts = (list: string[]) => list.map((v) => ({ value: v, label: v }))

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)]">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Rechercher</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Rechercher un produit, une référence, un code ou un n° de lot…"
            className="h-10 w-full rounded-lg border border-input bg-muted/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <FilterSelect
          label="Catégorie"
          value={filters.categorie}
          onChange={(v) => onChange({ categorie: v })}
          options={toOpts(options.categories)}
        />
        <FilterSelect
          label="Plateforme"
          value={filters.plateforme}
          onChange={(v) => onChange({ plateforme: v })}
          options={toOpts(options.plateformes)}
        />
        <FilterSelect
          label="Conservation"
          value={filters.conservation}
          onChange={(v) => onChange({ conservation: v })}
          options={toOpts(options.conservations)}
        />
        <FilterSelect
          label="Statut"
          value={filters.statut}
          onChange={(v) => onChange({ statut: v })}
          options={[
            { value: 'ok', label: 'En stock' },
            { value: 'bas', label: 'Stock bas' },
            { value: 'rupture', label: 'Rupture' },
          ]}
        />

        <div
          role="radiogroup"
          aria-label="Mode d’affichage"
          className="ml-auto flex h-10 items-center rounded-lg bg-muted p-1 ring-1 ring-inset ring-border"
        >
          {(
            [
              { key: 'table', label: 'Tableau', icon: Rows3 },
              { key: 'cards', label: 'Cartes', icon: LayoutGrid },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={view === key}
              onClick={() => onViewChange(key)}
              className={cn(
                'flex h-full items-center gap-1.5 rounded-md px-3 text-sm font-medium transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                view === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              Vue {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-sm">
        <p className="text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground tabular-nums">{resultCount}</span>{' '}
          {resultCount > 1 ? 'produits affichés' : 'produit affiché'}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-[#2a7a6e] hover:bg-accent"
          >
            <X className="size-3.5" aria-hidden />
            Effacer les filtres
          </button>
        )}
      </div>
    </div>
  )
}
