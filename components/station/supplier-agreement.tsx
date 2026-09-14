"use client"

import { useMemo, useState } from "react"
import { Search, RotateCcw, FileSearch, CheckCircle2, XCircle, Info, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { StatusPill } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import { agreementList, type AgreementItem, type AgreementSupplier } from "@/lib/steel-data"

// 供应商视角：本供应商名称（演示固定为一家回收基地）
const SELF = "城南再生资源回收站"

// 协议单 + 本供应商在该协议中的确认状态（供应商视角）
type ConfirmRow = {
  agreementId: string
  title: string
  buyer: string
  category: string
  monthlyQty: string
  price: string
  period: string
  signedAt: string
  deliverBy: string
  agreementStatus: AgreementItem["status"]
  myConfirm: AgreementSupplier["confirm"]
  confirmedAt?: string
  orderCount: number
  raw: AgreementItem
}

const confirmTone: Record<AgreementSupplier["confirm"], "amber" | "green" | "red"> = {
  待确认: "amber",
  已确认: "green",
  已拒绝: "red",
}

const orderTone: Record<string, "amber" | "green" | "red" | "gray"> = {
  待供应商确认: "amber",
  供应商已确认: "green",
  供应商已拒绝: "red",
  已完成: "gray",
}

const BUYER = "华东特钢集团"

// 从协议台账中抽取本供应商被指定的协议单（排除已下架的历史单可选保留）
function buildRows(): ConfirmRow[] {
  const rows: ConfirmRow[] = []
  for (const a of agreementList) {
    const me = a.suppliers.find((s) => s.name === SELF)
    if (!me) continue
    rows.push({
      agreementId: a.id,
      title: a.title,
      buyer: BUYER,
      category: a.category,
      monthlyQty: a.monthlyQty,
      price: a.price,
      period: a.period,
      signedAt: a.signedAt,
      deliverBy: a.deliverBy,
      agreementStatus: a.status,
      myConfirm: me.confirm,
      confirmedAt: me.confirmedAt,
      orderCount: a.orders.length,
      raw: a,
    })
  }
  return rows
}

const tabs = ["全部", "待确认", "已确认", "已拒绝"]

export function SupplierAgreement() {
  const [tab, setTab] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [rowsState, setRowsState] = useState<ConfirmRow[]>(() => buildRows())
  const [detail, setDetail] = useState<ConfirmRow | null>(null)
  const [action, setAction] = useState<{ row: ConfirmRow; type: "confirm" | "reject" } | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const rows = useMemo(
    () =>
      rowsState.filter((r) => {
        if (tab !== "全部" && r.myConfirm !== tab) return false
        if (keyword && !`${r.agreementId}${r.title}${r.category}`.toLowerCase().includes(keyword.toLowerCase())) return false
        return true
      }),
    [rowsState, tab, keyword],
  )

  const pending = rowsState.filter((r) => r.myConfirm === "待确认").length
  const confirmed = rowsState.filter((r) => r.myConfirm === "已确认").length
  const rejected = rowsState.filter((r) => r.myConfirm === "已拒绝").length

  function applyAction() {
    if (!action) return
    const now = new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-")
    setRowsState((prev) =>
      prev.map((r) =>
        r.agreementId === action.row.agreementId
          ? {
              ...r,
              myConfirm: action.type === "confirm" ? "已确认" : "已拒绝",
              confirmedAt: now,
            }
          : r,
      ),
    )
    setAction(null)
    setRejectReason("")
  }

  const columns: Column<ConfirmRow>[] = [
    { key: "agreementId", header: "协议单号", className: "whitespace-nowrap font-medium text-foreground" },
    { key: "title", header: "协议标题", className: "min-w-44" },
    { key: "buyer", header: "采购单位", className: "whitespace-nowrap" },
    { key: "category", header: "类别", className: "whitespace-nowrap", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "monthlyQty", header: "协议供货量", className: "whitespace-nowrap tabular-nums" },
    { key: "price", header: "定价方式", className: "whitespace-nowrap text-primary font-medium" },
    { key: "period", header: "协议期限", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    { key: "deliverBy", header: "要求交货", className: "whitespace-nowrap tabular-nums text-muted-foreground" },
    {
      key: "myConfirm",
      header: "我的确认",
      className: "whitespace-nowrap",
      render: (r) => <StatusPill tone={confirmTone[r.myConfirm]}>{r.myConfirm}</StatusPill>,
    },
    {
      key: "op",
      header: "操作",
      className: "whitespace-nowrap",
      render: (r) =>
        r.myConfirm === "待确认" && r.agreementStatus !== "已下架" ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setAction({ row: r, type: "confirm" })}>
              <CheckCircle2 />
              确认
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAction({ row: r, type: "reject" })}>
              <XCircle />
              拒绝
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setDetail(r)}>
            <FileSearch />
            查看
          </Button>
        ),
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <PageHeader title="协议单确认" desc="接收采购方发起的长期协议采购单，在线确认或拒绝签约（无需竞价 / 报价）" />
      <div className="mt-4 space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            协议回收由采购方<span className="font-medium text-foreground">发起协议采购单</span>并指定供应商，本方
            <span className="font-medium text-foreground">确认接单</span>后即按协议约定的定价与供货量长期供货，采购方后续按协议逐笔下达采购指令单。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="待我确认" value={pending} tone="amber" />
          <StatCard label="我已确认" value={confirmed} tone="green" />
          <StatCard label="我已拒绝" value={rejected} tone="red" />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterBar>
              {tabs.map((t) => (
                <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
                  {t}
                </FilterChip>
              ))}
            </FilterBar>
            <div className="flex items-center gap-2">
              <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm focus-within:border-primary">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索协议单号 / 标题 / 类别"
                  className="w-56 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTab("全部")
                  setKeyword("")
                }}
              >
                <RotateCcw />
                重置
              </Button>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground tabular-nums">{rows.length}</span> 份协议采购单
        </p>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.agreementId} stickyLastColumn />
      </div>

      {/* 确认 / 拒绝弹窗 */}
      <Modal
        open={!!action}
        onClose={() => {
          setAction(null)
          setRejectReason("")
        }}
        title={action?.type === "confirm" ? "确认协议采购单" : "拒绝协议采购单"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setAction(null)
                setRejectReason("")
              }}
            >
              取消
            </Button>
            <Button disabled={action?.type === "reject" && !rejectReason.trim()} onClick={applyAction}>
              {action?.type === "confirm" ? "确认签约" : "确认拒绝"}
            </Button>
          </>
        }
      >
        {action && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <InfoRow label="协议单号" value={action.row.agreementId} />
              <InfoRow label="协议标题" value={action.row.title} />
              <InfoRow label="采购单位" value={action.row.buyer} />
              <InfoRow label="类别" value={action.row.category} />
              <InfoRow label="协议供货量" value={action.row.monthlyQty} />
              <InfoRow label="定价方式" value={action.row.price} accent />
              <InfoRow label="协议期限" value={action.row.period} />
            </div>
            {action.type === "confirm" ? (
              <p className="text-sm text-muted-foreground">
                确认后即与采购方建立长期协议，按<span className="font-medium text-primary">{action.row.price}</span>
                、供货量<span className="font-medium text-foreground">{action.row.monthlyQty}</span>供货，采购方后续按协议逐笔下达采购指令单。
              </p>
            ) : (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">拒绝原因</span>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="请填写拒绝签约的原因（如价格无法接受、产能不足等）"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            )}
          </div>
        )}
      </Modal>

      {/* 查看详情弹窗 */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="协议采购单详情" footer={<Button onClick={() => setDetail(null)}>关闭</Button>}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{detail.agreementId}</p>
                <p className="text-sm text-muted-foreground">{detail.title}</p>
              </div>
              <div className="ml-auto">
                <StatusPill tone={confirmTone[detail.myConfirm]}>{detail.myConfirm}</StatusPill>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3 text-sm">
              <InfoRow label="采购单位" value={detail.buyer} />
              <InfoRow label="类别" value={detail.category} />
              <InfoRow label="协议供货量" value={detail.monthlyQty} />
              <InfoRow label="定价方式" value={detail.price} accent />
              <InfoRow label="协议期限" value={detail.period} />
              <InfoRow label="签署日期" value={detail.signedAt} />
              <InfoRow label="要求交货" value={detail.deliverBy} />
              {detail.confirmedAt && <InfoRow label="我的确认时间" value={detail.confirmedAt} />}
            </div>

            {/* 该协议下已下达的采购指令单（只读，作为履约上下文） */}
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="size-4 text-muted-foreground" />
                协议下采购指令单
                <span className="text-xs font-normal text-muted-foreground">（{detail.orderCount} 笔）</span>
              </div>
              {detail.raw.orders.length ? (
                <div className="space-y-2">
                  {detail.raw.orders.map((o) => (
                    <div key={o.orderId} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{o.orderId}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.category} · {o.qty} · {o.price}
                        </p>
                      </div>
                      <StatusPill tone={orderTone[o.status] ?? "gray"}>{o.status}</StatusPill>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">暂无采购指令单</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "primary" | "amber" | "green" | "red" }) {
  const toneCls = {
    primary: "text-primary",
    amber: "text-amber-600",
    green: "text-emerald-600",
    red: "text-red-600",
  }[tone]
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${toneCls}`}>
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">份</span>
      </p>
    </div>
  )
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${accent ? "font-medium text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  )
}
