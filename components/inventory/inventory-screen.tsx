'use client'

import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useStock } from '@/lib/stock-store'
import { formatDate, TODAY_ISO } from '@/lib/stock-utils'
import { InventoryStart } from './inventory-start'
import { InventoryCount } from './inventory-count'
import { InventoryHistory } from './inventory-history'

export function InventoryScreen() {
  const { activeSession, sessions } = useStock()
  const [closedId, setClosedId] = useState<string | null>(null)
  const closed = sessions.find((s) => s.id === closedId) ?? null
  const closedEcarts = closed?.lines.filter((l) => l.compte !== l.theorique).length ?? 0

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#2a7a6e]">Gestion du stock</p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-[#0f2926] lg:text-3xl">Inventaires</h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Comptez physiquement chaque lot, rapprochez les écarts et ajustez le stock en une validation · {formatDate(TODAY_ISO)}
          </p>
        </div>
      </header>

      {closed && !activeSession && (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-inset ring-emerald-200">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
          <p className="flex-1">
            <span className="font-semibold">{closed.numero} validé.</span>{' '}
            {closedEcarts === 0
              ? 'Aucun écart : le stock théorique était conforme.'
              : `${closedEcarts} ${closedEcarts > 1 ? 'écarts ont été ajustés' : 'écart a été ajusté'} dans l’état du stock et tracé${closedEcarts > 1 ? 's' : ''} dans l’historique des mouvements.`}
          </p>
          <button type="button" onClick={() => setClosedId(null)} aria-label="Fermer" className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      {activeSession ? (
        <InventoryCount key={activeSession.id} session={activeSession} onClosed={setClosedId} />
      ) : (
        <>
          <InventoryStart />
          <InventoryHistory highlightId={closedId} />
        </>
      )}
    </div>
  )
}
