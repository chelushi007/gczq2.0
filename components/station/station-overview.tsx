"use client"

import { ArrowUpRight, Gavel, Tag, FileSignature, ClipboardList, Wallet, ShoppingCart, ReceiptText, Recycle } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"

const stats = [
  { label: "进行中竞价", value: "6", unit: "场", trend: "+2", tone: "primary" },
  { label: "待确认协议单", value: "3", unit: "单", trend: "+1", tone: "amber" },
  { label: "本月采购额", value: "1,286", unit: "万元", trend: "+8.4%", tone: "green" },
  { label: "合作钢厂", value: "12", unit: "家", trend: "+1", tone: "violet" },
]

const toneBar: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  violet: "bg-violet-500",
}

const quickActions: { label: string; desc: string; icon: typeof Gavel; leaf: string }[] = [
  { label: "网上报名", desc: "报名参与钢厂竞价", icon: Gavel, leaf: "station-supplier-bidding-signup" },
  { label: "我的竞价", desc: "查看竞价与报价", icon: Tag, leaf: "station-supplier-bidding-mine" },
  { label: "协议单确认", desc: "确认协议采购单", icon: FileSignature, leaf: "station-supplier-agreement-confirm" },
  { label: "供货订单", desc: "供应商履约结算", icon: ClipboardList, leaf: "station-supplier-orders" },
  { label: "竞价回收", desc: "作为回收商采购", icon: ShoppingCart, leaf: "station-recycler-purchase-bidding" },
  { label: "费用支付", desc: "货款支付与发票", icon: Wallet, leaf: "station-recycler-finance-payment" },
  { label: "反向开票", desc: "自然人代开发票", icon: ReceiptText, leaf: "station-recycler-finance-reverse" },
  { label: "基地管理", desc: "钢厂合作邀约", icon: Recycle, leaf: "station-supplier-base" },
]

const activities = [
  { type: "竞价", time: "10 分钟前", text: "「华东钢铁厂重废竞价」进入报价阶段，当前排名第 2" },
  { type: "协议", time: "1 小时前", text: "收到钢厂协议采购单 XYD20260908-021，待确认" },
  { type: "结算", time: "今天", text: "供货订单 DD20260906-012 货款已收讫 ¥786,000" },
  { type: "开票", time: "昨天", text: "为自然人张建国完成反向开票 ¥100,000" },
]

export function StationOverview({ onNavigate }: { onNavigate?: (leaf: string) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader title="总览" desc="回收基地经营概况 · 演示集团 / 城南再生资源" />

      {/* 业务快捷操作 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">业务快捷操作</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">覆盖供应商供货与回收商采购的常用业务</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <button
                key={a.label}
                onClick={() => onNavigate?.(a.leaf)}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{a.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 指标卡 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                <ArrowUpRight className="size-3" />
                {s.trend}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">{s.value}</span>
              <span className="text-sm text-muted-foreground">{s.unit}</span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full w-2/3 rounded-full ${toneBar[s.tone]}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 最新动态 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">最新动态</h3>
        <ul className="mt-4 space-y-4">
          {activities.map((a, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                {i < activities.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
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
      </div>
    </div>
  )
}
