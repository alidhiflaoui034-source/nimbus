'use client'

import { useEffect } from 'react'
import { AlarmClock, CheckCircle2, Trash2, TriangleAlert, X } from 'lucide-react'
import { formatDate, formatJours, plural, type ArticleView } from '@/lib/stock-utils'

export function ExpiredLotsDialog({
  articles,
  onClose,
  onDiscard,
  onDiscardAll,
  onOpenArticle,
}: {
  articles: ArticleView[]
  onClose: () => void
  onDiscard: (articleId: string, lot: string) => void
  onDiscardAll: () => void
  onOpenArticle: (id: string) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const expired = articles.flatMap((a) => a.lotsPerimes.map((lot) => ({ article: a, lot })))
  const urgent = articles.flatMap((a) =>
    a.lotsView.filter((l) => l.statut === 'urgent').map((lot) => ({ article: a, lot })),
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2926]/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expired-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="flex gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-red-600 text-white">
              <TriangleAlert className="size-5" aria-hidden />
            </span>
            <div>
              <h2 id="expired-title" className="text-lg font-semibold">
                Gestion des lots périmés
              </h2>
              <p className="text-sm text-muted-foreground">
                Retirez les lots périmés du stock et anticipez ceux qui expirent cette semaine.
              </p>
            </div>
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
          <h3 className="text-sm font-semibold text-red-700">Périmés ({expired.length})</h3>
          {expired.length === 0 ? (
            <p className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="size-4" aria-hidden /> Aucun lot périmé dans le stock.
            </p>
          ) : (
            <ul className="mt-2 divide-y rounded-lg border">
              {expired.map(({ article, lot }) => (
                <li key={`${article.id}-${lot.numero}`} className="flex items-center justify-between gap-4 px-4 py-3">
                  <button type="button" onClick={() => onOpenArticle(article.id)} className="min-w-0 text-left">
                    <p className="truncate text-sm font-medium hover:underline">{article.designation}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Lot <span className="font-mono">{lot.numero}</span> · {lot.quantite}{' '}
                      {plural(article.unite, lot.quantite)} · exp. {formatDate(lot.peremption)} (
                      {formatJours(lot.jours)})
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDiscard(article.id, lot.numero)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Mettre au rebut
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-orange-700">
            <AlarmClock className="size-4" aria-hidden /> Expirent sous 7 jours ({urgent.length})
          </h3>
          <ul className="mt-2 divide-y rounded-lg border">
            {urgent.map(({ article, lot }) => (
              <li key={`${article.id}-${lot.numero}`}>
                <button
                  type="button"
                  onClick={() => onOpenArticle(article.id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{article.designation}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      Lot <span className="font-mono">{lot.numero}</span> · {lot.quantite}{' '}
                      {plural(article.unite, lot.quantite)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-orange-700 tabular-nums">
                    {formatJours(lot.jours)}
                  </span>
                </button>
              </li>
            ))}
            {urgent.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">Aucun lot concerné.</li>}
          </ul>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t bg-muted/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Fermer
          </button>
          <button
            type="button"
            disabled={expired.length === 0}
            onClick={onDiscardAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden />
            Tout mettre au rebut
          </button>
        </footer>
      </div>
    </div>
  )
}
