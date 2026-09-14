"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { WorkspaceNav } from "@/components/workspace-nav"
import { PortalHome } from "@/components/portal-home"
import { SteelMillWorkspace } from "@/components/steel-mill/steel-mill-workspace"
import { StationWorkspace } from "@/components/station/station-workspace"
import { PlaceholderWorkspace } from "@/components/placeholder-workspace"
import { SteelZoneChannel } from "@/components/portal/steel-zone-channel"
import type { SupplierSub } from "@/components/workspace-nav"
import { workspaceNav, stationLeafPath, type WorkspaceKey, type MillMenuKey } from "@/lib/steel-data"

const titleMap: Record<WorkspaceKey, { group: string; leaf: string }> = (() => {
  const m = {} as Record<WorkspaceKey, { group: string; leaf: string }>
  for (const g of workspaceNav) {
    for (const l of g.children) m[l.key] = { group: g.label, leaf: l.label }
  }
  return m
})()

const millSectionLabel: Record<MillMenuKey, string> = {
  overview: "总览",
  "purchase-bidding": "竞价回收",
  "purchase-fixed": "固定价（一口价）回收",
  "purchase-agreement": "协议回收",
  orders: "订单管理",
  finance: "财务管理",
  suppliers: "供应商管理",
}

export default function Page() {
  const [active, setActive] = useState<WorkspaceKey>("portal-home")
  const [millSection, setMillSection] = useState<MillMenuKey>("overview")
  const [stationLeaf, setStationLeaf] = useState<string>("station-supplier-bidding-signup")
  const [supplierSub, setSupplierSub] = useState<SupplierSub>("enterprise")

  const crumb = titleMap[active]
  const stationPath = active === "station" ? stationLeafPath[stationLeaf] : null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 统一工作台菜单栏（彩色，可收起/展开） */}
      <WorkspaceNav
        active={active}
        onSelect={setActive}
        millSection={millSection}
        onMillSectionChange={setMillSection}
        stationLeaf={stationLeaf}
        onStationLeafChange={setStationLeaf}
        supplierSub={supplierSub}
        onSupplierSubChange={setSupplierSub}
      />

      {/* 3. 工作台内容 */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-foreground">盘古循环资源</span>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{crumb.group}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">演示集团</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              演
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          {active === "portal-home" && (
            <div className="h-full overflow-y-auto">
              <PortalHome onNavigateSteel={() => setActive("portal-steel")} />
            </div>
          )}
          {active === "mill" && <SteelMillWorkspace section={millSection} onNavigate={setMillSection} />}
          {active === "station" && <StationWorkspace leaf={stationLeaf} onNavigate={setStationLeaf} />}
          {active === "portal-steel" && (
            <div className="h-full overflow-y-auto">
              <SteelZoneChannel />
            </div>
          )}
          {(active === "supplier" || active === "ops-tbd") && (
            <PlaceholderWorkspace workspace={active} supplierSub={supplierSub} />
          )}
        </div>
      </main>
    </div>
  )
}
