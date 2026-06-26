export default async function Page() {
  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">ISO Documents</h1>
          <p className="text-muted-foreground">
            Manage and view ISO compliance documents
          </p>
        </div>
      </div>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <div className="text-muted-foreground">
          ISO Documents content — accessible by Directors, Accounting, and Staffs roles.
        </div>
      </div>
    </>
  )
}
