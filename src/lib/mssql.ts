import sql, { type ConnectionPool } from "mssql"

let poolPromise: Promise<ConnectionPool> | undefined

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

export function getMssqlPool() {
  if (!poolPromise) {
    const port = Number(process.env.MSSQL_PORT ?? 1433)

    if (!Number.isInteger(port) || port <= 0) {
      throw new Error("MSSQL_PORT must be a valid port number")
    }

    const pool = new sql.ConnectionPool({
      server: getRequiredEnv("MSSQL_HOST"),
      port,
      user: getRequiredEnv("MSSQL_USERNAME"),
      password: getRequiredEnv("MSSQL_PASSWORD"),
      database: getRequiredEnv("MSSQL_DATABASE"),
      connectionTimeout: 15000,
      requestTimeout: 30000,
      pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 5000,
      },
      options: {
        encrypt: true,
        trustServerCertificate:
          process.env.MSSQL_TRUST_SERVER_CERTIFICATE === "true",
      },
    })

    pool.on("error", (error) => {
      console.error("MSSQL connection pool error:", error)
    })

    poolPromise = pool.connect().catch((error) => {
      poolPromise = undefined
      throw error
    })
  }

  return poolPromise
}
