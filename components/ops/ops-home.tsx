"use client"

import {
  Gavel,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings2,
  LayoutDashboard,
  ArrowUpRight,
  Bell,
} from "lucide-react"
import type { WorkspaceKey } from "@/lib/steel-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { KpiCard, SectionCard } from "./ops-ui"
import { opsKpis, opsTodos, opsActivities } from "@/lib/steel-data"

const quickActions: { label: string; desc: string; icon: typeof Gavel; key: WorkspaceKey }[] = [
  { label: "项目管理", desc: "竞价 / 固价 / 协议", icon: Gavel, key: "ops-projects" },
  { label: "订单管理", desc: "全平台订单履约", icon: ClipboardList, key: "ops-orders" },
  { label: "财务管理", desc: "服务费与结算", icon: Wallet, key: "ops-finance" },
  { label: "统计查询", desc: "经营数据分析", icon: BarChart3, key: "ops-stats" },
  { label: "系统配置", desc: "参数与权限", icon: Settings2, key: "ops-config" },
]

const todoTone: Record<string, "red" | "amber" | "gray"> = { 高: "red", 中: "amber", 低: "gray" }

export function OpsHome({ onNavigate }: { onNavigate: (key: WorkspaceKey) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="运营工作台"
        desc="盘古循环资源 · 平台运营总览与全局管理"
        action={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Bell className="size-4" />
            待办 {opsTodos.length}
          </Button>
        }
      />

      {/* KPI 指标 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {opsKpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* 快捷入口 */}
      <SectionCard
        title="运营快捷入口"
        desc="一键进入常用运营管理模块"
        icon={<LayoutDashboard className="size-4 text-primary" />}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <button
                key={a.label}
                onClick={() => onNavigate(a.key)}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{a.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{a.desc}</span>
                </span>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* 待办事项 */}
        <SectionCard
          title="待办事项"
          desc="需运营及时处理的审核、异常与工单"
          icon={<ClipboardList className="size-4 text-primary" />}
          className="lg:col-span-3"
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              全部
              <ArrowUpRight className="size-3.5" />
            </Button>
          }
        >
          <ul className="space-y-2">
            {opsTodos.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40"
              >
                <StatusPill tone="blue">{t.type}</StatusPill>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">{t.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.meta} · {t.time}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <StatusPill tone={todoTone[t.level]}>{t.level}</StatusPill>
                  <Button size="sm" variant="outline">
                    处理
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 平台动态 */}
        <SectionCard
          title="平台动态"
          desc="实时交易与运营事件"
          icon={<Bell className="size-4 text-primary" />}
          className="lg:col-span-2"
        >
          <ul className="space-y-4">
            {opsActivities.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  {i < opsActivities.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <StatusPill tone="blue">{a.type}</StatusPill>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
