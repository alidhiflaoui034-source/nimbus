import type { Article, Lot } from './stock-data'

export const TODAY_ISO = '2026-10-30'
const DAY = 86_400_000

export type StockStatus = 'ok' | 'bas' | 'rupture'
export type ExpiryStatus = 'perime' | 'urgent' | 'proche' | 'ok'

export type LotView = Lot & { jours: number; statut: ExpiryStatus }

export type ArticleView = Article & {
  lotsView: LotView[]
  utilisable: number
  stockStatut: StockStatus
  prochain: LotView | null
  lotsPerimes: LotView[]
}

export function daysUntil(iso: string) {
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${TODAY_ISO}T00:00:00Z`)) / DAY)
}

export function expiryStatus(days: number): ExpiryStatus {
  if (days < 0) return 'perime'
  if (days <= 7) return 'urgent'
  if (days <= 30) return 'proche'
  return 'ok'
}

export function stockStatus(qty: number, seuil: number): StockStatus {
  if (qty <= 0) return 'rupture'
  if (qty <= seuil) return 'bas'
  return 'ok'
}

export function toView(article: Article): ArticleView {
  const lotsView = article.lots
    .map((lot) => {
      const jours = daysUntil(lot.peremption)
      return { ...lot, jours, statut: expiryStatus(jours) }
    })
    .sort((a, b) => a.peremption.localeCompare(b.peremption))
  const utilisable = lotsView.filter((l) => l.statut !== 'perime').reduce((s, l) => s + l.quantite, 0)
  return {
    ...article,
    lotsView,
    utilisable,
    stockStatut: stockStatus(utilisable, article.seuil),
    prochain: lotsView[0] ?? null,
    lotsPerimes: lotsView.filter((l) => l.statut === 'perime'),
  }
}

export function formatDate(iso: string) {
  const [y, mo, d] = iso.slice(0, 10).split('-')
  return `${d}/${mo}/${y}`
}

export function formatDateTime(value: string) {
  const [date, time] = value.split(' ')
  return { date: formatDate(date), time }
}

export function plural(unit: string, qty: number) {
  return Math.abs(qty) > 1 ? `${unit}s` : unit
}

export function formatJours(jours: number) {
  if (jours < 0) return `il y a ${Math.abs(jours)} j`
  if (jours === 0) return "aujourd'hui"
  return `${jours} j`
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  ok: 'En stock',
  bas: 'Stock bas',
  rupture: 'Rupture',
}

export const EXPIRY_LABEL: Record<ExpiryStatus, string> = {
  perime: 'Périmé',
  urgent: 'Urgent',
  proche: 'Proche',
  ok: 'OK',
}
