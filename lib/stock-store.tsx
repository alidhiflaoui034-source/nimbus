'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ARTICLES, CURRENT_USER, type Article, type Mouvement } from './stock-data'
import { INVENTORY_HISTORY, type InventoryLine, type InventorySession, type InventoryZone } from './inventory-data'
import { TODAY_ISO, toView, type ArticleView } from './stock-utils'

type LotTarget = { articleId: string; lot: string }

type StockStore = {
  articles: Article[]
  views: ArticleView[]
  sessions: InventorySession[]
  activeSession: InventorySession | null
  discardLots: (targets: LotTarget[]) => void
  exitLot: (articleId: string, lot: string, quantite: number, motif: string) => void
  startInventory: (zone: InventoryZone, blind: boolean) => void
  setCount: (key: string, value: number | null) => void
  markRemainingConform: () => void
  closeInventory: () => string | null
  cancelInventory: () => void
}

const StockContext = createContext<StockStore | null>(null)

const nowStamp = () => `${TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`
const moveId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(ARTICLES)
  const [sessions, setSessions] = useState<InventorySession[]>(INVENTORY_HISTORY)

  const views = useMemo(() => articles.map(toView), [articles])
  const activeSession = sessions.find((s) => s.closedAt === null) ?? null

  const discardLots = useCallback((targets: LotTarget[]) => {
    setArticles((prev) =>
      prev.map((a) => {
        const lots = targets.filter((t) => t.articleId === a.id).map((t) => t.lot)
        if (lots.length === 0) return a
        const removed = a.lots.filter((l) => lots.includes(l.numero))
        const moves: Mouvement[] = removed.map((l) => ({
          id: moveId('rebut'),
          date: nowStamp(),
          type: 'rebut',
          lot: l.numero,
          quantite: -l.quantite,
          personne: CURRENT_USER,
          motif: 'Lot périmé',
        }))
        return { ...a, lots: a.lots.filter((l) => !lots.includes(l.numero)), mouvements: [...moves, ...a.mouvements] }
      }),
    )
  }, [])

  const exitLot = useCallback((articleId: string, lot: string, quantite: number, motif: string) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id !== articleId) return a
        const target = a.lots.find((l) => l.numero === lot)
        if (!target) return a
        const qty = Math.min(Math.max(1, Math.floor(quantite)), target.quantite)
        return {
          ...a,
          lots: a.lots
            .map((l) => (l.numero === lot ? { ...l, quantite: l.quantite - qty } : l))
            .filter((l) => l.quantite > 0),
          mouvements: [
            { id: moveId('sortie'), date: nowStamp(), type: 'sortie', lot, quantite: -qty, personne: CURRENT_USER, motif },
            ...a.mouvements,
          ],
        }
      }),
    )
  }, [])

  const startInventory = useCallback(
    (zone: InventoryZone, blind: boolean) => {
      const lines: InventoryLine[] = views
        .filter((a) => zone === 'all' || a.conservation === zone)
        .sort((a, b) => a.designation.localeCompare(b.designation, 'fr'))
        .flatMap((a) =>
          a.lotsView.map((l) => ({
            key: `${a.id}-${l.numero}`,
            articleId: a.id,
            designation: a.designation,
            reference: a.reference,
            unite: a.unite,
            conservation: a.conservation,
            lot: l.numero,
            peremption: l.peremption,
            theorique: l.quantite,
            compte: null,
          })),
        )
      setSessions((prev) => {
        if (prev.some((s) => s.closedAt === null)) return prev
        const n = 9 + prev.length
        return [
          {
            id: `inv-${Date.now()}`,
            numero: `INV-${TODAY_ISO.slice(0, 4)}-${String(n).padStart(3, '0')}`,
            zone,
            blind,
            startedAt: nowStamp(),
            closedAt: null,
            by: CURRENT_USER,
            lines,
          },
          ...prev,
        ]
      })
    },
    [views],
  )

  const updateActive = useCallback((fn: (s: InventorySession) => InventorySession) => {
    setSessions((prev) => prev.map((s) => (s.closedAt === null ? fn(s) : s)))
  }, [])

  const setCount = useCallback(
    (key: string, value: number | null) =>
      updateActive((s) => ({
        ...s,
        lines: s.lines.map((l) => (l.key === key ? { ...l, compte: value === null ? null : Math.max(0, Math.floor(value)) } : l)),
      })),
    [updateActive],
  )

  const markRemainingConform = useCallback(
    () => updateActive((s) => ({ ...s, lines: s.lines.map((l) => (l.compte === null ? { ...l, compte: l.theorique } : l)) })),
    [updateActive],
  )

  const closeInventory = useCallback(() => {
    const session = activeSession
    if (!session || session.lines.some((l) => l.compte === null)) return null
    const stamp = nowStamp()
    setArticles((prev) =>
      prev.map((a) => {
        const lines = session.lines.filter((l) => l.articleId === a.id)
        if (lines.length === 0) return a
        const moves: Mouvement[] = []
        const lots = a.lots
          .map((lot) => {
            const counted = lines.find((l) => l.lot === lot.numero)
            if (!counted || counted.compte === null) return lot
            const delta = counted.compte - lot.quantite
            if (delta !== 0) {
              moves.push({
                id: moveId('inv'),
                date: stamp,
                type: 'inventaire',
                lot: lot.numero,
                quantite: delta,
                personne: CURRENT_USER,
                motif: session.numero,
              })
            }
            return { ...lot, quantite: counted.compte }
          })
          .filter((l) => l.quantite > 0)
        return moves.length ? { ...a, lots, mouvements: [...moves, ...a.mouvements] } : { ...a, lots }
      }),
    )
    setSessions((prev) => prev.map((s) => (s.id === session.id ? { ...s, closedAt: stamp } : s)))
    return session.id
  }, [activeSession])

  const cancelInventory = useCallback(() => setSessions((prev) => prev.filter((s) => s.closedAt !== null)), [])

  const value = useMemo<StockStore>(
    () => ({
      articles,
      views,
      sessions,
      activeSession,
      discardLots,
      exitLot,
      startInventory,
      setCount,
      markRemainingConform,
      closeInventory,
      cancelInventory,
    }),
    [articles, views, sessions, activeSession, discardLots, exitLot, startInventory, setCount, markRemainingConform, closeInventory, cancelInventory],
  )

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>
}

export function useStock() {
  const ctx = useContext(StockContext)
  if (!ctx) throw new Error('useStock must be used within StockProvider')
  return ctx
}
