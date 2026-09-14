"use client"

import { useMemo, useState } from "react"
import { Search, RotateCcw, FileSearch, HandCoins, Tag, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { StatusPill } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import { supplierFixedTone, supplierFixedList, type SupplierFixedItem } from "@/lib/steel-data"

const categories = ["全部类别", "重废", "统废", "生铁"]
const regions = ["全部区域", "江苏·南京", "江苏·苏州", "江苏·无锡", "江苏·常州", "安徽·马鞍山"]

function FilterCard({
  category,
  setCategory,
  region,
  setRegion,
  keyword,
  setKeyword,
  onReset,
}: {
  category: string
  setCategory: (v: string) => void
  region: string
  setRegion: (v: string) => void
  keyword: string
  setKeyword: (v: string) => void
  onReset: () => void
}) {
  return (
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
              placeholder="搜索固定价单号 / 标题 / 采购单位"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </label>
      </div>
      <div className="mt-4 flex justify-end border-t border-border pt-4">
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw />
          重置
        </Button>
      </div>
    </div>
  )
}

/* ---------------- 网上报价 ---------------- */
function QuoteHallContent() {
  const [category, setCategory] = useState("全部类别")
  const [region, setRegion] = useState("全部区域")
  const [keyword, setKeyword] = useState("")
  const [quoteItem, setQuoteItem] = useState<SupplierFixedItem | null>(null)
  const [qty, setQty] = useState("")
  const [done, setDone] = useState(false)

  // 网上报价：展示挂单中且尚可接量 > 0 的一口价需求
  const source = supplierFixedList.filter((f) => f.remainQty !== "0 吨")

  const rows = useMemo(
    () =>
      source.filter((f) => {
        if (category !== "全部类别" && f.category !== category) return false
        if (region !== "全部区域" && f.region !== region) return false
        if (keyword && !`${f.id}${f.title}${f.buyer}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [category, region, keyword, source],
  )

  const columns: Column<SupplierFixedItem>[] = [
    { key: "id", header: "固定价单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "需求标题", className: "whitespace-nowrap" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "category", header: "类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "region", header: "区域", className: "whitespace-nowrap text-muted-foreground" },
    { key: "price", header: "一口价", className: "whitespace-nowrap tabular-nums font-medium text-primary" },
    { key: "planQty", header: "计划采购量", className: "whitespace-nowrap tabular-nums" },
    { key: "remainQty", header: "剩余可接量", className: "whitespace-nowrap tabular-nums font-medium text-foreground" },
    { key: "validUntil", header: "有效期至", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) =>
        r.quoteStatus === "未报价" ? (
          <Button size="sm" onClick={() => { setQuoteItem(r); setQty(""); setDone(false) }}>
            <Tag />
            立即报价
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <FileSearch />
            查看
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          固定价（一口价）由采购方设定统一收购价，供应商按一口价<span className="font-medium text-foreground">申报可供量</span>即可，
          <span className="font-medium text-foreground">无需缴纳报名费与保证金</span>；提交后等待采购方确认，成交后按成交量缴纳平台服务费。
        </p>
      </div>
      <FilterCard
        category={category}
        setCategory={setCategory}
        region={region}
        setRegion={setRegion}
        keyword={keyword}
        setKeyword={setKeyword}
        onReset={() => {
          setCategory("全部类别")
          setRegion("全部区域")
          setKeyword("")
        }}
      />
      <p className="text-sm text-muted-foreground">
        共 <span className="font-medium text-foreground tabular-nums">{rows.length}</span> 条可报价一口价需求
      </p>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />

      <Modal
        open={!!quoteItem}
        onClose={() => setQuoteItem(null)}
        title={done ? "报价已提交" : "一口价报价"}
        footer={
          done ? (
            <Button onClick={() => setQuoteItem(null)}>完成</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setQuoteItem(null)}>
                取消
              </Button>
              <Button disabled={!qty || Number(qty) <= 0} onClick={() => setDone(true)}>
                提交报价
              </Button>
            </>
          )
        }
      >
        {quoteItem && !done && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">需求</span>
                <span className="font-medium text-foreground">{quoteItem.title}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">一口价</span>
                <span className="font-medium text-primary tabular-nums">{quoteItem.price}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">剩余可接量</span>
                <span className="font-medium text-foreground tabular-nums">{quoteItem.remainQty}</span>
              </div>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">申报可供量（吨）</span>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="请输入本次可供货数量"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            {qty && Number(qty) > 0 && (
              <p className="text-sm text-muted-foreground">
                预计成交金额约 <span className="font-medium text-foreground tabular-nums">
                  ¥{(Number(qty) * Number(quoteItem.price.replace(/[^\d.]/g, ""))).toLocaleString()}
                </span>（不含报名费 / 保证金）
              </p>
            )}
          </div>
        )}
        {quoteItem && done && (
          <div className="space-y-3 py-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Tag className="size-6" />
            </div>
            <p className="text-sm text-foreground">
              已按一口价 <span className="font-medium text-primary">{quoteItem.price}</span> 申报 <span className="font-medium">{qty} 吨</span>
            </p>
            <p className="text-sm text-muted-foreground">报价已提交，等待采购方确认，可在「我的报价」中跟踪进度。</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ---------------- 我的报价 ---------------- */
const mineTabs = ["全部", "待确认", "已成交", "已拒绝"]

function MyQuoteContent() {
  const [tab, setTab] = useState("全部")
  const [keyword, setKeyword] = useState("")

  // 我的报价：已报价的记录
  const source = supplierFixedList.filter((f) => f.quoteStatus !== "未报价")

  const rows = useMemo(
    () =>
      source.filter((f) => {
        if (tab !== "全部" && f.quoteStatus !== tab) return false
        if (keyword && !`${f.id}${f.title}${f.buyer}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [tab, keyword, source],
  )

  const columns: Column<SupplierFixedItem>[] = [
    { key: "id", header: "固定价单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "需求标题", className: "whitespace-nowrap" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "category", header: "类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "price", header: "一口价", className: "whitespace-nowrap tabular-nums" },
    { key: "myQty", header: "我的报价量", className: "whitespace-nowrap tabular-nums font-medium text-primary" },
    { key: "myAmount", header: "预计金额", className: "whitespace-nowrap tabular-nums" },
    { key: "validUntil", header: "有效期至", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "quoteStatus",
      header: "报价状态",
      className: "whitespace-nowrap",
      render: (r) => <StatusPill tone={supplierFixedTone[r.quoteStatus]}>{r.quoteStatus}</StatusPill>,
    },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: () => (
        <Button variant="outline" size="sm">
          <FileSearch />
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar>
            {mineTabs.map((t) => (
              <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
                {t}
              </FilterChip>
            ))}
          </FilterBar>
          <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm focus-within:border-primary">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索单号 / 标题 / 采购单位"
              className="w-56 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        共 <span className="font-medium text-foreground tabular-nums">{rows.length}</span> 条报价记录
      </p>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />
    </div>
  )
}

/* ---------------- 缴纳服务费 ---------------- */
const serviceMethods = ["线上支付", "银行转账", "平台代扣"]

function ServiceFeeContent() {
  const [tab, setTab] = useState("全部")

  // 服务费：仅成交后需缴纳
  const allRows = supplierFixedList
    .filter((f) => f.quoteStatus === "已成交")
    .map((f, i) => {
      const status = f.serviceStatus === "已缴" ? "已缴" : "待缴纳"
      return {
        ...f,
        payStatus: status,
        payMethod: status === "已缴" ? serviceMethods[i % serviceMethods.length] : "—",
        paidTime: status === "已缴" ? f.validUntil : "—",
      }
    })

  const rows = allRows.filter((r) => tab === "全部" || r.payStatus === tab)
  const totalDue = allRows.filter((r) => r.payStatus === "待缴纳").length
  const totalPaid = allRows.filter((r) => r.payStatus === "已缴").length

  type Row = (typeof allRows)[number]
  const columns: Column<Row>[] = [
    { key: "id", header: "固定价单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "需求标题", className: "whitespace-nowrap" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "myQty", header: "成交量", className: "whitespace-nowrap tabular-nums" },
    { key: "myAmount", header: "成交金额", className: "whitespace-nowrap tabular-nums" },
    { key: "serviceFee", header: "服务费(元)", className: "whitespace-nowrap tabular-nums font-medium text-foreground" },
    { key: "payMethod", header: "支付方式", className: "whitespace-nowrap text-muted-foreground" },
    { key: "paidTime", header: "缴费时间", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "payStatus",
      header: "缴纳状态",
      className: "whitespace-nowrap",
      render: (r) => <StatusPill tone={r.payStatus === "已缴" ? "green" : "amber"}>{r.payStatus}</StatusPill>,
    },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) =>
        r.payStatus === "待缴纳" ? (
          <Button size="sm">去缴纳</Button>
        ) : (
          <Button variant="outline" size="sm">
            查看凭证
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <HandCoins className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          固定价交易<span className="font-medium text-foreground">不收取报名费与保证金</span>，仅在成交后按成交量缴纳平台服务费。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="待缴纳服务费" value={String(totalDue)} unit="笔" tone="amber" />
        <StatCard label="已缴纳服务费" value={String(totalPaid)} unit="笔" tone="green" />
        <StatCard label="累计缴纳金额" value="¥3,200" unit="" tone="primary" />
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <FilterBar>
          {["全部", "待缴纳", "已缴"].map((t) => (
            <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </FilterChip>
          ))}
        </FilterBar>
      </div>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  tone,
}: {
  label: string
  value: string
  unit: string
  tone: "primary" | "amber" | "green"
}) {
  const toneCls = { primary: "text-primary", amber: "text-amber-600", green: "text-emerald-600" }[tone]
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${toneCls}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

const meta: Record<string, { title: string; desc: string }> = {
  "station-supplier-fixed-quote": { title: "网上报价", desc: "浏览采购方发布的一口价需求并在线报价（申报可供量）" },
  "station-supplier-fixed-mine": { title: "我的报价", desc: "查看待确认 / 已成交 / 已拒绝的固定价报价记录" },
  "station-supplier-fixed-service": { title: "缴纳服务费", desc: "固定价成交后按成交量缴纳平台交易服务费" },
}

export function SupplierFixed({ leaf }: { leaf: string }) {
  const m = meta[leaf] ?? meta["station-supplier-fixed-quote"]
  return (
    <div className="h-full overflow-y-auto p-6">
      <PageHeader title={m.title} desc={m.desc} />
      <div className="mt-4">
        {leaf === "station-supplier-fixed-quote" && <QuoteHallContent />}
        {leaf === "station-supplier-fixed-mine" && <MyQuoteContent />}
        {leaf === "station-supplier-fixed-service" && <ServiceFeeContent />}
      </div>
    </div>
  )
}
