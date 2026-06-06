import { ChartAreaInteractive } from "@/modules/dashboard/components/chart-area-interactive"
import { DataTable } from "@/modules/dashboard/components/data-table"
import { SectionCards } from "@/modules/dashboard/components/section-cards"
import { getDashboardData } from "@/modules/dashboard/services/dashboard-services"

export default async function Page() {
  const { data, pastPerformanceData, keyPersonnelData, focusDocumentsData } =
    await getDashboardData()

  return (
    <>
      {/* Page Title and Description */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
      </div>
      <div className="@container/main">
        <DataTable
          data={data}
          pastPerformanceData={pastPerformanceData}
          keyPersonnelData={keyPersonnelData}
          focusDocumentsData={focusDocumentsData}
        />
      </div>
    </>
  )
}
