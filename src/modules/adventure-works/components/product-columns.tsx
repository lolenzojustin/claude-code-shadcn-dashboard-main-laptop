"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AdventureWorksProduct } from "@/modules/adventure-works/types/product"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export const productColumnLabels: Record<string, string> = {
  ProductID: "ID",
  Name: "Tên hàng hóa",
  ProductNumber: "Mã hàng",
  MakeFlag: "Tự sản xuất",
  FinishedGoodsFlag: "Thành phẩm",
  Color: "Màu sắc",
  SafetyStockLevel: "Tồn kho an toàn",
  ReorderPoint: "Điểm đặt lại",
  StandardCost: "Giá vốn",
  ListPrice: "Giá niêm yết",
  Size: "Kích thước",
  SizeUnitMeasureCode: "Đơn vị kích thước",
  WeightUnitMeasureCode: "Đơn vị trọng lượng",
  Weight: "Trọng lượng",
  DaysToManufacture: "Ngày sản xuất",
  ProductLine: "Dòng sản phẩm",
  Class: "Phân hạng",
  Style: "Kiểu dáng",
  ProductSubcategoryID: "Danh mục con",
  ProductModelID: "Model",
  SellStartDate: "Ngày bắt đầu bán",
  SellEndDate: "Ngày kết thúc bán",
  DiscontinuedDate: "Ngày ngừng bán",
  rowguid: "Row GUID",
  ModifiedDate: "Ngày cập nhật",
}

function SortableHeader<TData>({
  column,
  title,
}: {
  column: Column<TData, unknown>
  title: string
}) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 whitespace-nowrap"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "desc" ? (
        <ArrowDown className="ml-1 size-3.5" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-1 size-3.5" />
      ) : (
        <ChevronsUpDown className="ml-1 size-3.5" />
      )}
    </Button>
  )
}

function emptyFallback(value: string | number | null) {
  return value === null || value === "" ? (
    <span className="text-muted-foreground">—</span>
  ) : (
    value
  )
}

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—"
}

function sortableHeader(title: string) {
  return ({ column }: { column: Column<AdventureWorksProduct, unknown> }) => (
    <SortableHeader column={column} title={title} />
  )
}

export const productColumns: ColumnDef<AdventureWorksProduct>[] = [
  {
    accessorKey: "ProductID",
    header: sortableHeader(productColumnLabels.ProductID),
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        #{row.original.ProductID}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "Name",
    header: sortableHeader(productColumnLabels.Name),
    cell: ({ row }) => (
      <div className="min-w-[220px] max-w-[320px] font-medium">
        {row.original.Name}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "ProductNumber",
    header: sortableHeader(productColumnLabels.ProductNumber),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono font-normal">
        {row.original.ProductNumber}
      </Badge>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "MakeFlag",
    header: sortableHeader(productColumnLabels.MakeFlag),
    cell: ({ row }) => (
      <Badge variant={row.original.MakeFlag ? "default" : "secondary"}>
        {row.original.MakeFlag ? "Có" : "Không"}
      </Badge>
    ),
  },
  {
    accessorKey: "FinishedGoodsFlag",
    header: sortableHeader(productColumnLabels.FinishedGoodsFlag),
    cell: ({ row }) => (
      <Badge
        variant={row.original.FinishedGoodsFlag ? "default" : "outline"}
      >
        {row.original.FinishedGoodsFlag ? "Thành phẩm" : "Bán thành phẩm"}
      </Badge>
    ),
  },
  {
    accessorKey: "Color",
    header: sortableHeader(productColumnLabels.Color),
    cell: ({ row }) => emptyFallback(row.original.Color),
  },
  {
    accessorKey: "SafetyStockLevel",
    header: sortableHeader(productColumnLabels.SafetyStockLevel),
  },
  {
    accessorKey: "ReorderPoint",
    header: sortableHeader(productColumnLabels.ReorderPoint),
  },
  {
    accessorKey: "StandardCost",
    header: sortableHeader(productColumnLabels.StandardCost),
    cell: ({ row }) => currencyFormatter.format(row.original.StandardCost),
  },
  {
    accessorKey: "ListPrice",
    header: sortableHeader(productColumnLabels.ListPrice),
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormatter.format(row.original.ListPrice)}
      </span>
    ),
  },
  {
    accessorKey: "Size",
    header: sortableHeader(productColumnLabels.Size),
    cell: ({ row }) => emptyFallback(row.original.Size),
  },
  {
    accessorKey: "SizeUnitMeasureCode",
    header: sortableHeader(productColumnLabels.SizeUnitMeasureCode),
    cell: ({ row }) => emptyFallback(row.original.SizeUnitMeasureCode),
  },
  {
    accessorKey: "WeightUnitMeasureCode",
    header: sortableHeader(productColumnLabels.WeightUnitMeasureCode),
    cell: ({ row }) => emptyFallback(row.original.WeightUnitMeasureCode),
  },
  {
    accessorKey: "Weight",
    header: sortableHeader(productColumnLabels.Weight),
    cell: ({ row }) => emptyFallback(row.original.Weight),
  },
  {
    accessorKey: "DaysToManufacture",
    header: sortableHeader(productColumnLabels.DaysToManufacture),
  },
  {
    accessorKey: "ProductLine",
    header: sortableHeader(productColumnLabels.ProductLine),
    cell: ({ row }) => emptyFallback(row.original.ProductLine),
  },
  {
    accessorKey: "Class",
    header: sortableHeader(productColumnLabels.Class),
    cell: ({ row }) => emptyFallback(row.original.Class),
  },
  {
    accessorKey: "Style",
    header: sortableHeader(productColumnLabels.Style),
    cell: ({ row }) => emptyFallback(row.original.Style),
  },
  {
    accessorKey: "ProductSubcategoryID",
    header: sortableHeader(productColumnLabels.ProductSubcategoryID),
    cell: ({ row }) => emptyFallback(row.original.ProductSubcategoryID),
  },
  {
    accessorKey: "ProductModelID",
    header: sortableHeader(productColumnLabels.ProductModelID),
    cell: ({ row }) => emptyFallback(row.original.ProductModelID),
  },
  {
    accessorKey: "SellStartDate",
    header: sortableHeader(productColumnLabels.SellStartDate),
    cell: ({ row }) => formatDate(row.original.SellStartDate),
  },
  {
    accessorKey: "SellEndDate",
    header: sortableHeader(productColumnLabels.SellEndDate),
    cell: ({ row }) => formatDate(row.original.SellEndDate),
  },
  {
    accessorKey: "DiscontinuedDate",
    header: sortableHeader(productColumnLabels.DiscontinuedDate),
    cell: ({ row }) => formatDate(row.original.DiscontinuedDate),
  },
  {
    accessorKey: "rowguid",
    header: sortableHeader(productColumnLabels.rowguid),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.rowguid}</span>
    ),
  },
  {
    accessorKey: "ModifiedDate",
    header: sortableHeader(productColumnLabels.ModifiedDate),
    cell: ({ row }) => formatDate(row.original.ModifiedDate),
  },
]
