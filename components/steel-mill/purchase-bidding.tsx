"use client"

import { useMemo, useState } from "react"
import { Plus, Search, Settings2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { type BiddingItem } from "@/lib/steel-data"
import { useMillBids } from "@/lib/bidding-store"
import { BiddingManage } from "./bidding-manage"
import { BiddingPublish } from "./bidding-publish"

const tabs = ["全部", "待审核", "进行中", "待开标", "已成交", "已流标", "已下架"]
const categories = ["全部类别", "重废", "统废", "生铁"]
const regions = ["全部区域", "江苏·苏州", "上海·宝山", "浙江·嘉兴", "江苏·无锡", "安徽·马鞍山"]

export function PurchaseBidding() {
  const [tab, setTab] = useState("全部")
  const [category, setCategory] = useState("全部类别")
  const [region, setRegion] = useState("全部区域")
  const [keyword, setKeyword] = useState("")
  const [manageItem, setManageItem] = useState<BiddingItem | null>(null)
  const [publishing, setPublishing] = useState(false)

  const millBids = useMillBids()
  const rows = useMemo(() => {
    return millBids.filter((b) => {
      if (tab !== "全部" && b.status !== tab) return false
      if (category !== "全部类别" && b.category !== category) return false
      if (region !== "全部区域" && b.region !== region) return false
      if (keyword && !`${b.id}${b.title}`.toLowerCase().includes(keyword.toLowerCase())) return false
      return true
    })
  }, [tab, category, region, keyword])

  const resetFilters = () => {
    setTab("全部")
    setCategory("全部类别")
    setRegion("全部区域")
    setKeyword("")
  }

  const columns: Column<BiddingItem>[] = [
    { key: "id", header: "竞价单号", className: "whitespace-nowrap", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "title", header: "公告标题", className: "whitespace-nowrap" },
    { key: "category", header: "废钢类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "region", header: "区域", className: "text-muted-foreground whitespace-nowrap" },
    { key: "qty", header: "数量", className: "whitespace-nowrap" },
    { key: "basePrice", header: "起拍价", className: "whitespace-nowrap" },
    { key: "budget", header: "采购预算", className: "whitespace-nowrap tabular-nums" },
    { key: "publishTime", header: "发布时间", className: "text-muted-foreground whitespace-nowrap tabular-nums" },
    { key: "signupStart", header: "报名开始", className: "text-muted-foreground whitespace-nowrap tabular-nums" },
    { key: "signupEnd", header: "报名结束", className: "text-muted-foreground whitespace-nowrap tabular-nums" },
    { key: "bidStart", header: "竞价开始", className: "text-muted-foreground whitespace-nowrap tabular-nums" },
    { key: "bidEnd", header: "竞价结束", className: "text-muted-foreground whitespace-nowrap tabular-nums" },
    {
      key: "topQuote",
      header: "当前最高价",
      className: "whitespace-nowrap",
      render: (r) => <span className="font-medium text-primary">{r.topQuote}</span>,
    },
    { key: "status", header: "状态", className: "whitespace-nowrap", render: (r) => <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill> },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) => (
        <Button size="sm" onClick={() => setManageItem(r)}>
          <Settings2 />
          管理项目
        </Button>
      ),
    },
  ]

  if (manageItem) {
    return <BiddingManage item={manageItem} onBack={() => setManageItem(null)} />
  }

  if (publishing) {
    return <BiddingPublish onBack={() => setPublishing(false)} />
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="竞价回收"
        desc="发布竞价采购需求，供应商在线报价，价高（低）者得，公开透明"
        action={
          <Button onClick={() => setPublishing(true)}>
            <Plus />
            发布竞价需求
          </Button>
        }
      />

      {/* 筛选条件区域 */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">废钢类别</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">区域范围</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 lg:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">关键词</span>
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm focus-within:border-primary">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索竞价单号 / 标的名称"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <FilterBar>
            {tabs.map((t) => (
              <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
                {t}
              </FilterChip>
            ))}
          </FilterBar>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw />
            重置
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          共 <span className="font-medium text-foreground tabular-nums">{rows.length}</span> 条竞价项目
        </span>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />
    </div>
  )
}
