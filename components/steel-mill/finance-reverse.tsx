"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { reverseOrders, reversePayees, REVERSE_ANNUAL_LIMIT, type ReverseOrder, type ReversePayee } from "@/lib/steel-data"
import { Receipt, ShieldCheck, ShieldAlert, Loader2, FileText, Landmark, UserRound, PackageCheck } from "lucide-react"

const yuan = (n: number) => `¥${n.toLocaleString()}`
const wan = (n: number) => `${(n / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })} 万`

type CheckState =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "pass"; remain: number }
  | { phase: "fail"; remain: number; over: number }

function usageTone(rate: number): "green" | "amber" | "red" {
  if (rate >= 0.9) return "red"
  if (rate >= 0.6) return "amber"
  return "green"
}

const invoiceTone = (s: ReverseOrder["invoiceStatus"]) => (s === "已开票" ? "green" : s === "已作废" ? "muted" : "amber")

export function FinanceReverse() {
  const [region, setRegion] = useState("全部")
  const [invoiceStatus, setInvoiceStatus] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [issueId, setIssueId] = useState<string | null>(null)
  // 各自然人年度已开票额（可累加）
  const [usedMap, setUsedMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(reversePayees.map((p) => [p.id, p.annualUsed])),
  )
  const [orders, setOrders] = useState<ReverseOrder[]>(() => reverseOrders.map((o) => ({ ...o })))

  const regions = useMemo(() => ["全部", ...Array.from(new Set(orders.map((o) => o.region)))], [orders])

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        if (region !== "全部" && o.region !== region) return false
        if (invoiceStatus !== "全部" && o.invoiceStatus !== invoiceStatus) return false
        if (keyword && !`${o.payeeName}${o.idNo}${o.id}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [region, invoiceStatus, keyword, orders],
  )

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.invoiceStatus === "待开票")
    const pendingAmount = pending.reduce((s, o) => s + o.amount, 0)
    const issuedAmount = orders.filter((o) => o.invoiceStatus === "已开票").reduce((s, o) => s + o.amount, 0)
    return { pendingCount: pending.length, pendingAmount, issuedAmount }
  }, [orders])

  const issueOrder = orders.find((o) => o.id === issueId) ?? null
  const issuePayee = issueOrder ? reversePayees.find((p) => p.id === issueOrder.payeeId) ?? null : null
  const issueUsed = issueOrder ? usedMap[issueOrder.payeeId] ?? 0 : 0

  function handleIssue(order: ReverseOrder) {
    setUsedMap((prev) => ({ ...prev, [order.payeeId]: (prev[order.payeeId] ?? 0) + order.amount }))
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              invoiceStatus: "已开票",
              invoiceNo: o.id.replace("DD", "RP"),
              issueDate: new Date().toISOString().slice(0, 10),
            }
          : o,
      ),
    )
  }

  const cols: Column<ReverseOrder>[] = [
    { key: "id", header: "订单号", render: (r) => <span className="font-medium text-foreground whitespace-nowrap">{r.id}</span> },
    {
      key: "payee",
      header: "自然人",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-foreground">
          <UserRound className="size-3.5 text-muted-foreground" />
          {r.payeeName}
        </span>
      ),
    },
    { key: "idNo", header: "身份证号", render: (r) => <span className="tabular-nums text-muted-foreground">{r.idNo}</span> },
    { key: "region", header: "地区", render: (r) => <span className="whitespace-nowrap">{r.region}</span> },
    { key: "category", header: "类别" },
    { key: "qty", header: "数量", render: (r) => <span className="tabular-nums">{r.qty}</span> },
    { key: "unitPrice", header: "单价", render: (r) => <span className="tabular-nums text-muted-foreground">{r.unitPrice}</span> },
    { key: "amount", header: "可开票金额", render: (r) => <span className="tabular-nums font-medium text-foreground">{yuan(r.amount)}</span> },
    { key: "deliveryDate", header: "交货日期", render: (r) => <span className="tabular-nums whitespace-nowrap">{r.deliveryDate}</span> },
    {
      key: "settle",
      header: "结算状态",
      render: (r) => <StatusPill tone={r.settleStatus === "已结算" ? "green" : "amber"} label={r.settleStatus} />,
    },
    {
      key: "invoice",
      header: "开票状态",
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <StatusPill tone={invoiceTone(r.invoiceStatus)} label={r.invoiceStatus} />
          {r.invoiceNo && <span className="text-xs tabular-nums text-muted-foreground">{r.invoiceNo}</span>}
        </div>
      ),
    },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        r.invoiceStatus === "待开票" ? (
          <Button size="sm" onClick={() => setIssueId(r.id)}>
            反向开票
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{r.issueDate ?? "—"}</span>
        ),
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <PageHeader title="反向开票" desc="针对与自然人的采购订单代开发票，开票前调用国家金税系统校验该自然人年度开票额度（单个自然人不超过 500 万元/年）" />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<PackageCheck className="size-5" />} label="待开票订单" value={`${stats.pendingCount} 单`} tone="primary" />
        <StatCard icon={<Receipt className="size-5" />} label="待开票金额" value={yuan(stats.pendingAmount)} tone="amber" />
        <StatCard icon={<ShieldCheck className="size-5" />} label="已开票金额" value={yuan(stats.issuedAmount)} tone="green" />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <Landmark className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="text-sm text-foreground">
          <div className="font-medium">国家金税系统联网校验</div>
          <p className="mt-0.5 text-muted-foreground">
            对自然人订单发起反向开票时，系统实时调用金税系统校验该自然人本年度累计开票额度，累计超过 500 万元将自动拦截。
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <FilterBar>
          <FilterChip label="地区" value={region} options={regions} onChange={setRegion} />
          <FilterChip label="开票状态" value={invoiceStatus} options={["全部", "待开票", "已开票", "已作废"]} onChange={setInvoiceStatus} />
          <div className="flex-1" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名 / 身份证号 / 订单号"
            className="h-9 w-72 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </FilterBar>
      </div>

      <div className="mt-4 flex items-center">
        <span className="ml-auto text-sm text-muted-foreground">共 {rows.length} 单</span>
      </div>

      <div className="mt-3">
        <DataTable rows={rows} columns={cols} rowKey={(r) => r.id} />
      </div>

      <IssueModal
        order={issueOrder}
        payee={issuePayee}
        annualUsed={issueUsed}
        onClose={() => setIssueId(null)}
        onIssue={handleIssue}
      />
    </div>
  )
}

function IssueModal({
  order,
  payee,
  annualUsed,
  onClose,
  onIssue,
}: {
  order: ReverseOrder | null
  payee: ReversePayee | null
  annualUsed: number
  onClose: () => void
  onIssue: (order: ReverseOrder) => void
}) {
  const [check, setCheck] = useState<CheckState>({ phase: "idle" })

  function reset() {
    setCheck({ phase: "idle" })
    onClose()
  }

  function confirmIssue() {
    if (order && check.phase === "pass") onIssue(order)
    reset()
  }

  const remain = Math.max(0, REVERSE_ANNUAL_LIMIT - annualUsed)

  function runCheck() {
    if (!order) return
    setCheck({ phase: "checking" })
    setTimeout(() => {
      const over = annualUsed + order.amount - REVERSE_ANNUAL_LIMIT
      if (over > 0) setCheck({ phase: "fail", remain, over })
      else setCheck({ phase: "pass", remain })
    }, 1400)
  }

  return (
    <Modal
      open={!!order}
      onClose={reset}
      title={`反向开票 · ${order?.id ?? ""}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={reset}>
            取消
          </Button>
          {check.phase === "pass" ? (
            <Button onClick={confirmIssue}>确认开具发票</Button>
          ) : (
            <Button onClick={runCheck} disabled={check.phase === "checking"}>
              {check.phase === "checking" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-4 animate-spin" />
                  校验中
                </span>
              ) : (
                "调用金税系统校验"
              )}
            </Button>
          )}
        </div>
      }
    >
      {order && payee && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">订单信息</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <Row k="订单号" v={order.id} />
              <Row k="类别" v={order.category} />
              <Row k="数量" v={order.qty} />
              <Row k="单价" v={order.unitPrice} />
              <Row k="可开票金额" v={yuan(order.amount)} />
              <Row k="交货日期" v={order.deliveryDate} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">自然人 · 年度额度</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <Row k="自然人" v={payee.name} />
              <Row k="身份证号" v={payee.idNo} />
              <Row k="收款账户" v={payee.bankAccount} />
              <Row k="税务年度" v={payee.taxYear} />
              <Row k="年度已开票" v={yuan(annualUsed)} />
              <Row k="剩余额度" v={yuan(remain)} />
            </div>
            <UsageBar used={annualUsed} />
          </div>

          {check.phase === "idle" && (
            <p className="text-xs text-muted-foreground">
              本次开票 <span className="font-medium text-foreground tabular-nums">{yuan(order.amount)}</span>，开票后本年度累计将达{" "}
              <span className="font-medium text-foreground tabular-nums">{yuan(annualUsed + order.amount)}</span>，年度限额 {wan(REVERSE_ANNUAL_LIMIT)}元。
            </p>
          )}

          {check.phase === "checking" && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 text-sm">
              <Loader2 className="size-5 animate-spin text-primary" />
              <div>
                <div className="font-medium text-foreground">正在连接国家金税系统…</div>
                <div className="text-xs text-muted-foreground">校验 {payee.name}（{payee.taxYear} 年度）累计开票额度</div>
              </div>
            </div>
          )}

          {check.phase === "pass" && (
            <div className="flex items-start gap-3 rounded-lg border border-green-500/40 bg-green-500/5 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-600" />
              <div className="text-sm">
                <div className="font-medium text-green-700">金税系统校验通过，可开具发票</div>
                <p className="mt-1 text-muted-foreground">
                  本次开票 <span className="font-medium text-foreground tabular-nums">{yuan(order.amount)}</span>，未超过年度 500 万元限额；
                  开票后剩余额度 <span className="font-medium text-foreground tabular-nums">{yuan(remain - order.amount)}</span>。
                </p>
              </div>
            </div>
          )}

          {check.phase === "fail" && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/5 p-4">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div className="text-sm">
                <div className="font-medium text-red-700">金税系统校验未通过，开票已拦截</div>
                <p className="mt-1 text-muted-foreground">
                  本次开票 <span className="font-medium text-foreground tabular-nums">{yuan(order.amount)}</span> 将使年度累计
                  超出 500 万元限额 <span className="font-medium text-red-600 tabular-nums">{yuan(check.over)}</span>，
                  当前剩余额度仅 <span className="font-medium text-foreground tabular-nums">{yuan(check.remain)}</span>，无法开具。
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
            <FileText className="mt-0.5 size-4 shrink-0" />
            反向开票由采购方（华东特钢集团）代自然人向税务机关申请代开增值税普通发票，适用征收率 3%，校验通过后同步生成开票记录并更新年度额度。
          </div>
        </div>
      )}
    </Modal>
  )
}

function UsageBar({ used }: { used: number }) {
  const rate = Math.min(1, used / REVERSE_ANNUAL_LIMIT)
  const tone = usageTone(rate)
  const bar = tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : "bg-green-500"
  const text = tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : "text-green-600"
  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bar}`} style={{ width: `${Math.round(rate * 100)}%` }} />
      </div>
      <span className={`tabular-nums text-xs font-medium ${text}`}>额度使用率 {Math.round(rate * 100)}%</span>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: "primary" | "green" | "amber"
}) {
  const toneCls =
    tone === "green"
      ? "bg-green-500/10 text-green-600"
      : tone === "amber"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-primary/10 text-primary"
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className={`flex size-10 items-center justify-center rounded-lg ${toneCls}`}>{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</div>
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right text-foreground">{v}</span>
    </div>
  )
}
