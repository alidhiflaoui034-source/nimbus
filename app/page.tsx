import { AppSidebar } from '@/components/stock/app-sidebar'
import { StockScreen } from '@/components/stock/stock-screen'

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex min-w-0 flex-1">
        <StockScreen />
      </main>
    </div>
  )
}
