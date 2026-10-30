'use client'

import { useState } from 'react'
import { EyeOff, LayoutGrid, Play, Snowflake, Sun, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStock } from '@/lib/stock-store'
import { ZONES, type InventoryZone } from '@/lib/inventory-data'

const ZONE_ICON: Record<InventoryZone, typeof Sun> = {
  all: LayoutGrid,
  '15–25 °C': Sun,
  '2–8 °C': Thermometer,
  '≤ -20 °C': Snowflake,
}

const ZONE_TONE: Record<InventoryZone, string> = {
  all: 'bg-[#0f2926] text-white',
  '15–25 °C': 'bg-stone-100 text-stone-700',
  '2–8 °C': 'bg-sky-100 text-sky-800',
  '≤ -20 °C': 'bg-indigo-100 text-indigo-800',
}

export function InventoryStart() {
  const { views, sessions, startInventory } = useStock()
  const [zone, setZone] = useState<InventoryZone>('2–8 °C')
  const [blind, setBlind] = useState(false)

  const stats = (z: InventoryZone) => {
    const items = views.filter((a) => z === 'all' || a.conservation === z)
    const last = sessions
      .filter((s) => s.closedAt && (s.zone === z || s.zone === 'all'))
      .sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))[0]
    return { articles: items.length, lots: items.reduce((s, a) => s + a.lotsView.length, 0), last }
  }

  const selected = stats(zone)

  return (
    <section aria-labelledby="start-title" className="rounded-xl bg-card p-5 shadow-[0_1px_2px_rgba(15,41,38,0.06),0_4px_16px_-6px_rgba(15,41,38,0.12)] lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="start-title" className="text-base font-semibold">
            Nouvel inventaire
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choisissez la zone à compter. Le stock théorique est figé au démarrage.
          </p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="sr-only">Zone de stockage</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {ZONES.map((z) => {
            const Icon = ZONE_ICON[z.id]
            const s = stats(z.id)
            const checked = zone === z.id
            return (
              <label
                key={z.id}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 transition',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                  checked ? 'border-[#2a7a6e] bg-[#eef6f3] shadow-[inset_0_0_0_1px_#2a7a6e]' : 'hover:border-[#2a7a6e]/40 hover:bg-muted/40',
                )}
              >
                <input
                  type="radio"
                  name="zone"
                  value={z.id}
                  checked={checked}
                  onChange={() => setZone(z.id)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className={cn('flex size-9 items-center justify-center rounded-lg', ZONE_TONE[z.id])}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      'size-4 rounded-full border-2 transition',
                      checked ? 'border-[#2a7a6e] bg-[#2a7a6e] shadow-[inset_0_0_0_2px_white]' : 'border-input',
                    )}
                    aria-hidden
                  />
                </div>
                <div>
                  <p className="font-semibold">{z.label}</p>
                  <p className="text-xs text-muted-foreground">{z.lieu}</p>
                </div>
                <p className="mt-auto flex items-baseline gap-3 border-t border-dashed pt-3 text-xs text-muted-foreground tabular-nums">
                  <span>
                    <span className="text-base font-semibold text-foreground">{s.lots}</span> lots
                  </span>
                  <span>
                    <span className="text-base font-semibold text-foreground">{s.articles}</span> produits
                  </span>
                </p>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-col gap-4 border-t pt-5 md:flex-row md:items-center md:justify-between">
        <label className="flex cursor-pointer items-start gap-3">
          <span className="relative mt-0.5 inline-flex shrink-0">
            <input
              type="checkbox"
              role="switch"
              checked={blind}
              onChange={(e) => setBlind(e.target.checked)}
              className="peer sr-only"
            />
            <span className="h-5 w-9 rounded-full bg-input transition peer-checked:bg-[#2a7a6e] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
            <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
          </span>
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <EyeOff className="size-4 text-muted-foreground" aria-hidden />
              Comptage à l&apos;aveugle
            </span>
            <span className="block text-xs text-muted-foreground">
              Masque les quantités théoriques pendant le comptage, recommandé pour l’audit qualité.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {selected.last ? `Dernier comptage : ${selected.last.closedAt?.slice(8, 10)}/${selected.last.closedAt?.slice(5, 7)}/${selected.last.closedAt?.slice(0, 4)}` : 'Jamais inventorié'}
          </p>
          <button
            type="button"
            disabled={selected.lots === 0}
            onClick={() => startInventory(zone, blind)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <Play className="size-4" aria-hidden />
            Démarrer le comptage · {selected.lots} lots
          </button>
        </div>
      </div>
    </section>
  )
}
