export default async function Page() {
  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard 3</h1>
          <p className="text-muted-foreground">
            Financial overview and reporting dashboard
          </p>
        </div>
      </div>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <div className="text-muted-foreground">
          Dashboard 3 content — accessible by Directors and Accounting roles.
        </div>
      </div>
    </>
  )
}
