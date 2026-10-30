export type Conservation = '15–25 °C' | '2–8 °C' | '≤ -20 °C'
export type MouvementType = 'reception' | 'sortie' | 'retour' | 'rebut' | 'inventaire'

export type Lot = {
  numero: string
  peremption: string
  quantite: number
}

export type Mouvement = {
  id: string
  date: string
  type: MouvementType
  lot: string
  quantite: number
  personne: string
  motif?: string
}

export type Article = {
  id: string
  designation: string
  reference: string
  code: string
  categorie: string
  plateforme: string
  conservation: Conservation
  unite: string
  seuil: number
  cible: number
  lots: Lot[]
  mouvements: Mouvement[]
}

export const CURRENT_USER = 'ben ali D.'

let seq = 0
const m = (
  date: string,
  type: MouvementType,
  lot: string,
  quantite: number,
  personne: string,
): Mouvement => ({ id: `mv-${++seq}`, date, type, lot, quantite, personne })

export const ARTICLES: Article[] = [
  {
    id: 'bcid2',
    designation: 'BioFire BCID2 Panel',
    reference: 'RFIT-ASY-0147',
    code: 'BCID',
    categorie: 'PCR syndromique',
    plateforme: 'BioFire FilmArray',
    conservation: '15–25 °C',
    unite: 'coffret',
    seuil: 3,
    cible: 10,
    lots: [
      { numero: '5551444', peremption: '2026-11-01', quantite: 2 },
      { numero: '5562010', peremption: '2027-03-01', quantite: 4 },
    ],
    mouvements: [
      m('2026-10-29 10:42', 'sortie', '5551444', -1, 'ben ali D.'),
      m('2026-10-27 08:15', 'sortie', '5551444', -1, 'Trabelsi S.'),
      m('2026-10-21 14:03', 'reception', '5562010', 4, 'Gharbi M.'),
      m('2026-10-18 09:30', 'sortie', '5551444', -1, 'ben ali D.'),
      m('2026-10-12 11:20', 'retour', '5551444', 1, 'Mansouri H.'),
      m('2026-10-10 16:48', 'sortie', '5551444', -2, 'Mansouri H.'),
      m('2026-09-30 08:05', 'reception', '5551444', 6, 'Gharbi M.'),
    ],
  },
  {
    id: 'me',
    designation: 'BioFire ME Panel',
    reference: 'RFIT-ASY-0118',
    code: 'ME',
    categorie: 'PCR syndromique',
    plateforme: 'BioFire FilmArray',
    conservation: '15–25 °C',
    unite: 'coffret',
    seuil: 2,
    cible: 6,
    lots: [{ numero: '5549821', peremption: '2027-01-15', quantite: 1 }],
    mouvements: [
      m('2026-10-26 13:10', 'sortie', '5549821', -1, 'Trabelsi S.'),
      m('2026-10-14 09:02', 'sortie', '5549821', -1, 'ben ali D.'),
      m('2026-09-22 10:40', 'reception', '5549821', 3, 'Gharbi M.'),
    ],
  },
  {
    id: 'rp21',
    designation: 'BioFire Respiratory 2.1 Panel',
    reference: 'RFIT-ASY-0129',
    code: 'RP21',
    categorie: 'PCR syndromique',
    plateforme: 'BioFire FilmArray',
    conservation: '15–25 °C',
    unite: 'coffret',
    seuil: 4,
    cible: 12,
    lots: [{ numero: '5530077', peremption: '2026-10-20', quantite: 1 }],
    mouvements: [
      m('2026-10-19 15:22', 'sortie', '5530077', -2, 'Mansouri H.'),
      m('2026-10-08 08:40', 'sortie', '5530077', -3, 'ben ali D.'),
      m('2026-09-25 11:05', 'sortie', '5530077', -2, 'Trabelsi S.'),
      m('2026-08-30 09:15', 'reception', '5530077', 8, 'Gharbi M.'),
    ],
  },
  {
    id: 'aslo',
    designation: 'ASLO-Latex',
    reference: 'AGG-LTX-0032',
    code: 'ASLO',
    categorie: 'Agglutination / Latex',
    plateforme: 'Manuel',
    conservation: '2–8 °C',
    unite: 'paquet',
    seuil: 5,
    cible: 30,
    lots: [
      { numero: 'AAAAA01', peremption: '2026-11-01', quantite: 5 },
      { numero: 'AAAAB07', peremption: '2027-03-01', quantite: 20 },
    ],
    mouvements: [
      m('2026-10-30 08:20', 'sortie', 'AAAAA01', -1, 'ben ali D.'),
      m('2026-10-28 09:45', 'sortie', 'AAAAA01', -2, 'Trabelsi S.'),
      m('2026-10-24 10:10', 'reception', 'AAAAB07', 20, 'Gharbi M.'),
      m('2026-10-20 14:30', 'sortie', 'AAAAA01', -1, 'Mansouri H.'),
      m('2026-10-15 11:00', 'rebut', 'AAAAA01', -1, 'ben ali D.'),
      m('2026-10-02 08:30', 'reception', 'AAAAA01', 10, 'Gharbi M.'),
    ],
  },
  {
    id: 'brum',
    designation: 'Brucella melitensis',
    reference: 'AGG-BRU-0011',
    code: 'BRUM',
    categorie: 'Agglutination / Latex',
    plateforme: 'Manuel',
    conservation: '2–8 °C',
    unite: 'boîte',
    seuil: 2,
    cible: 6,
    lots: [{ numero: 'BM2404', peremption: '2026-11-22', quantite: 3 }],
    mouvements: [
      m('2026-10-25 10:00', 'sortie', 'BM2404', -1, 'Trabelsi S.'),
      m('2026-10-05 09:12', 'reception', 'BM2404', 4, 'Gharbi M.'),
    ],
  },
  {
    id: 'crp',
    designation: 'CRP-Latex',
    reference: 'AGG-LTX-0041',
    code: 'CRP',
    categorie: 'Agglutination / Latex',
    plateforme: 'Manuel',
    conservation: '2–8 °C',
    unite: 'kit',
    seuil: 3,
    cible: 8,
    lots: [{ numero: 'CR88120', peremption: '2027-06-30', quantite: 2 }],
    mouvements: [
      m('2026-10-29 16:05', 'sortie', 'CR88120', -1, 'Mansouri H.'),
      m('2026-10-22 08:50', 'sortie', 'CR88120', -1, 'ben ali D.'),
      m('2026-10-11 13:35', 'sortie', 'CR88120', -1, 'Trabelsi S.'),
      m('2026-09-28 10:20', 'reception', 'CR88120', 5, 'Gharbi M.'),
    ],
  },
  {
    id: 'widal',
    designation: 'Widal (Salmonella O/H)',
    reference: 'AGG-WID-0007',
    code: 'WIDAL',
    categorie: 'Agglutination / Latex',
    plateforme: 'Manuel',
    conservation: '2–8 °C',
    unite: 'boîte',
    seuil: 2,
    cible: 5,
    lots: [
      { numero: 'WD5512', peremption: '2026-10-25', quantite: 2 },
      { numero: 'WD5640', peremption: '2027-02-10', quantite: 4 },
    ],
    mouvements: [
      m('2026-10-23 09:40', 'sortie', 'WD5512', -1, 'ben ali D.'),
      m('2026-10-16 11:15', 'reception', 'WD5640', 4, 'Gharbi M.'),
      m('2026-10-09 10:05', 'retour', 'WD5512', 1, 'Trabelsi S.'),
      m('2026-10-03 14:20', 'sortie', 'WD5512', -2, 'Trabelsi S.'),
    ],
  },
  {
    id: 'mtbu',
    designation: 'Xpert MTB/RIF Ultra',
    reference: 'PCR-GXP-0203',
    code: 'MTBU',
    categorie: 'PCR cartouche',
    plateforme: 'GeneXpert',
    conservation: '15–25 °C',
    unite: 'boîte',
    seuil: 2,
    cible: 8,
    lots: [
      { numero: '1000392', peremption: '2026-11-05', quantite: 1 },
      { numero: '1000455', peremption: '2027-04-12', quantite: 3 },
    ],
    mouvements: [
      m('2026-10-28 08:10', 'sortie', '1000392', -1, 'Mansouri H.'),
      m('2026-10-19 09:55', 'reception', '1000455', 3, 'Gharbi M.'),
      m('2026-10-07 15:30', 'sortie', '1000392', -1, 'ben ali D.'),
    ],
  },
  {
    id: 'tqmm',
    designation: 'TaqPath RT-PCR Master Mix',
    reference: 'PCR-MMX-0090',
    code: 'TQMM',
    categorie: 'PCR temps réel',
    plateforme: 'QuantStudio 5',
    conservation: '≤ -20 °C',
    unite: 'kit',
    seuil: 2,
    cible: 6,
    lots: [{ numero: '2451187', peremption: '2026-12-10', quantite: 5 }],
    mouvements: [
      m('2026-10-24 13:00', 'sortie', '2451187', -1, 'Trabelsi S.'),
      m('2026-10-01 10:30', 'reception', '2451187', 6, 'Gharbi M.'),
    ],
  },
  {
    id: 'qdna',
    designation: 'QIAamp DNA Mini Kit',
    reference: 'EXT-QIA-0055',
    code: 'QDNA',
    categorie: 'Extraction ADN / ARN',
    plateforme: 'Manuel',
    conservation: '15–25 °C',
    unite: 'kit',
    seuil: 2,
    cible: 5,
    lots: [],
    mouvements: [
      m('2026-10-27 11:45', 'sortie', '0163254', -1, 'ben ali D.'),
      m('2026-10-13 09:20', 'sortie', '0163254', -2, 'Mansouri H.'),
      m('2026-09-15 10:00', 'reception', '0163254', 3, 'Gharbi M.'),
    ],
  },
  {
    id: 'rbt',
    designation: 'Rose Bengale',
    reference: 'AGG-RBT-0019',
    code: 'RBT',
    categorie: 'Agglutination / Latex',
    plateforme: 'Manuel',
    conservation: '2–8 °C',
    unite: 'boîte',
    seuil: 2,
    cible: 6,
    lots: [{ numero: 'RB7730', peremption: '2026-11-28', quantite: 2 }],
    mouvements: [
      m('2026-10-21 10:25', 'sortie', 'RB7730', -1, 'Trabelsi S.'),
      m('2026-10-06 08:45', 'reception', 'RB7730', 3, 'Gharbi M.'),
    ],
  },
]
