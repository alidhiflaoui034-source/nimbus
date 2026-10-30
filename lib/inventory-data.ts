import type { Conservation } from './stock-data'

export type InventoryZone = 'all' | Conservation

export const ZONES: { id: InventoryZone; label: string; lieu: string }[] = [
  { id: 'all', label: 'Inventaire complet', lieu: 'Tous les emplacements' },
  { id: '15–25 °C', label: 'Ambiant', lieu: 'Armoires réactifs · 15–25 °C' },
  { id: '2–8 °C', label: 'Réfrigéré', lieu: 'Réfrigérateurs · 2–8 °C' },
  { id: '≤ -20 °C', label: 'Congelé', lieu: 'Congélateur · ≤ -20 °C' },
]

export function zoneLabel(zone: InventoryZone) {
  return ZONES.find((z) => z.id === zone)?.label ?? zone
}

export type InventoryLine = {
  key: string
  articleId: string
  designation: string
  reference: string
  unite: string
  conservation: Conservation
  lot: string
  peremption: string
  theorique: number
  compte: number | null
}

export type InventorySession = {
  id: string
  numero: string
  zone: InventoryZone
  blind: boolean
  startedAt: string
  closedAt: string | null
  by: string
  lines: InventoryLine[]
}

const line = (
  articleId: string,
  designation: string,
  reference: string,
  unite: string,
  conservation: Conservation,
  lot: string,
  peremption: string,
  theorique: number,
  compte: number,
): InventoryLine => ({
  key: `${articleId}-${lot}`,
  articleId,
  designation,
  reference,
  unite,
  conservation,
  lot,
  peremption,
  theorique,
  compte,
})

export const INVENTORY_HISTORY: InventorySession[] = [
  {
    id: 'inv-010',
    numero: 'INV-2026-010',
    zone: '2–8 °C',
    blind: true,
    startedAt: '2026-10-01 08:30',
    closedAt: '2026-10-01 09:12',
    by: 'Trabelsi S.',
    lines: [
      line('aslo', 'ASLO-Latex', 'AGG-LTX-0032', 'paquet', '2–8 °C', 'AAAAA01', '2026-11-01', 10, 10),
      line('brum', 'Brucella melitensis', 'AGG-BRU-0011', 'boîte', '2–8 °C', 'BM2404', '2026-11-22', 4, 4),
      line('crp', 'CRP-Latex', 'AGG-LTX-0041', 'kit', '2–8 °C', 'CR88120', '2027-06-30', 5, 5),
      line('widal', 'Widal (Salmonella O/H)', 'AGG-WID-0007', 'boîte', '2–8 °C', 'WD5512', '2026-10-25', 3, 2),
      line('rbt', 'Rose Bengale', 'AGG-RBT-0019', 'boîte', '2–8 °C', 'RB7730', '2026-11-28', 3, 3),
    ],
  },
  {
    id: 'inv-009',
    numero: 'INV-2026-009',
    zone: 'all',
    blind: false,
    startedAt: '2026-09-01 14:05',
    closedAt: '2026-09-01 15:40',
    by: 'ben ali D.',
    lines: [
      line('bcid2', 'BioFire BCID2 Panel', 'RFIT-ASY-0147', 'coffret', '15–25 °C', '5540312', '2026-09-15', 3, 3),
      line('rp21', 'BioFire Respiratory 2.1 Panel', 'RFIT-ASY-0129', 'coffret', '15–25 °C', '5530077', '2026-10-20', 8, 8),
      line('mtbu', 'Xpert MTB/RIF Ultra', 'PCR-GXP-0203', 'boîte', '15–25 °C', '1000392', '2026-11-05', 3, 3),
      line('qdna', 'QIAamp DNA Mini Kit', 'EXT-QIA-0055', 'kit', '15–25 °C', '0150912', '2026-12-01', 2, 2),
      line('aslo', 'ASLO-Latex', 'AGG-LTX-0032', 'paquet', '2–8 °C', 'AAAAA00', '2026-10-01', 4, 5),
      line('crp', 'CRP-Latex', 'AGG-LTX-0041', 'kit', '2–8 °C', 'CR87001', '2026-12-15', 2, 2),
      line('tqmm', 'TaqPath RT-PCR Master Mix', 'PCR-MMX-0090', 'kit', '≤ -20 °C', '2440950', '2026-09-30', 2, 1),
    ],
  },
]
