'use client'

import { useEffect, useState } from 'react'
import { ArrowUpFromLine, Info, Minus, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatJours, plural, type ArticleView } from '@/lib/stock-utils'
import { EXPIRY_TONE, ExpiryBadge } from './status'

const MOTIFS = ['Analyses patients', 'Contrôle qualité', 'Transfert de service', 'Autre']

export function QuickExitDialog({
  article,
  onClose,
  onConfirm,
}: {
  article: ArticleView
  onClose: () => void
  onConfirm: (lot: string, quantite: number, motif: string) => void
}) {
  const usable = article.lotsView.filter((l) => l.statut !== 'perime')
  const [lotNumero, setLotNumero] = useState(usable[0]?.numero ?? '')
  const [qty, setQty] = useState(1)
  const [motif, setMotif] = useState(MOTIFS[0])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const lot = usable.find((l) => l.numero === lotNumero)
  const max = lot?.quantite ?? 0
  const notFefo = lot && usable[0] && lot.numero !== usable[0].numero
  const valid = lot && qty >= 1 && qty <= max

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (valid) onConfirm(lot.numero, qty, motif)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f2926]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="flex min-w-0 gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
              <ArrowUpFromLine className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="exit-title" className="text-base font-semibold">
                Sortie rapide
              </h2>
              <p className="truncate text-sm text-muted-foreground">{article.designation}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </header>

        {usable.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Aucun lot utilisable pour ce produit. Une réception est nécessaire.
          </p>
        ) : (
          <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
            <fieldset>
              <legend className="text-sm font-medium">Lot</legend>
              <div className="mt-2 flex flex-col gap-2">
                {usable.map((l, i) => {
                  const checked = l.numero === lotNumero
                  return (
                    <label
                      key={l.numero}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border border-l-4 px-3 py-2.5 transition-colors',
                        EXPIRY_TONE[l.statut].border,
                        checked ? 'border-[#2a7a6e] bg-[#eef6f3]' : 'hover:bg-muted/60',
                      )}
                    >
                      <input
                        type="radio"
                        name="lot"
                        value={l.numero}
                        checked={checked}
                        onChange={() => {
                          setLotNumero(l.numero)
                          setQty((q) => Math.min(q, l.quantite))
                        }}
                        className="size-4 accent-[#2a7a6e]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">{l.numero}</span>
                          {i === 0 && (
                            <span className="rounded bg-[#0f2926] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              FEFO
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          Exp. {formatDate(l.peremption)} ({formatJours(l.jours)}) · {l.quantite}{' '}
                          {plural(article.unite, l.quantite)}
                        </span>
                      </span>
                      <ExpiryBadge status={l.statut} showDays={false} />
                    </label>
                  )
                })}
              </div>
              {notFefo && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
                  <Info className="mt-px size-3.5 shrink-0" aria-hidden />
                  Ce lot n&apos;est pas le premier à expirer. La règle FEFO recommande le lot {usable[0].numero}.
                </p>
              )}
            </fieldset>

            <div>
              <label htmlFor="exit-qty" className="text-sm font-medium">
                Quantité
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-lg ring-1 ring-inset ring-input">
                  <button
                    type="button"
                    aria-label="Diminuer la quantité"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex size-10 items-center justify-center rounded-l-lg hover:bg-muted disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    id="exit-qty"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={max}
                    value={qty}
                    autoFocus
                    onChange={(e) => setQty(Math.floor(Number(e.target.value) || 0))}
                    className="h-10 w-14 border-x border-input bg-transparent text-center text-base font-semibold tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    aria-label="Augmenter la quantité"
                    disabled={qty >= max}
                    onClick={() => setQty((q) => Math.min(max, q + 1))}
                    className="flex size-10 items-center justify-center rounded-r-lg hover:bg-muted disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {plural(article.unite, qty)} · max {max}
                </span>
              </div>
              {qty > max && <p className="mt-1.5 text-xs text-red-700">Quantité supérieure au stock du lot.</p>}
            </div>

            <fieldset>
              <legend className="text-sm font-medium">Motif</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOTIFS.map((m) => (
                  <label
                    key={m}
                    className={cn(
                      'cursor-pointer rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                      motif === m ? 'bg-[#0f2926] text-white ring-[#0f2926]' : 'ring-input hover:bg-muted',
                    )}
                  >
                    <input
                      type="radio"
                      name="motif"
                      value={m}
                      checked={motif === m}
                      onChange={() => setMotif(m)}
                      className="sr-only"
                    />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        <footer className="flex items-center justify-between gap-3 border-t bg-muted/50 px-5 py-4">
          {lot ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              Reste après sortie : <span className="font-semibold text-foreground">{Math.max(0, article.utilisable - qty)}</span>{' '}
              {plural(article.unite, article.utilisable - qty)}
            </p>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!valid}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <ArrowUpFromLine className="size-4" aria-hidden />
              Valider la sortie
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
