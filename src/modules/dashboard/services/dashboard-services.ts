import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { dashboardMockData } from "./dashboard-mock-data"

export async function getDashboardData() {
  const [data, pastPerformanceData, keyPersonnelData, focusDocumentsData] =
    await Promise.all([
      getFirestoreCollection("dashboardRows", dashboardMockData.data),
      getFirestoreCollection("pastPerformances", dashboardMockData.pastPerformanceData),
      getFirestoreCollection("keyPersonnel", dashboardMockData.keyPersonnelData),
      getFirestoreCollection("focusDocuments", dashboardMockData.focusDocumentsData),
    ])

  return {
    data,
    pastPerformanceData,
    keyPersonnelData,
    focusDocumentsData,
  }
}
