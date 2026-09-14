"use client"

import { useState } from "react"
import { Search, Wallet, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { orderList, type OrderItem } from "@/lib/steel-data"
import { OrderFulfill, type FulfillPerspective } from "@/components/steel-mill/order-fulfill"
import { OrderDetail } from "@/components/steel-mill/order-detail"

const tabs = ["全部", "履约中", "履约结束"]
const channelTone: Record<string, "blue" | "amber" | "violet"> = {
  竞价: "blue",
  固定价: "amber",
  协议: "violet",
}

const channelOptions = ["全部", "竞价", "固定价", "协议"]
const categoryOptions = ["全部", "重废", "统废", "生铁"]
const regionOptions = ["全部", "江苏·苏州", "江苏·无锡", "上海·宝山", "浙江·嘉兴"]

export function MillOrders({ perspective = "purchaser" }: { perspective?: FulfillPerspective }) {
  const [tab, setTab] = useState("全部")
  const [channel, setChannel] = useState("全部")
  const [category, setCategory] = useState("全部")
  const [region, setRegion] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [fulfilling, setFulfilling] = useState<OrderItem | null>(null)
  const [detail, setDetail] = useState<OrderItem | null>(null)

  const rows = orderList.filter((o) => {
    if (tab !== "全部" && o.status !== tab) return false
    if (channel !== "全部" && o.channel !== channel) return false
    if (category !== "全部" && o.category !== category) return false
    if (region !== "全部" && o.region !== region) return false
    if (keyword.trim()) {
      const kw = keyword.trim()
      if (!o.id.includes(kw) && !o.supplier.includes(kw)) return false
    }
    return true
  })

  const resetFilters = () => {
    setChannel("全部")
    setCategory("全部")
    setRegion("全部")
    setKeyword("")
  }

  const columns: Column<OrderItem>[] = [
    { key: "id", header: "订单编号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "supplier", header: "供应商" },
    {
      key: "channel",
      header: "成交方式",
      render: (r) => <StatusPill tone={channelTone[r.channel]}>{r.channel}</StatusPill>,
    },
    { key: "category", header: "类别" },
    { key: "region", header: "所在地区", className: "text-muted-foreground" },
    { key: "qty", header: "数量", className: "tabular-nums" },
    { key: "unitPrice", header: "成交单价", className: "tabular-nums text-muted-foreground" },
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
      key: "status",
      header: "订单状态",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Wallet className="size-3.5 text-muted-foreground" />
          <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill>
        </span>
      ),
    },
    { key: "deliveryDate", header: "交货日期", className: "text-muted-foreground tabular-nums" },
    { key: "createdAt", header: "下单日期", className: "text-muted-foreground tabular-nums" },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        r.status === "履约中" ? (
          <Button size="sm" onClick={() => setFulfilling(r)}>
            履约
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setDetail(r)}>
            详情
          </Button>
        ),
    },
  ]

  if (fulfilling) {
    return <OrderFulfill item={fulfilling} perspective={perspective} onBack={() => setFulfilling(null)} />
  }

  if (detail) {
    return <OrderDetail item={detail} perspective={perspective} onBack={() => setDetail(null)} />
  }

  return (
    <div className="space-y-5">
      <PageHeader title="订单管理" desc="订单查询贯通成交与履约：一条订单可追溯成交方式、履约进度与结算状态" />

      {/* 筛选条件区 */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FilterField label="成交方式">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
            >
              {channelOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="类别">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
            >
              {categoryOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="所在地区">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
            >
              {regionOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="订单编号 / 供应商">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground focus-within:border-primary">
              <Search className="size-4 shrink-0" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入关键词搜索"
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </FilterField>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
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

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />

      <p className="text-xs text-muted-foreground">
        说明：协议成交按合同周期结算，无固定订单金额，金额列显示为「协议按周期结算」；竞价与固定价成交按成交单价 × 数量核算订单金额。履约中的订单可点击「履约」跟进交货与结算。
      </p>
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
