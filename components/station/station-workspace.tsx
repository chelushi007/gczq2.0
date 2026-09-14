"use client"

import { useMemo, useState } from "react"
import {
  Recycle,
  Search,
  RotateCcw,
  FileSearch,
  Wallet,
  ShieldCheck,
  HandCoins,
  ClipboardList,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { StatusPill } from "@/components/shared/status-pill"
import { supplierBidResultTone, type SupplierBidItem } from "@/lib/steel-data"
import { useSupplierBids } from "@/lib/bidding-store"
import { SupplierBidDetail } from "./supplier-bid-detail"
import { SignupDetail } from "./signup-detail"
import { PurchaseBidding } from "@/components/steel-mill/purchase-bidding"
import { PurchaseFixed } from "@/components/steel-mill/purchase-fixed"
import { PurchaseAgreement } from "@/components/steel-mill/purchase-agreement"
import { MillOrders } from "@/components/steel-mill/mill-orders"
import { FinancePayment } from "@/components/steel-mill/finance-payment"
import { FinanceReverse } from "@/components/steel-mill/finance-reverse"
import { SupplierFixed } from "./supplier-fixed"
import { SupplierAgreement } from "./supplier-agreement"
import { SupplierBase } from "./supplier-base"
import { StationOverview } from "./station-overview"

const leafMeta: Record<string, { icon: LucideIcon; title: string; desc: string }> = {
  "station-supplier-bidding-signup": {
    icon: ClipboardList,
    title: "网上报名",
    desc: "浏览钢厂竞价采购公告并在线报名参与竞价",
  },
  "station-supplier-bidding-mine": { icon: FileText, title: "我的竞价", desc: "查看已报名 / 竞价中 / 已结束的竞价项目并参与报价" },
  "station-supplier-bidding-fee": { icon: Wallet, title: "缴纳报名费", desc: "缴纳竞价项目报名费，缴费后方可参与竞价" },
  "station-supplier-bidding-deposit": { icon: ShieldCheck, title: "缴纳保证金", desc: "缴纳投标保证金，未中标后按规则退还" },
  "station-supplier-bidding-service": { icon: HandCoins, title: "缴纳服务费", desc: "中标后缴纳平台交易服务费" },
  "station-recycler": { icon: Recycle, title: "回收商", desc: "回收商角色工作台设计中" },
  "station-recycler-orders": { icon: ClipboardList, title: "订单管理", desc: "回收商采购订单的查询、结算与合同管理" },
  "station-seller": { icon: Recycle, title: "销售方", desc: "销售方角色工作台设计中" },
}

const categories = ["全部类别", "重废", "统废", "生铁"]
const regions = ["全部区域", "江苏·苏州", "上海·宝山", "浙江·嘉兴", "江苏·无锡", "江苏·常州", "江苏·张家港", "安徽·马鞍山"]

/* ---------------- 网上报名 ---------------- */
function SignupContent({ onOpen }: { onOpen: (i: SupplierBidItem) => void }) {
  const [category, setCategory] = useState("全部类别")
  const [region, setRegion] = useState("全部区域")
  const [keyword, setKeyword] = useState("")
  const supplierBidList = useSupplierBids()
  // 网上报名：仅展示还可报名 / 报名中的项目
  const source = supplierBidList.filter((b) => b.result === "报名中" || b.signupStatus === "未报名" || b.signupStatus === "报名待审")

  const rows = useMemo(
    () =>
      source.filter((b) => {
        if (category !== "全部类别" && b.category !== category) return false
        if (region !== "全部区域" && b.region !== region) return false
        if (keyword && !`${b.id}${b.title}${b.buyer}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [category, region, keyword, source],
  )

  const columns: Column<SupplierBidItem>[] = [
    { key: "id", header: "竞价单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "公告标题", className: "whitespace-nowrap" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "category", header: "类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "region", header: "区域", className: "whitespace-nowrap text-muted-foreground" },
    { key: "qty", header: "数量", className: "whitespace-nowrap" },
    { key: "basePrice", header: "起拍价", className: "whitespace-nowrap" },
    { key: "signupFee", header: "报名费", className: "whitespace-nowrap tabular-nums" },
    { key: "deposit", header: "保证金", className: "whitespace-nowrap tabular-nums" },
    { key: "signupEnd", header: "报名截止", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    { key: "bidStart", header: "竞价开始", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "signupStatus",
      header: "报名状态",
      className: "whitespace-nowrap",
      render: (r) => (
        <StatusPill tone={r.signupStatus === "报名待审" ? "amber" : r.signupStatus === "报名通过" ? "green" : "gray"}>
          {r.signupStatus}
        </StatusPill>
      ),
    },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) => (
        <Button size="sm" onClick={() => onOpen(r)}>
          {r.signupStatus === "未报名" ? "立即报名" : "查看详情"}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
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
        共 <span className="font-medium text-foreground tabular-nums">{rows.length}</span> 条可报名竞价
      </p>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />
    </div>
  )
}

/* ---------------- 我的竞价 ---------------- */
const myTabs = ["全部", "报名中", "竞价中", "待开标", "已中标", "未中标"]

function MyBiddingContent({ onOpen }: { onOpen: (i: SupplierBidItem) => void }) {
  const [tab, setTab] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const supplierBidList = useSupplierBids()
  // 我的竞价：已报名的项目
  const source = supplierBidList.filter((b) => b.signupStatus !== "未报名")

  const rows = useMemo(
    () =>
      source.filter((b) => {
        if (tab !== "全部" && b.result !== tab) return false
        if (keyword && !`${b.id}${b.title}${b.buyer}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [tab, keyword, source],
  )

  const columns: Column<SupplierBidItem>[] = [
    { key: "id", header: "竞价单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "公告标题", className: "whitespace-nowrap" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "category", header: "类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "bidMode", header: "竞价方式", className: "whitespace-nowrap text-muted-foreground" },
    { key: "basePrice", header: "起拍价", className: "whitespace-nowrap" },
    { key: "myQuote", header: "我的报价", className: "whitespace-nowrap tabular-nums", render: (r) => <span className="font-medium text-primary">{r.myQuote}</span> },
    { key: "quotes", header: "参与家数", className: "whitespace-nowrap tabular-nums", render: (r) => `${r.quotes} 家` },
    { key: "bidEnd", header: "竞价结束", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "result",
      header: "竞价结果",
      className: "whitespace-nowrap",
      render: (r) => <StatusPill tone={supplierBidResultTone[r.result]}>{r.result}</StatusPill>,
    },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) => (
        <Button size="sm" onClick={() => onOpen(r)}>
          <FileSearch />
          {r.result === "竞价中" ? "进入竞价" : "查看详情"}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar>
            {myTabs.map((t) => (
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
        共 <span className="font-medium text-foreground tabular-nums">{rows.length}</span> 条竞价记录
      </p>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />
    </div>
  )
}

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
              placeholder="搜索竞价单号 / 标题 / 采购单位"
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

/* ---------------- 缴费类页面 ---------------- */
type PayRow = {
  no: string
  title: string
  buyer: string
  category: string
  amount: string
  dueTime: string
  payMethod: string
  paidTime: string
  status: string
  tone: "amber" | "green" | "gray"
}

const payMethods = ["线上支付", "银行转账", "平台代扣"]

function PaymentContent({ kind }: { kind: "fee" | "deposit" | "service" }) {
  const [tab, setTab] = useState("全部")
  const label = kind === "fee" ? "报名费" : kind === "deposit" ? "保证金" : "服务费"
  const supplierBidList = useSupplierBids()
  const allRows: PayRow[] = supplierBidList
    .filter((b) => (kind === "service" ? b.result === "已中标" : b.signupStatus !== "未报名"))
    .map((b, i) => {
      const raw = kind === "fee" ? b.feeStatus : kind === "deposit" ? b.depositStatus : b.result === "已中标" ? "未缴" : "—"
      const status = raw === "未缴" ? "待缴纳" : raw
      const tone: PayRow["tone"] = status === "已缴" ? "green" : status === "已退还" ? "gray" : "amber"
      const paid = status === "已缴" || status === "已退还"
      return {
        no: b.id,
        title: b.title,
        buyer: b.buyer,
        category: b.category,
        amount: kind === "fee" ? b.signupFee : kind === "deposit" ? b.deposit : "¥3,200",
        dueTime: b.signupEnd,
        payMethod: paid ? payMethods[i % payMethods.length] : "—",
        paidTime: paid ? b.bidStart : "—",
        status,
        tone,
      }
    })

  const rows = allRows.filter((r) => tab === "全部" || r.status === tab)
  const totalDue = allRows.filter((r) => r.status === "待缴纳").length
  const totalPaid = allRows.filter((r) => r.status === "已缴").length

  const columns: Column<PayRow>[] = [
    { key: "no", header: "竞价单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "公告标题", className: "whitespace-nowrap" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "category", header: "类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "amount", header: `${label}(元)`, className: "whitespace-nowrap tabular-nums font-medium text-foreground" },
    { key: "dueTime", header: "应缴截止", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    { key: "payMethod", header: "支付方式", className: "whitespace-nowrap text-muted-foreground" },
    { key: "paidTime", header: "缴费时间", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "status",
      header: "缴纳状态",
      className: "whitespace-nowrap",
      render: (r) => <StatusPill tone={r.tone}>{r.status}</StatusPill>,
    },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) =>
        r.status === "待缴纳" ? (
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`待缴纳${label}`} value={String(totalDue)} unit="笔" tone="amber" />
        <StatCard label={`已缴纳${label}`} value={String(totalPaid)} unit="笔" tone="green" />
        <StatCard label="累计缴纳金额" value="¥84,800" unit="" tone="primary" />
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <FilterBar>
          {["全部", "待缴纳", "已缴", ...(kind === "deposit" ? ["已退还"] : [])].map((t) => (
            <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </FilterChip>
          ))}
        </FilterBar>
      </div>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.no} stickyLastColumn />
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

export function StationWorkspace({
  leaf,
  onNavigate,
}: {
  leaf: string
  onNavigate?: (leaf: string) => void
}) {
  const meta = leafMeta[leaf] ?? leafMeta["station-recycler"]
  const [detail, setDetail] = useState<SupplierBidItem | null>(null)

  const showsSignupDetail = detail && leaf === "station-supplier-bidding-signup"
  const showsBidDetail = detail && leaf === "station-supplier-bidding-mine"

  // 回收基地 · 总览：业务快捷操作 + 经营概况
  if (leaf === "station-overview") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <StationOverview onNavigate={onNavigate} />
      </div>
    )
  }

  // 供应商 · 固定价管理：网上报价 / 我的报价 / 缴纳服务费
  if (leaf.startsWith("station-supplier-fixed")) {
    return <SupplierFixed leaf={leaf} />
  }

  // 供应商 · 协议回收：协议单确认
  if (leaf === "station-supplier-agreement-confirm") {
    return <SupplierAgreement />
  }

  // 供应商 · 基地管理：接受钢厂邀约 / 申请成为合作基地
  if (leaf === "station-supplier-base") {
    return <SupplierBase />
  }

  // 供应商 · 订单管理：复用钢厂订单管理页面与内容（供应商履约视角）
  if (leaf === "station-supplier-orders") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <MillOrders perspective="supplier" />
      </div>
    )
  }

  // 回收商 · 采购管理：复用钢厂采购组件（采购模式一致）
  if (leaf === "station-recycler-purchase-bidding") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <PurchaseBidding />
      </div>
    )
  }
  if (leaf === "station-recycler-purchase-fixed") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <PurchaseFixed />
      </div>
    )
  }
  if (leaf === "station-recycler-purchase-agreement") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <PurchaseAgreement />
      </div>
    )
  }
  // 回收商 · 订单管理：复用钢厂订单管理页面与内容
  if (leaf === "station-recycler-orders") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <MillOrders />
      </div>
    )
  }
  // 回收商 · 财务管理 · 费用支付：复刻钢厂财务管理页面
  if (leaf === "station-recycler-finance-payment") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <FinancePayment />
      </div>
    )
  }
  // 回收商 · 财务管理 · 反向开票：调用金税系统校验自然人年度开票额度
  if (leaf === "station-recycler-finance-reverse") {
    return <FinanceReverse />
  }
  return (
    <div className="h-full overflow-y-auto p-6">
      {showsSignupDetail ? (
        <SignupDetail item={detail} onBack={() => setDetail(null)} />
      ) : showsBidDetail ? (
        <SupplierBidDetail item={detail} onBack={() => setDetail(null)} />
      ) : (
        <>
          <PageHeader title={meta.title} desc={meta.desc} />
          <div className="mt-4">
            {leaf === "station-supplier-bidding-signup" && <SignupContent onOpen={setDetail} />}
            {leaf === "station-supplier-bidding-mine" && <MyBiddingContent onOpen={setDetail} />}
            {leaf === "station-supplier-bidding-fee" && <PaymentContent kind="fee" />}
            {leaf === "station-supplier-bidding-deposit" && <PaymentContent kind="deposit" />}
            {leaf === "station-supplier-bidding-service" && <PaymentContent kind="service" />}
            {leaf === "station-recycler" && (
              <div className="flex h-[50vh] items-center justify-center">
                <div className="w-full max-w-md rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Recycle className="size-7" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{meta.title}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    该角色工作台规划中，后续将参照供应商结构展开各业务模块。
                  </p>
                </div>
              </div>
            )}
            {leaf === "station-seller" && (
              <div className="flex h-[50vh] items-center justify-center">
                <div className="w-full max-w-lg rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Recycle className="size-7" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">销售</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    销售可在盘古平台 - 资源盘活 - 资源处置进行发布
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
