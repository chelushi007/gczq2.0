"use client"

import { useState } from "react"
import { Wallet, Landmark, ShieldCheck, Receipt, CircleCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import { SectionCard } from "./ops-ui"
import { opsFinanceStats, opsSettlements, opsChannelDist, type OpsSettlement } from "@/lib/steel-data"

const statTone: Record<string, string> = {
  primary: "text-primary",
  green: "text-emerald-600",
  amber: "text-amber-600",
  violet: "text-violet-600",
}
const statIcon = [Wallet, ShieldCheck, Landmark, Receipt]

const settleStatusTone: Record<OpsSettlement["status"], "violet" | "amber" | "green"> = {
  待复核: "violet",
  处理中: "amber",
  已结算: "green",
}
const settleTypeTone: Record<OpsSettlement["type"], "blue" | "green" | "violet"> = {
  货款结算: "blue",
  服务费: "green",
  保证金退还: "violet",
}

const tabs = ["全部", "待复核", "处理中", "已结算"]

export function OpsFinance() {
  const [tab, setTab] = useState("全部")
  const [review, setReview] = useState<OpsSettlement | null>(null)
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({})

  const statusOf = (s: OpsSettlement) => (reviewed[s.id] ? "已结算" : s.status)
  const rows = opsSettlements.filter((s) => tab === "全部" || statusOf(s) === tab)
  const maxChannel = Math.max(...opsChannelDist.map((c) => c.value))

  const columns: Column<OpsSettlement>[] = [
    { key: "id", header: "结算单号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "orderId", header: "关联订单", className: "text-muted-foreground" },
    { key: "type", header: "类型", render: (r) => <StatusPill tone={settleTypeTone[r.type]}>{r.type}</StatusPill> },
    { key: "payer", header: "付款方" },
    { key: "payee", header: "收款方" },
    {
      key: "amount",
      header: "金额",
      render: (r) => <span className="font-medium tabular-nums text-foreground">{r.amount}</span>,
    },
    { key: "serviceFee", header: "平台服务费", className: "tabular-nums text-muted-foreground" },
    {
      key: "status",
      header: "状态",
      render: (r) => <StatusPill tone={settleStatusTone[statusOf(r) as OpsSettlement["status"]]}>{statusOf(r)}</StatusPill>,
    },
    { key: "date", header: "日期", className: "text-muted-foreground tabular-nums" },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        statusOf(r) === "待复核" ? (
          <Button size="sm" onClick={() => setReview(r)}>
            复核
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setReview(r)}>
            详情
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="财务管理" desc="平台资金全景：服务费收入、保证金托管、货款代收代付与开票管理" />

      {/* 资金概览 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {opsFinanceStats.map((s, i) => {
          const Icon = statIcon[i]
          return (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
              <p className={`mt-3 text-2xl font-semibold ${statTone[s.tone]}`}>{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* 服务费构成 */}
      <SectionCard
        title="服务费收入构成"
        desc="按成交渠道统计平台交易服务费占比"
        icon={<Receipt className="size-4 text-primary" />}
      >
        <ul className="space-y-3">
          {opsChannelDist.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-foreground">{c.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / maxChannel) * 100}%` }} />
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                {c.value}%
              </span>
              <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">{c.amount}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 结算单 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar>
          {tabs.map((t) => (
            <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </FilterChip>
          ))}
        </FilterBar>
        <span className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{rows.length}</span> 张结算单
        </span>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />

      <Modal
        open={!!review}
        onClose={() => setReview(null)}
        title={review ? `结算单 ${review.id}` : ""}
        description={review ? review.type : ""}
        footer={
          review && statusOf(review) === "待复核" ? (
            <>
              <Button variant="outline" onClick={() => setReview(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  if (review) setReviewed((p) => ({ ...p, [review.id]: true }))
                  setReview(null)
                }}
              >
                <CircleCheck />
                复核通过并结算
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setReview(null)}>
              关闭
            </Button>
          )
        }
      >
        {review && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Info k="结算单号" v={review.id} />
              <Info k="关联订单" v={review.orderId} />
              <Info k="结算类型" v={review.type} />
              <Info k="状态" v={statusOf(review)} />
              <Info k="付款方" v={review.payer} />
              <Info k="收款方" v={review.payee} />
              <Info k="结算金额" v={review.amount} />
              <Info k="平台服务费" v={review.serviceFee} />
              <Info k="日期" v={review.date} />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              说明：运营财务复核结算单金额与服务费无误后确认结算，平台完成货款代付并记账。保证金退还类结算由平台向缴纳方原路退回。
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{v}</div>
    </div>
  )
}
