"use client"

import type { MillMenuKey } from "@/lib/steel-data"
import { MillOverview } from "./mill-overview"
import { PurchaseBidding } from "./purchase-bidding"
import { PurchaseFixed } from "./purchase-fixed"
import { PurchaseAgreement } from "./purchase-agreement"
import { MillOrders } from "./mill-orders"
import { MillSuppliers } from "./mill-suppliers"
import { FinancePayment } from "./finance-payment"

export function SteelMillWorkspace({
  section,
  onNavigate,
}: {
  section: MillMenuKey
  onNavigate?: (section: MillMenuKey) => void
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      {section === "overview" && <MillOverview onNavigate={onNavigate} />}
      {section === "purchase-bidding" && <PurchaseBidding />}
      {section === "purchase-fixed" && <PurchaseFixed />}
      {section === "purchase-agreement" && <PurchaseAgreement />}
      {section === "orders" && <MillOrders />}
      {section === "finance" && <FinancePayment />}
      {section === "suppliers" && <MillSuppliers />}
    </div>
  )
}
