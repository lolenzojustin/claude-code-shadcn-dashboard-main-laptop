import { NextRequest, NextResponse } from "next/server"

import { getMssqlPool } from "@/lib/mssql"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.QUERY_API_TOKEN

  if (!expectedToken) {
    console.error("QUERY_API_TOKEN is not configured")

    return NextResponse.json(
      {
        success: false,
        message: "API token is not configured",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }

  const token = request.nextUrl.searchParams.get("token")

  if (!token || token !== expectedToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Cache-Control": "no-store",
        },
      }
    )
  }

  try {
    const pool = await getMssqlPool()
    const result = await pool.request().query(`
      SELECT *
      FROM [Production].[Product]
    `)

    return NextResponse.json(
      {
        success: true,
        data: result.recordset,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    console.error("GET /api/query error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Không thể truy vấn dữ liệu từ MSSQL",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
