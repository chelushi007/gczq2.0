import { ArrowUpRight, Gavel, Tag, FileSignature, ClipboardList, Wallet, Users, ShoppingCart } from "lucide-react"
import type { MillMenuKey } from "@/lib/steel-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { overviewStats, purchaseChannelStats, recentActivities } from "@/lib/steel-data"

const toneBar: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  violet: "bg-violet-500",
}

const channelIcon = [Gavel, Tag, FileSignature]

const quickActions: { label: string; desc: string; icon: typeof Gavel; section: MillMenuKey }[] = [
  { label: "竞价回收", desc: "发起竞价采购", icon: Gavel, section: "purchase-bidding" },
  { label: "固定价回收", desc: "设定一口价采购", icon: Tag, section: "purchase-fixed" },
  { label: "协议回收", desc: "发起协议采购", icon: FileSignature, section: "purchase-agreement" },
  { label: "订单管理", desc: "履约与结算", icon: ClipboardList, section: "orders" },
  { label: "财务管理", desc: "货款支付与发票", icon: Wallet, section: "finance" },
  { label: "基地管理", desc: "邀请合作回收基地", icon: Users, section: "suppliers" },
]

export function MillOverview({ onNavigate }: { onNavigate?: (section: MillMenuKey) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader title="总览" desc="钢厂采购运营概况 · 演示集团 / 华东钢铁厂" />

      {/* 业务快捷操作 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">业务快捷操作</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">一键进入常用采购、履约与财务业务</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <button
                key={a.label}
                onClick={() => onNavigate?.(a.section)}
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
        {overviewStats.map((s) => (
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* 采购渠道分布 */}
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-3">
          <h3 className="text-sm font-semibold text-foreground">采购渠道分布</h3>
          <p className="mt-1 text-xs text-muted-foreground">按竞价 / 固定价 / 协议三种回收方式统计</p>
          <ul className="mt-4 space-y-4">
            {purchaseChannelStats.map((c, i) => {
              const Icon = channelIcon[i]
              const max = Math.max(...purchaseChannelStats.map((x) => x.count))
              return (
                <li key={c.name} className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">
                        {c.count} 单 · {c.amount}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(c.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* 动态 */}
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">最新动态</h3>
          <ul className="mt-4 space-y-4">
            {recentActivities.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  {i < recentActivities.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
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
    </div>
  )
}
