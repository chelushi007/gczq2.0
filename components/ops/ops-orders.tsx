"use client"

import { useState } from "react"
import { Search, RotateCcw, Truck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import { KpiCard } from "./ops-ui"
import { opsOrders, type OpsOrder } from "@/lib/steel-data"

const channelTone: Record<OpsOrder["channel"], "blue" | "amber" | "violet"> = {
  竞价: "blue",
  固定价: "amber",
  协议: "violet",
}
const fulfillTone: Record<OpsOrder["fulfillStatus"], "gray" | "amber" | "blue" | "green"> = {
  待发货: "gray",
  运输中: "amber",
  已收货: "blue",
  已完成: "green",
}

const tabs = ["全部", "待发货", "运输中", "已收货", "已完成"]
const channelOptions = ["全部", "竞价", "固定价", "协议"]
const settleOptions = ["全部", "待结算", "结算中", "已结算"]

export function OpsOrders() {
  const [tab, setTab] = useState("全部")
  const [channel, setChannel] = useState("全部")
  const [settle, setSettle] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [detail, setDetail] = useState<OpsOrder | null>(null)

  const rows = opsOrders.filter((o) => {
    if (tab !== "全部" && o.fulfillStatus !== tab) return false
    if (channel !== "全部" && o.channel !== channel) return false
    if (settle !== "全部" && o.settleStatus !== settle) return false
    if (
      keyword.trim() &&
      !o.id.includes(keyword.trim()) &&
      !o.buyer.includes(keyword.trim()) &&
      !o.seller.includes(keyword.trim())
    )
      return false
    return true
  })

  const reset = () => {
    setChannel("全部")
    setSettle("全部")
    setKeyword("")
  }

  const stats = {
    total: opsOrders.length,
    inTransit: opsOrders.filter((o) => o.fulfillStatus === "运输中").length,
    toSettle: opsOrders.filter((o) => o.settleStatus !== "已结算").length,
    done: opsOrders.filter((o) => o.fulfillStatus === "已完成").length,
  }

  const columns: Column<OpsOrder>[] = [
    { key: "id", header: "订单编号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "channel", header: "成交方式", render: (r) => <StatusPill tone={channelTone[r.channel]}>{r.channel}</StatusPill> },
    { key: "buyer", header: "买方" },
    { key: "seller", header: "卖方" },
    { key: "category", header: "品类" },
    { key: "qty", header: "数量", className: "tabular-nums" },
    {
      key: "amount",
      header: "订单金额",
      render: (r) =>
        r.amount ? (
          <span className="font-medium tabular-nums text-foreground">{r.amount}</span>
        ) : (
          <span className="text-xs text-muted-foreground">协议按周期结算</span>
        ),
    },
    {
      key: "fulfillStatus",
      header: "履约状态",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Truck className="size-3.5 text-muted-foreground" />
          <StatusPill tone={fulfillTone[r.fulfillStatus]}>{r.fulfillStatus}</StatusPill>
        </span>
      ),
    },
    {
      key: "settleStatus",
      header: "结算状态",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Wallet className="size-3.5 text-muted-foreground" />
          <StatusPill tone={statusTone(r.settleStatus)}>{r.settleStatus}</StatusPill>
        </span>
      ),
    },
    { key: "createdAt", header: "下单日期", className: "text-muted-foreground tabular-nums" },
    {
      key: "op",
      header: "操作",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setDetail(r)}>
          详情
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="订单管理" desc="全平台订单集中监管：贯通成交方式、履约进度与结算状态，支撑运营风控与结算复核" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="订单总数" value={String(stats.total)} unit="单" tone="primary" />
        <KpiCard label="运输中" value={String(stats.inTransit)} unit="单" tone="amber" />
        <KpiCard label="待结算" value={String(stats.toSettle)} unit="单" tone="violet" />
        <KpiCard label="已完成" value={String(stats.done)} unit="单" tone="green" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="成交方式">
            <Select value={channel} onChange={setChannel} options={channelOptions} />
          </Field>
          <Field label="结算状态">
            <Select value={settle} onChange={setSettle} options={settleOptions} />
          </Field>
          <Field label="订单编号 / 买卖方">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground focus-within:border-primary">
              <Search className="size-4 shrink-0" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入关键词搜索"
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="size-3.5" />
            重置筛选
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar>
          {tabs.map((t) => (
            <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </FilterChip>
          ))}
        </FilterBar>
        <span className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{rows.length}</span> 条订单
        </span>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `订单 ${detail.id}` : ""}
        description={detail ? `${detail.channel} · ${detail.category}` : ""}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setDetail(null)}>
            关闭
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Info k="订单编号" v={detail.id} />
              <Info k="成交方式" v={detail.channel} />
              <Info k="品类" v={detail.category} />
              <Info k="买方" v={detail.buyer} />
              <Info k="卖方" v={detail.seller} />
              <Info k="数量" v={detail.qty} />
              <Info k="订单金额" v={detail.amount ?? "协议按周期结算"} />
              <Info k="履约状态" v={detail.fulfillStatus} />
              <Info k="结算状态" v={detail.settleStatus} />
              <Info k="下单日期" v={detail.createdAt} />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              说明：运营可对订单进行履约跟踪与结算复核。协议成交按合同周期结算，无固定订单金额；竞价与固定价成交按成交单价 × 数量核算。
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
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
