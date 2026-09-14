"use client"

import { useState } from "react"
import {
  ArrowLeft,
  FileText,
  Plus,
  CheckCircle2,
  Info,
  Settings2,
  Eye,
  PencilLine,
  ArrowDownToLine,
  Users,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone, type StatusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import {
  agreementList,
  agreementSupplierPool,
  type AgreementItem,
  type AgreementSupplier,
} from "@/lib/steel-data"

const tabs = ["全部", "已发单", "待确认", "已确认", "已下架"]

const confirmTone: Record<AgreementSupplier["confirm"], StatusTone> = {
  待确认: "amber",
  已确认: "green",
  已拒绝: "red",
}

export function PurchaseAgreement() {
  const [tab, setTab] = useState("全部")
  const [list, setList] = useState<AgreementItem[]>(agreementList)
  const [active, setActive] = useState<AgreementItem | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  if (active) {
    return (
      <AgreementManage
        item={active}
        onBack={() => setActive(null)}
        onUpdate={(next) => {
          setList((prev) => prev.map((x) => (x.id === next.id ? next : x)))
          setActive(next)
        }}
      />
    )
  }

  const rows = tab === "全部" ? list : list.filter((b) => b.status === tab)

  const columns: Column<AgreementItem>[] = [
    { key: "id", header: "协议单号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "title", header: "协议单标题", render: (r) => <span className="text-foreground">{r.title}</span> },
    {
      key: "suppliers",
      header: "指定供应商",
      render: (r) =>
        r.suppliers.length === 1 ? (
          <span className="text-foreground">{r.suppliers[0].name}</span>
        ) : (
          <StatusPill tone="blue">{`${r.suppliers.length} 家供应商`}</StatusPill>
        ),
    },
    { key: "category", header: "废钢类别", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "monthlyQty", header: "约定供货量" },
    { key: "price", header: "定价方式", render: (r) => <span className="text-primary">{r.price}</span> },
    {
      key: "confirmed",
      header: "确认进度",
      render: (r) => {
        const ok = r.suppliers.filter((s) => s.confirm === "已确认").length
        return (
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{ok}</span>
            {` / ${r.suppliers.length} 已确认`}
          </span>
        )
      },
    },
    { key: "status", header: "协议单状态", render: (r) => <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill> },
    {
      key: "op",
      header: "操作",
      render: (r) => (
        <Button size="sm" onClick={() => setActive(r)}>
          <Settings2 />
          管理
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="协议回收"
        desc="采购方与供应商提前签署长期协议，采购方发起协议采购单，供应商在线确认即可履约，可指定一家或多家供应商"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            新建协议回收单
          </Button>
        }
      />

      <FilterBar>
        {tabs.map((t) => (
          <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </FilterChip>
        ))}
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />

      <CreateAgreementModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(item) => {
          setList((prev) => [item, ...prev])
          setCreateOpen(false)
        }}
      />
    </div>
  )
}

/* ---------------- 管理（发布 / 待确认 两节点） ---------------- */

const nodes = [
  { key: "publish", label: "发布", desc: "查看与管理协议单" },
  { key: "confirm", label: "待确认", desc: "供应商确认情况" },
] as const

function AgreementManage({
  item,
  onBack,
  onUpdate,
}: {
  item: AgreementItem
  onBack: () => void
  onUpdate: (next: AgreementItem) => void
}) {
  const [node, setNode] = useState<(typeof nodes)[number]["key"]>("publish")

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          返回
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-foreground">{item.title}</h2>
          <p className="text-sm text-muted-foreground">
            {item.id} · {item.suppliers.length} 家供应商
          </p>
        </div>
        <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
      </div>

      {/* 流程节点条 */}
      <div className="flex items-center gap-2">
        {nodes.map((n, i) => {
          const activeNode = node === n.key
          return (
            <div key={n.key} className="flex items-center gap-2">
              <button
                onClick={() => setNode(n.key)}
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-left transition-colors ${
                  activeNode
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    activeNode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className={`block text-sm font-medium ${activeNode ? "text-foreground" : "text-muted-foreground"}`}>
                    {n.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{n.desc}</span>
                </span>
              </button>
              {i < nodes.length - 1 && <span className="h-px w-6 bg-border" />}
            </div>
          )
        })}
      </div>

      {node === "publish" ? <PublishNode item={item} onUpdate={onUpdate} /> : <ConfirmNode item={item} />}
    </div>
  )
}

/* -------- 发布节点：查看协议单 / 管理协议单（下架 + 修改） -------- */

function PublishNode({ item, onUpdate }: { item: AgreementItem; onUpdate: (next: AgreementItem) => void }) {
  const [view, setView] = useState<"view" | "modify" | "offshelf">("view")

  const entries = [
    { key: "view", label: "查看协议单", desc: "查看协议单完整信息", icon: Eye },
    { key: "modify", label: "修改协议单", desc: "调整定价、供货量与交货要求", icon: PencilLine },
    { key: "offshelf", label: "下架协议单", desc: "停止该协议单继续履约", icon: ArrowDownToLine },
  ] as const

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {entries.map((e) => {
          const activeEntry = view === e.key
          const disabled = item.status === "已下架" && e.key !== "view"
          return (
            <button
              key={e.key}
              disabled={disabled}
              onClick={() => setView(e.key)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                activeEntry ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  activeEntry ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <e.icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">{e.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{e.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      {view === "view" && <ViewAgreement item={item} />}
      {view === "modify" && <ModifyAgreement item={item} onUpdate={onUpdate} />}
      {view === "offshelf" && <OffShelfAgreement item={item} onUpdate={onUpdate} />}
    </div>
  )
}

function ViewAgreement({ item }: { item: AgreementItem }) {
  return (
    <SectionCard title="协议单信息">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
        <Field label="协议单号" value={item.id} />
        <Field label="协议单标题" value={item.title} />
        <Field label="废钢类别" value={item.category} />
        <Field label="约定供货量" value={item.monthlyQty} />
        <Field label="定价方式" value={<span className="text-primary">{item.price}</span>} />
        <Field label="协议期限" value={item.period} />
        <Field label="签署日期" value={item.signedAt} />
        <Field label="要求交货日期" value={item.deliverBy} />
        <Field label="协议单状态" value={<StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>} />
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">指定供应商（{item.suppliers.length}）</p>
        <div className="flex flex-wrap gap-2">
          {item.suppliers.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
              <span className="text-foreground">{s.name}</span>
              <StatusPill tone={confirmTone[s.confirm]}>{s.confirm}</StatusPill>
            </span>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

function ModifyAgreement({ item, onUpdate }: { item: AgreementItem; onUpdate: (next: AgreementItem) => void }) {
  const [price, setPrice] = useState(item.price)
  const [monthlyQty, setMonthlyQty] = useState(item.monthlyQty)
  const [deliverBy, setDeliverBy] = useState(item.deliverBy)
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)

  return (
    <SectionCard title="修改协议单">
      <div className="mb-4 flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>修改后将重新推送给已指定供应商确认，已确认的供应商需重新确认。</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormRow label="定价方式">
          <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
        </FormRow>
        <FormRow label="约定供货量">
          <input value={monthlyQty} onChange={(e) => setMonthlyQty(e.target.value)} className={inputCls} />
        </FormRow>
        <FormRow label="要求交货日期">
          <input type="date" value={deliverBy} onChange={(e) => setDeliverBy(e.target.value)} className={inputCls} />
        </FormRow>
      </div>
      {done && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          已保存修改并重新推送供应商确认
        </p>
      )}
      <div className="mt-5">
        <Button disabled={item.status === "已下架"} onClick={() => setConfirm(true)}>
          保存修改
        </Button>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认修改协议单"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                onUpdate({
                  ...item,
                  price,
                  monthlyQty,
                  deliverBy,
                  status: "待确认",
                  suppliers: item.suppliers.map((s) => ({ ...s, confirm: "待确认", confirmedAt: undefined })),
                })
                setConfirm(false)
                setDone(true)
              }}
            >
              <CheckCircle2 />
              确认保存
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>确认将以下修改保存并重新推送给供应商确认？</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-md border border-border bg-muted/30 p-3">
            <Field label="定价方式" value={<span className="text-primary">{price}</span>} />
            <Field label="约定供货量" value={monthlyQty} />
            <Field label="要求交货日期" value={deliverBy || "待定"} />
          </div>
        </div>
      </Modal>
    </SectionCard>
  )
}

function OffShelfAgreement({ item, onUpdate }: { item: AgreementItem; onUpdate: (next: AgreementItem) => void }) {
  const [reason, setReason] = useState("")
  const [confirm, setConfirm] = useState(false)

  if (item.status === "已下架") {
    return (
      <SectionCard title="下架协议单">
        <EmptyHint text="该协议单已下架，不再继续履约。" />
      </SectionCard>
    )
  }

  return (
    <SectionCard title="下架协议单">
      <div className="mb-4 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>下架后该协议单将停止履约，供应商无法再确认接单，请谨慎操作。</span>
      </div>
      <FormRow label="下架原因" required>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="请填写下架原因"
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </FormRow>
      <div className="mt-5">
        <Button variant="destructive" disabled={!reason.trim()} onClick={() => setConfirm(true)}>
          <ArrowDownToLine />
          下架协议单
        </Button>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认下架协议单"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onUpdate({ ...item, status: "已下架" })
                setConfirm(false)
              }}
            >
              <CheckCircle2 />
              确认下架
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          确认下架协议单「{item.title}」？下架原因：{reason}
        </p>
      </Modal>
    </SectionCard>
  )
}

/* -------- 待确认节点：查看供应商确认情况 -------- */

function ConfirmNode({ item }: { item: AgreementItem }) {
  const columns: Column<AgreementSupplier>[] = [
    { key: "name", header: "供应商", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: "contact", header: "联系人", className: "text-muted-foreground" },
    { key: "confirm", header: "确认状态", render: (r) => <StatusPill tone={confirmTone[r.confirm]}>{r.confirm}</StatusPill> },
    { key: "confirmedAt", header: "确认时间", render: (r) => <span className="text-muted-foreground">{r.confirmedAt || "—"}</span> },
  ]

  const ok = item.suppliers.filter((s) => s.confirm === "已确认").length
  const pending = item.suppliers.filter((s) => s.confirm === "待确认").length
  const rejected = item.suppliers.filter((s) => s.confirm === "已拒绝").length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="指定供应商" value={`${item.suppliers.length}`} />
        <StatCard label="已确认" value={`${ok}`} tone="green" />
        <StatCard label="待确认" value={`${pending}`} tone="amber" />
        <StatCard label="已拒绝" value={`${rejected}`} tone="red" />
      </div>
      <SectionCard title={`供应商确认情况（${item.suppliers.length}）`}>
        <div className="mb-3 flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>协议采购单已推送给指定供应商，下表实时展示各供应商的确认情况。</span>
        </div>
        <DataTable columns={columns} rows={item.suppliers} rowKey={(r) => r.name} />
      </SectionCard>
    </div>
  )
}

/* -------- 新建协议回收单（可指定一家或多家供应商） -------- */

function CreateAgreementModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (item: AgreementItem) => void
}) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("重废")
  const [monthlyQty, setMonthlyQty] = useState("")
  const [price, setPrice] = useState("")
  const [period, setPeriod] = useState("")
  const [deliverBy, setDeliverBy] = useState("")
  const [picked, setPicked] = useState<string[]>([])
  const [confirm, setConfirm] = useState(false)

  const toggle = (name: string) =>
    setPicked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  const valid = title.trim() && monthlyQty.trim() && price.trim() && picked.length > 0

  const reset = () => {
    setTitle("")
    setCategory("重废")
    setMonthlyQty("")
    setPrice("")
    setPeriod("")
    setDeliverBy("")
    setPicked([])
    setConfirm(false)
  }

  const submit = () => {
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
    const suppliers: AgreementSupplier[] = picked.map((name) => {
      const p = agreementSupplierPool.find((x) => x.name === name)
      return { name, contact: p?.contact || "—", confirm: "待确认" }
    })
    onCreate({
      id: `XY${stamp}-${Math.floor(Math.random() * 900 + 100)}`,
      title,
      suppliers,
      category,
      monthlyQty,
      price,
      period: period || "待定",
      signedAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      deliverBy: deliverBy || "待定",
      status: "已发单",
      orders: [],
    })
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新建协议回收单"
      size="lg"
      footer={
        confirm ? (
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              返回修改
            </Button>
            <Button onClick={submit}>
              <CheckCircle2 />
              确认发单
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button disabled={!valid} onClick={() => setConfirm(true)}>
              下一步
            </Button>
          </>
        )
      }
    >
      {confirm ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>协议单将按协议单价发送给所选 {picked.length} 家供应商，等待其在线确认接单。</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="协议单标题" value={title} />
            <Field label="废钢类别" value={category} />
            <Field label="约定供货量" value={monthlyQty} />
            <Field label="定价方式" value={<span className="text-primary">{price}</span>} />
            <Field label="协议期限" value={period || "待定"} />
            <Field label="要求交货日期" value={deliverBy || "待定"} />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">指定供应商（{picked.length}）</p>
            <div className="flex flex-wrap gap-2">
              {picked.map((n) => (
                <span key={n} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <FormRow label="协议单标题" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：重废统废长协采购单（9月）" className={inputCls} />
          </FormRow>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormRow label="废钢类别" required>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {["重废", "统废", "中废", "生铁", "剪切料", "废铁"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormRow>
            <FormRow label="约定供货量" required>
              <input value={monthlyQty} onChange={(e) => setMonthlyQty(e.target.value)} placeholder="如：≥ 500 吨/月" className={inputCls} />
            </FormRow>
            <FormRow label="定价方式" required>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="如：固定 ¥2,600/吨 或 随行就市 -2%" className={inputCls} />
            </FormRow>
            <FormRow label="协议期限">
              <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="如：2026-09 ~ 2027-08" className={inputCls} />
            </FormRow>
            <FormRow label="要求交货日期">
              <input type="date" value={deliverBy} onChange={(e) => setDeliverBy(e.target.value)} className={inputCls} />
            </FormRow>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
              指定供应商<span className="text-destructive">*</span>
              <span className="font-normal text-muted-foreground">（可多选，已选 {picked.length} 家）</span>
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {agreementSupplierPool.map((s) => {
                const on = picked.includes(s.name)
                return (
                  <button
                    key={s.name}
                    onClick={() => toggle(s.name)}
                    className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                      on ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span>
                      <span className="block font-medium text-foreground">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">{s.contact}</span>
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {on && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ---------------- 通用元素 ---------------- */

const inputCls =
  "h-9 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-primary"

function SectionCard({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {extra}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "green" | "amber" | "red" }) {
  const color =
    tone === "green" ? "text-primary" : tone === "amber" ? "text-amber-600" : tone === "red" ? "text-destructive" : "text-foreground"
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
    </label>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <FileText className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
