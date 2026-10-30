'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, PackageSearch, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStock } from '@/lib/stock-store'
import { TODAY_ISO, formatDate, plural, STOCK_LABEL } from '@/lib/stock-utils'
import { QuickExitDialog } from './quick-exit-dialog'
import { SummaryStrip, type QuickFilter } from './summary-strip'
import { EMPTY_FILTERS, StockToolbar, type Filters, type ViewMode } from './stock-toolbar'
import { StockTable } from './stock-table'
import { StockCards } from './stock-cards'
import { StockDetailPanel } from './stock-detail-panel'
import { ExpiredLotsDialog } from './expired-lots-dialog'

const uniq = (list: string[]) => [...new Set(list)].sort((a, b) => a.localeCompare(b, 'fr'))

export function StockScreen() {
  const { views, discardLots, exitLot } = useStock()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [quick, setQuick] = useState<QuickFilter>('all')
  const [view, setView] = useState<ViewMode>('table')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expiredOpen, setExpiredOpen] = useState(false)
  const [exitId, setExitId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const exitArticle = views.find((a) => a.id === exitId) ?? null

  const options = useMemo(
    () => ({
      categories: uniq(views.map((a) => a.categorie)),
      plateformes: uniq(views.map((a) => a.plateforme)),
      conservations: ['15–25 °C', '2–8 °C', '≤ -20 °C'],
    }),
    [views],
  )

  const counts = useMemo<Record<QuickFilter, number>>(
    () => ({
      all: views.length,
      rupture: views.filter((a) => a.stockStatut === 'rupture').length,
      bas: views.filter((a) => a.stockStatut === 'bas').length,
      urgent: views.filter((a) => a.lotsView.some((l) => l.statut === 'urgent')).length,
      perime: views.filter((a) => a.lotsPerimes.length > 0).length,
    }),
    [views],
  )

  const expiredLotCount = views.reduce((s, a) => s + a.lotsPerimes.length, 0)

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    const severity = { rupture: 0, bas: 1, ok: 2 }
    return views
      .filter((a) => {
        if (q) {
          const haystack = [a.designation, a.reference, a.code, ...a.lotsView.map((l) => l.numero)]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        if (filters.categorie && a.categorie !== filters.categorie) return false
        if (filters.plateforme && a.plateforme !== filters.plateforme) return false
        if (filters.conservation && a.conservation !== filters.conservation) return false
        if (filters.statut && a.stockStatut !== filters.statut) return false
        if (quick === 'rupture' && a.stockStatut !== 'rupture') return false
        if (quick === 'bas' && a.stockStatut !== 'bas') return false
        if (quick === 'urgent' && !a.lotsView.some((l) => l.statut === 'urgent')) return false
        if (quick === 'perime' && a.lotsPerimes.length === 0) return false
        return true
      })
      .sort(
        (a, b) =>
          severity[a.stockStatut] - severity[b.stockStatut] ||
          (a.prochain?.jours ?? 9999) - (b.prochain?.jours ?? 9999),
      )
  }, [views, filters, quick])

  const selected = views.find((a) => a.id === selectedId) ?? null
  const hasActiveFilters = quick !== 'all' || Object.values(filters).some(Boolean)

  function exportCsv() {
    const header = ['Désignation', 'Référence', 'Code', 'Catégorie', 'Plateforme', 'Conservation', 'Stock utilisable', 'Unité', 'Seuil min', 'Stock cible', 'Statut', 'Prochaine péremption', 'Jours restants']
    const rows = filtered.map((a) => [
      a.designation, a.reference, a.code, a.categorie, a.plateforme, a.conservation,
      a.utilisable, a.unite, a.seuil, a.cible, STOCK_LABEL[a.stockStatut],
      a.prochain ? formatDate(a.prochain.peremption) : '', a.prochain?.jours ?? '',
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `etat-du-stock-${TODAY_ISO}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const listProps = {
    items: filtered,
    selectedId,
    onSelect: (id: string) => setSelectedId((cur) => (cur === id ? null : id)),
    compact: Boolean(selected),
    onQuickExit: setExitId,
  }

  return (
    <div className="flex min-w-0 flex-1 gap-6 p-6 lg:p-8">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#2a7a6e]">Gestion du stock</p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-[#0f2926] lg:text-3xl">
              État du stock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Situation au {formatDate(TODAY_ISO)} · Stock utilisable hors lots périmés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-card px-4 text-sm font-medium shadow-sm ring-1 ring-inset ring-border hover:bg-muted"
            >
              <Download className="size-4" aria-hidden />
              Exporter
            </button>
            <button
              type="button"
              onClick={() => setExpiredOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <TriangleAlert className="size-4 text-orange-300" aria-hidden />
              Gérer les lots périmés
              {expiredLotCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-xs font-semibold tabular-nums">
                  {expiredLotCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <SummaryStrip counts={counts} active={quick} onChange={setQuick} />

        <StockToolbar
          filters={filters}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          options={options}
          view={view}
          onViewChange={setView}
          resultCount={filtered.length}
          hasActiveFilters={hasActiveFilters}
          onReset={() => {
            setFilters(EMPTY_FILTERS)
            setQuick('all')
          }}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-card px-6 py-16 text-center shadow-sm">
            <PackageSearch className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">Aucun produit ne correspond</p>
            <p className="text-sm text-muted-foreground">Modifiez la recherche ou effacez les filtres.</p>
          </div>
        ) : view === 'table' ? (
          <StockTable {...listProps} />
        ) : (
          <StockCards {...listProps} />
        )}
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 z-30 bg-[#0f2926]/30 xl:hidden"
            onClick={() => setSelectedId(null)}
            aria-hidden
          />
          <aside
            className={cn(
              'fixed inset-y-3 right-3 z-40 w-[min(420px,calc(100vw-1.5rem))] animate-in slide-in-from-right-4 fade-in duration-200',
              'xl:sticky xl:inset-auto xl:top-8 xl:z-auto xl:h-[calc(100vh-4rem)] xl:w-[400px] xl:shrink-0 2xl:w-[440px]',
            )}
          >
            <StockDetailPanel
              key={selected.id}
              article={selected}
              onClose={() => setSelectedId(null)}
              onDiscard={(articleId, lot) => discardLots([{ articleId, lot }])}
              onQuickExit={() => setExitId(selected.id)}
            />
          </aside>
        </>
      )}

      {expiredOpen && (
        <ExpiredLotsDialog
          articles={views}
          onClose={() => setExpiredOpen(false)}
          onDiscard={(articleId, lot) => discardLots([{ articleId, lot }])}
          onDiscardAll={() =>
            discardLots(views.flatMap((a) => a.lotsPerimes.map((l) => ({ articleId: a.id, lot: l.numero }))))
          }
          onOpenArticle={(id) => {
            setSelectedId(id)
            setExpiredOpen(false)
          }}
        />
      )}

      {exitArticle && (
        <QuickExitDialog
          key={exitArticle.id}
          article={exitArticle}
          onClose={() => setExitId(null)}
          onConfirm={(lot, qty, motif) => {
            exitLot(exitArticle.id, lot, qty, motif)
            setExitId(null)
            setToast(`Sortie enregistrée : ${qty} ${plural(exitArticle.unite, qty)} · ${exitArticle.designation} · lot ${lot}`)
          }}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        {toast && (
          <div className="pointer-events-auto flex max-w-lg items-center gap-3 rounded-xl bg-[#0f2926] px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-300" aria-hidden />
            <span className="min-w-0">{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Fermer la notification"
              className="ml-1 rounded p-0.5 text-white/70 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
