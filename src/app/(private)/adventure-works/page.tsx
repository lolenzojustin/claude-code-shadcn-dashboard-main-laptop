import { headers } from "next/headers"
import {
  BadgeDollarSign,
  Boxes,
  CircleAlert,
  Package,
  Palette,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProductDataTable } from "@/modules/adventure-works/components/product-data-table"
import type { AdventureWorksProduct } from "@/modules/adventure-works/types/product"

export const dynamic = "force-dynamic"

interface ProductsApiResponse {
  success: boolean
  data?: AdventureWorksProduct[]
  message?: string
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

async function getProducts() {
  const token = process.env.QUERY_API_TOKEN

  if (!token) {
    throw new Error("QUERY_API_TOKEN chưa được cấu hình")
  }

  const requestHeaders = await headers()
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")

  if (!host) {
    throw new Error("Không xác định được host của ứng dụng")
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https")
  const url = new URL("/api/query", `${protocol}://${host}`)
  url.searchParams.set("token", token)

  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
  const payload = (await response.json()) as ProductsApiResponse

  if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
    throw new Error(payload.message ?? "Không thể tải danh sách hàng hóa")
  }

  return payload.data
}

export default async function AdventureWorksPage() {
  let products: AdventureWorksProduct[] = []
  let errorMessage: string | null = null

  try {
    products = await getProducts()
  } catch (error) {
    console.error("Adventure Works products error:", error)
    errorMessage =
      error instanceof Error
        ? error.message
        : "Không thể tải danh sách hàng hóa"
  }

  const finishedGoods = products.filter(
    (product) => product.FinishedGoodsFlag
  ).length
  const averageListPrice = products.length
    ? products.reduce((sum, product) => sum + product.ListPrice, 0) /
      products.length
    : 0
  const colors = new Set(
    products.map((product) => product.Color).filter(Boolean)
  ).size

  return (
    <div className="flex-1 space-y-6 overflow-auto p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AdventureWorks Products
        </h1>
        <p className="text-muted-foreground mt-1">
          Danh sách hàng hóa lấy từ MSSQL AdventureWorks qua API /api/query.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border-destructive/50">
          <CardContent className="flex items-start gap-3 py-6">
            <CircleAlert className="text-destructive mt-0.5 size-5" />
            <div>
              <p className="font-medium">Không thể tải dữ liệu</p>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng hàng hóa
                </CardTitle>
                <Package className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.length.toLocaleString("vi-VN")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Thành phẩm
                </CardTitle>
                <Boxes className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {finishedGoods.toLocaleString("vi-VN")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Giá niêm yết trung bình
                </CardTitle>
                <BadgeDollarSign className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currencyFormatter.format(averageListPrice)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Số màu sản phẩm
                </CardTitle>
                <Palette className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{colors}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách hàng hóa</CardTitle>
              <CardDescription>
                Tìm kiếm, sắp xếp, phân trang và tùy chỉnh các cột hiển thị.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductDataTable data={products} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
