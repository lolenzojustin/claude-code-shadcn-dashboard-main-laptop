import { NextResponse } from "next/server"

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

export async function GET() {
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
    console.error("GET /api/products error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy danh sách sản phẩm từ MSSQL",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
