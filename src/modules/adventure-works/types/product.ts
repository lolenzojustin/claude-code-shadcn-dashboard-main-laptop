export interface AdventureWorksProduct {
  ProductID: number
  Name: string
  ProductNumber: string
  MakeFlag: boolean
  FinishedGoodsFlag: boolean
  Color: string | null
  SafetyStockLevel: number
  ReorderPoint: number
  StandardCost: number
  ListPrice: number
  Size: string | null
  SizeUnitMeasureCode: string | null
  WeightUnitMeasureCode: string | null
  Weight: number | null
  DaysToManufacture: number
  ProductLine: string | null
  Class: string | null
  Style: string | null
  ProductSubcategoryID: number | null
  ProductModelID: number | null
  SellStartDate: string
  SellEndDate: string | null
  DiscontinuedDate: string | null
  rowguid: string
  ModifiedDate: string
}
