"use client"

import type { OpsMenuKey, WorkspaceKey } from "@/lib/steel-data"
import { OpsHome } from "./ops-home"
import { OpsProjects } from "./ops-projects"
import { OpsOrders } from "./ops-orders"
import { OpsFinance } from "./ops-finance"
import { OpsStats } from "./ops-stats"
import { OpsConfig } from "./ops-config"

export function OpsWorkspace({
  section,
  onNavigate,
}: {
  section: OpsMenuKey
  onNavigate: (key: WorkspaceKey) => void
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      {section === "ops-home" && <OpsHome onNavigate={onNavigate} />}
      {section === "ops-projects" && <OpsProjects />}
      {section === "ops-orders" && <OpsOrders />}
      {section === "ops-finance" && <OpsFinance />}
      {section === "ops-stats" && <OpsStats />}
      {section === "ops-config" && <OpsConfig />}
    </div>
  )
}
