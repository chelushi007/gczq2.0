"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { paymentBills, invoiceRecords, type PaymentBill, type InvoiceRecord } from "@/lib/steel-data"
import { Wallet, FileText, Receipt, CreditCard, Banknote } from "lucide-react"

const tabs = ["全部", "待支付", "支付中", "已支付"]

function billTone(s: PaymentBill["status"]) {
  return s === "已支付" ? "green" : s === "支付中" ? "amber" : "muted"
}
function invoiceTone(s: InvoiceRecord["status"]) {
  return s === "已认证" ? "green" : s === "已开具" ? "primary" : "muted"
}
function num(v: string) {
  return Number(v.replace(/[^\d.]/g, "")) || 0
}

export function FinancePayment() {
  const [tab, setTab] = useState("全部")
  const [method, setMethod] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [invoiceOf, setInvoiceOf] = useState<PaymentBill | null>(null)
  const [payOf, setPayOf] = useState<PaymentBill | null>(null)
  const [payMethod, setPayMethod] = useState<"线上支付" | "线下转账">("线上支付")

  const rows = useMemo(
    () =>
      paymentBills.filter((b) => {
        if (tab !== "全部" && b.status !== tab) return false
        if (method !== "全部" && b.method !== method) return false
        if (keyword && !`${b.id}${b.orderId}${b.payee}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [tab, method, keyword],
  )

  const stats = useMemo(() => {
    const total = paymentBills.reduce((s, b) => s + num(b.amount), 0)
    const paid = paymentBills.filter((b) => b.status === "已支付").reduce((s, b) => s + num(b.amount), 0)
    const pending = total - paid
    return { total, paid, pending }
  }, [])

  const cols: Column<PaymentBill>[] = [
    { key: "id", header: "支付单号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "feeType", header: "费用类型", render: (r) => <StatusPill tone="primary" label={r.feeType} /> },
    { key: "orderId", header: "关联订单", render: (r) => <span className="tabular-nums text-muted-foreground">{r.orderId}</span> },
    { key: "payee", header: "收款方" },
    { key: "category", header: "类别" },
    { key: "qty", header: "数量", render: (r) => <span className="tabular-nums">{r.qty}</span> },
    { key: "amount", header: "支付金额", render: (r) => <span className="tabular-nums font-medium text-foreground">{r.amount}</span> },
    { key: "period", header: "结算账期" },
    {
      key: "method",
      header: "支付方式",
      render: (r) =>
        r.status === "已支付" ? (
          <span className="inline-flex items-center gap-1.5 text-foreground">
            {r.method === "线上支付" ? (
              <CreditCard className="size-3.5 text-primary" />
            ) : (
              <Banknote className="size-3.5 text-primary" />
            )}
            {r.method}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "payDate",
      header: "支付时间",
      render: (r) =>
        r.payDate ? (
          <span className="tabular-nums text-foreground">{r.payDate}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "status", header: "状态", render: (r) => <StatusPill tone={billTone(r.status)} label={r.status} /> },
    {
      key: "invoiceStatus",
      header: "发票",
      render: (r) => (
        <button
          type="button"
          onClick={() => setInvoiceOf(r)}
          className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
        >
          <Receipt className="size-3.5" />
          {r.invoiceStatus}
        </button>
      ),
    },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        r.status === "已支付" ? (
          <Button variant="ghost" size="sm" onClick={() => setInvoiceOf(r)}>
            查看发票
          </Button>
        ) : (
          <Button size="sm" onClick={() => setPayOf(r)}>
            支付
          </Button>
        ),
    },
  ]

  const relatedInvoices = invoiceOf ? invoiceRecords.filter((i) => i.billId === invoiceOf.id) : []

  return (
    <div className="h-full overflow-y-auto p-6">
      <PageHeader title="费用支付" desc="按订单发起货款支付，跟踪支付状态并查看对应发票" />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Wallet className="size-5" />} label="应付货款合计" value={`¥${stats.total.toLocaleString()}`} tone="primary" />
        <StatCard icon={<Banknote className="size-5" />} label="已支付" value={`¥${stats.paid.toLocaleString()}`} tone="green" />
        <StatCard icon={<CreditCard className="size-5" />} label="待支付" value={`¥${stats.pending.toLocaleString()}`} tone="amber" />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <FilterBar>
          <FilterChip label="支付方式" value={method} options={["全部", "线上支付", "线下转账"]} onChange={setMethod} />
          <div className="flex-1" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索支付单号 / 订单 / 收款方"
            className="h-9 w-64 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </FilterBar>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">共 {rows.length} 条</span>
      </div>

      <div className="mt-3">
        <DataTable rows={rows} columns={cols} rowKey={(r) => r.id} />
      </div>

      <Modal
        open={!!invoiceOf}
        onClose={() => setInvoiceOf(null)}
        title={`发票列表 · ${invoiceOf?.id ?? ""}`}
        size="lg"
      >
        {invoiceOf && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-3">
              <Row k="关联订单" v={invoiceOf.orderId} />
              <Row k="收款方" v={invoiceOf.payee} />
              <Row k="支付金额" v={invoiceOf.amount} />
              <Row k="费用类型" v={invoiceOf.feeType} />
              <Row k="结算账期" v={invoiceOf.period} />
              <Row k="开票状态" v={invoiceOf.invoiceStatus} />
            </div>

            {relatedInvoices.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      {["发票号码", "发票抬头", "税号", "发票类型", "税率", "金额", "开票日期", "状态", "操作"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {relatedInvoices.map((iv) => (
                      <tr key={iv.id} className="border-t border-border">
                        <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{iv.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{iv.title}</td>
                        <td className="px-3 py-2 tabular-nums text-muted-foreground whitespace-nowrap">{iv.taxNo}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{iv.type}</td>
                        <td className="px-3 py-2 tabular-nums">{iv.taxRate}</td>
                        <td className="px-3 py-2 tabular-nums font-medium text-foreground whitespace-nowrap">{iv.amount}</td>
                        <td className="px-3 py-2 tabular-nums whitespace-nowrap">{iv.issueDate}</td>
                        <td className="px-3 py-2">
                          <StatusPill tone={invoiceTone(iv.status)} label={iv.status} />
                        </td>
                        <td className="px-3 py-2">
                          <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <FileText className="size-3.5" />
                            预览
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                该支付单暂未开具发票
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!payOf}
        onClose={() => setPayOf(null)}
        title={`发起支付 · ${payOf?.id ?? ""}`}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPayOf(null)}>
              取消
            </Button>
            <Button onClick={() => setPayOf(null)}>
              {payMethod === "线上支付" ? "确认在线付款" : "提交转账凭证"}
            </Button>
          </div>
        }
      >
        {payOf && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
              <div className="text-xs text-muted-foreground">本次应付货款</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-primary">{payOf.amount}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {payOf.payee} · {payOf.category} {payOf.qty} · {payOf.period}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-lg border border-border bg-background p-4 text-sm">
              <Row k="关联订单" v={payOf.orderId} />
              <Row k="费用类型" v={payOf.feeType} />
              <Row k="付款方" v="华东特钢集团" />
              <Row k="收款方" v={payOf.payee} />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-foreground">支付方式</div>
              <div className="grid grid-cols-2 gap-3">
                {(["线上支付", "线下转账"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                      payMethod === m
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-lg ${
                        payMethod === m ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m === "线上支付" ? <CreditCard className="size-4" /> : <Banknote className="size-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{m}</div>
                      <div className="text-xs text-muted-foreground">
                        {m === "线上支付" ? "对公账户在线付款" : "银行转账后上传凭证"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {payMethod === "线上支付" ? (
              <div className="space-y-2 rounded-lg border border-border bg-background p-4 text-sm">
                <Row k="付款账户" v="华东特钢集团 · 工行苏州分行 ****2201" />
                <Row k="收款账户" v={`${payOf.payee} · 工行苏州分行 ****3390`} />
                <Row k="在线渠道" v="企业网银快捷支付" />
                <p className="pt-1 text-xs text-muted-foreground">确认后系统将通过对公网银发起在线付款，实时到账后自动更新支付状态。</p>
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
                <Row k="收款户名" v={payOf.payee} />
                <Row k="收款账号" v="工商银行苏州分行 6222 **** **** 3390" />
                <Row k="转账金额" v={payOf.amount} />
                <div>
                  <div className="mb-1.5 text-muted-foreground">上传银行付款凭证</div>
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    点击上传转账回单（支持 PDF / JPG / PNG）
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
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
