import type { Metadata } from 'next'
import { InventoryScreen } from '@/components/inventory/inventory-screen'

export const metadata: Metadata = {
  title: 'Inventaires',
  description: 'Comptage physique des lots par zone de stockage, rapprochement des écarts et ajustement du stock.',
}

export default function InventoriesPage() {
  return <InventoryScreen />
}
