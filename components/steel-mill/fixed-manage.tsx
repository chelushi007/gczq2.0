"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Megaphone,
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FilePenLine,
  ArrowDownToLine,
  CalendarClock,
  ShoppingCart,
  Info,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill, statusTone, type StatusTone } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import { type FixedItem } from "@/lib/steel-data"
import { cn } from "@/lib/utils"

type NodeState = "done" | "active" | "todo"

interface ManageAction {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  desc: string
}

interface ProcessNode {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  state: NodeState
  actions: ManageAction[]
}

const nodeStateMeta: Record<
  NodeState,
  { label: string; tone: "green" | "blue" | "gray"; Icon: React.ComponentType<{ className?: string }> }
> = {
  done: { label: "已完成", tone: "green", Icon: CheckCircle2 },
  active: { label: "进行中", tone: "blue", Icon: Clock },
  todo: { label: "待进行", tone: "gray", Icon: Circle },
}

function buildNodes(item: FixedItem): ProcessNode[] {
  const hasTaken = item.taken !== "0 吨"
  const isDone = item.status === "已完成"
  const isOff = item.status === "已下架"

  return [
    {
      id: "publish",
      title: "发布",
      icon: Megaphone,
      state: "done",
      actions: [
        { key: "notice", label: "查看公告", icon: FileText, desc: "查看本次固定价采购需求的完整公告" },
        { key: "manageNotice", label: "管理公告", icon: FilePenLine, desc: "修改一口价、采购量等信息，或将需求下架" },
      ],
    },
    {
      id: "take",
      title: "接单",
      icon: ClipboardList,
      state: isDone || isOff ? "done" : "active",
      actions: [
        { key: "orders", label: "确认报价", icon: ShoppingCart, desc: "查看供应商接单情况并确认成交" },
        { key: "modifyTime", label: "修改时间", icon: CalendarClock, desc: "延长或调整挂单有效期" },
      ],
    },
  ]
}

/* ---------------- 通用元素 ---------------- */

function SectionCard({
  title,
  extra,
  children,
}: {
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
}) {
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
        {required && <span className="mr-0.5 text-destructive">*</span>}
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"

/* 1. 查看公告 */
function NoticeContent({ item }: { item: FixedItem }) {
  const materialRows = [
    { no: 1, cat: item.category, name: `${item.category}废钢`, spec: "≤1m", unit: "吨", brand: "—", qty: item.qty, cond: "废旧" },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>固定价（一口价）采购不收取报名费与保证金，供应商在有效期内可直接接单供货。</span>
      </div>
      <SectionCard
        title="基本信息"
        extra={
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Download className="size-3.5" />
            下载公告 PDF
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="需求名称" value={item.title} />
          <Field label="挂单编号" value={item.id} />
          <Field label="废钢类别" value={item.category} />
          <Field label="采购单位" value={item.unit} />
          <Field label="所在地区" value={item.region} />
          <Field label="一口价" value={<span className="text-primary">{item.price}</span>} />
          <Field label="计划采购量" value={item.qty} />
          <Field label="已成交量" value={item.taken} />
          <Field label="有效期至" value={item.validUntil} />
          <Field label="采购联系人" value={item.contact} />
          <Field label="发布时间" value={item.publishTime} />
          <Field label="报名费 / 保证金" value={<span className="text-emerald-600">不收取</span>} />
        </div>
      </SectionCard>

      <SectionCard title="交易指南">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="交货方式" value="供应商送货到厂" />
          <Field label="结算方式" value="过磅后按实际重量结算" />
          <Field label="支付方式" value="线上支付" />
          <Field label="单笔最小接单量" value="不限" />
          <Field label="质量要求" value="符合国标废钢验收标准" />
          <Field label="接单方式" value="有效期内直接接单，择优确认" />
        </div>
      </SectionCard>

      <SectionCard title="物料信息">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {["序号", "物料分类", "物料名称", "规格型号", "单位", "品牌", "数量", "新旧程度"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialRows.map((m) => (
                <tr key={m.no} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{m.no}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{m.cat}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{m.name}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.spec}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.unit}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.brand}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-foreground">{m.qty}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

/* 2. 修改公告 */
function ModifyNoticeContent({ item }: { item: FixedItem }) {
  const editable = item.status === "挂单中" || item.status === "部分成交"
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!editable) {
    return (
      <SectionCard title="修改公告">
        <div className="flex items-start gap-2 rounded-md border border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>当前需求为「{item.status}」，已不可修改公告。仅挂单中或部分成交的需求可在有效期内修改。</span>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="修改公告">
      <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>有效期内可修改一口价、计划采购量与有效期等信息。已接单部分不受影响。</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormRow label="需求名称" required>
          <input className={inputCls} defaultValue={item.title} />
        </FormRow>
        <FormRow label="废钢类别" required>
          <input className={inputCls} defaultValue={item.category} />
        </FormRow>
        <FormRow label="一口价(元/吨)" required>
          <input className={inputCls} defaultValue={item.price.replace(/[^\d]/g, "")} inputMode="numeric" />
        </FormRow>
        <FormRow label="计划采购量(吨)" required>
          <input className={inputCls} defaultValue={item.qty.replace(/[^\d]/g, "")} inputMode="numeric" />
        </FormRow>
        <FormRow label="有效期至" required>
          <input type="date" className={inputCls} defaultValue={item.validUntil} />
        </FormRow>
        <FormRow label="采购联系人" required>
          <input className={inputCls} defaultValue={item.contact} />
        </FormRow>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={() => setConfirmOpen(true)}>保存修改</Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="size-4" />
            已保存修改
          </span>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认修改公告"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                setSaved(true)
              }}
            >
              确认保存
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          确认保存对需求「{item.title}」的修改？修改后将立即更新公告展示，已接单部分不受影响。
        </p>
      </Modal>
    </SectionCard>
  )
}

/* 3. 下架公告 */
function OffShelfContent({ item }: { item: FixedItem }) {
  const alreadyOff = item.status === "已下架" || item.status === "已完成"
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [reason, setReason] = useState("")

  if (alreadyOff) {
    return (
      <SectionCard title="下架公告">
        <div className="flex items-start gap-2 rounded-md border border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>当前需求已为「{item.status}」状态，无需再次下架。</span>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="下架公告">
      {done ? (
        <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>需求已下架，停止接单。已成交订单继续按流程结算。</span>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>下架后供应商将无法继续接单，操作不可撤销。已成交部分不受影响。</span>
          </div>
          <FormRow label="下架原因" required>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls.replace("h-9", "min-h-20") + " resize-y py-2"}
              placeholder="请输入下架原因，如采购量已满足、价格调整等"
            />
          </FormRow>
          <div className="mt-4">
            <Button variant="destructive" disabled={!reason.trim()} onClick={() => setConfirmOpen(true)}>
              <ArrowDownToLine className="size-4" />
              下架需求
            </Button>
          </div>
        </>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认下架需求"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                setDone(true)
              }}
            >
              确认下架
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          确认下架需求「{item.title}」？下架后将停止接单，且无法恢复。
        </p>
      </Modal>
    </SectionCard>
  )
}

/* 2+3. 管理公告（修改公告 / 下架公告 合并） */
function ManageNoticeContent({ item }: { item: FixedItem }) {
  const [tab, setTab] = useState<"modify" | "off">("modify")
  const tabs = [
    { key: "modify" as const, label: "修改公告", icon: FilePenLine },
    { key: "off" as const, label: "下架公告", icon: ArrowDownToLine },
  ]
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-card text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>
      {tab === "modify" ? <ModifyNoticeContent item={item} /> : <OffShelfContent item={item} />}
    </div>
  )
}

/* 4. 选择报价（接单确认） */
interface TakeRow {
  id: string
  name: string
  contact: string
  phone: string
  qty: string
  time: string
  status: "待确认" | "已确认" | "已拒绝"
}
const initialTakeRows: TakeRow[] = [
  { id: "T1", name: "华东再生资源有限公司", contact: "王建国", phone: "138****6621", qty: "200 吨", time: "2026-09-07 10:24", status: "已确认" },
  { id: "T2", name: "江苏鑫盛物资回收公司", contact: "李海涛", phone: "139****3308", qty: "120 吨", time: "2026-09-07 14:12", status: "待确认" },
  { id: "T3", name: "浙江环晟金属科技", contact: "张伟", phone: "137****9902", qty: "80 吨", time: "2026-09-08 09:33", status: "待确认" },
  { id: "T4", name: "安徽绿源废旧金属", contact: "刘芳", phone: "135****8820", qty: "150 吨", time: "2026-09-08 11:05", status: "待确认" },
]
const takeTone: Record<string, StatusTone> = {
  待确认: "amber",
  已确认: "green",
  已拒绝: "red",
}

function OrdersContent({ item }: { item: FixedItem }) {
  const [rows, setRows] = useState<TakeRow[]>(initialTakeRows)
  const decide = (id: string, status: "已确认" | "已拒绝") =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

  const planQty = item.qty
  const takenQty = item.taken
  const takenNum = Number.parseFloat(item.taken.replace(/[^\d.]/g, "")) || 0
  const planNum = Number.parseFloat(item.qty.replace(/[^\d.]/g, "")) || 0
  const progress = planNum > 0 ? Math.min(100, Math.round((takenNum / planNum) * 100)) : 0

  return (
    <SectionCard title="接单情况" extra={<span className="text-xs text-muted-foreground">一口价 {item.price} · 共 {rows.length} 家接单</span>}>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "计划采购量", value: planQty, tone: "text-foreground" },
          { label: `已成交量（${progress}%）`, value: takenQty, tone: "text-primary" },
          { label: "已确认接单", value: rows.filter((r) => r.status === "已确认").length + " 家", tone: "text-emerald-600" },
          { label: "待确认接单", value: rows.filter((r) => r.status === "待确认").length + " 家", tone: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-background px-4 py-3">
            <div className={cn("text-xl font-semibold tabular-nums", s.tone)}>{s.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {["序号", "供应商名称", "联系人", "联系方式", "接单量", "接单价", "接单时间", "状态", "操作"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{r.name}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{r.contact}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.phone}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-foreground">{r.qty}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-primary">{item.price}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.time}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StatusPill tone={takeTone[r.status]}>{r.status}</StatusPill>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {r.status === "待确认" ? (
                    <div className="flex gap-2">
                      <button onClick={() => decide(r.id, "已确认")} className="text-xs font-medium text-primary hover:underline">
                        确认成交
                      </button>
                      <button onClick={() => decide(r.id, "已拒绝")} className="text-xs font-medium text-destructive hover:underline">
                        拒绝
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

/* 5. 修改时间 */
function ModifyTimeContent({ item }: { item: FixedItem }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  return (
    <SectionCard title="修改有效期">
      <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>可延长挂单有效期以便供应商继续接单，缩短有效期不影响已成交订单。</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="当前有效期至" value={item.validUntil} />
        <FormRow label="调整为" required>
          <input type="date" className={inputCls} defaultValue={item.validUntil} />
        </FormRow>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={() => setConfirmOpen(true)}>提交修改</Button>
        {done && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="size-4" />
            有效期已更新
          </span>
        )}
      </div>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认修改有效期"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                setDone(true)
              }}
            >
              确认
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">确认调整需求「{item.title}」的挂单有效期？</p>
      </Modal>
    </SectionCard>
  )
}

const actionContent: Record<string, (item: FixedItem) => React.ReactNode> = {
  notice: (item) => <NoticeContent item={item} />,
  manageNotice: (item) => <ManageNoticeContent item={item} />,
  orders: (item) => <OrdersContent item={item} />,
  modifyTime: (item) => <ModifyTimeContent item={item} />,
}

export function FixedManage({ item, onBack }: { item: FixedItem; onBack: () => void }) {
  const nodes = buildNodes(item)
  const [openNode, setOpenNode] = useState<string | null>(nodes.find((n) => n.state === "active")?.id ?? "publish")
  const [activeAction, setActiveAction] = useState<{ node: ProcessNode; action: ManageAction } | null>(null)

  return (
    <div className="space-y-5">
      {/* 返回 + 标题 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            返回列表
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
            <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
          </div>
          <p className="text-sm text-muted-foreground">
            挂单编号 <span className="font-medium text-foreground">{item.id}</span> · {item.region} · {item.category} ·{" "}
            <span className="text-primary">{item.price}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg border border-border bg-card px-4 py-3 text-xs">
          <span className="text-muted-foreground">计划采购量</span>
          <span className="tabular-nums text-foreground">{item.qty}</span>
          <span className="text-muted-foreground">已成交量</span>
          <span className="tabular-nums text-foreground">{item.taken}</span>
          <span className="text-muted-foreground">有效期至</span>
          <span className="tabular-nums text-foreground">{item.validUntil}</span>
        </div>
      </div>

      {/* 流程展示 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-1 text-sm font-medium text-foreground">项目流程</div>
        <p className="mb-5 text-xs text-muted-foreground">点击节点展开功能入口，再选择具体功能查看内容</p>
        <div className="flex items-center">
          {nodes.map((node, i) => {
            const meta = nodeStateMeta[node.state]
            const active = openNode === node.id
            return (
              <div key={node.id} className="flex flex-1 items-center">
                <button
                  onClick={() => setOpenNode(active ? null : node.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-md px-2 py-2 transition-colors",
                    active ? "bg-primary/5" : "hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full ring-2 transition-colors",
                      node.state === "done" && "bg-emerald-50 text-emerald-600 ring-emerald-200",
                      node.state === "active" && "bg-primary/10 text-primary ring-primary/30",
                      node.state === "todo" && "bg-muted text-muted-foreground ring-border",
                    )}
                  >
                    <node.icon className="size-5" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>
                      {node.title}
                    </span>
                    <ChevronDown
                      className={cn("size-3.5 text-muted-foreground transition-transform", active && "rotate-180")}
                    />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <meta.Icon
                      className={cn(
                        "size-3",
                        meta.tone === "green" && "text-emerald-600",
                        meta.tone === "blue" && "text-primary",
                        meta.tone === "gray" && "text-muted-foreground",
                      )}
                    />
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                  </span>
                </button>
                {i < nodes.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 w-8 shrink-0 rounded-full sm:w-16",
                      node.state === "done" ? "bg-emerald-300" : "bg-border",
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* 展开的功能入口 */}
        {openNode && (
          <div className="mt-5 border-t border-border pt-5">
            {nodes
              .filter((n) => n.id === openNode)
              .map((node) => (
                <div key={node.id}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <node.icon className="size-4 text-primary" />
                    {node.title} · 功能入口
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {node.actions.map((a) => {
                      const selected = activeAction?.action.key === a.key
                      return (
                        <button
                          key={a.key}
                          onClick={() => setActiveAction({ node, action: a })}
                          className={cn(
                            "group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                          )}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <a.icon className="size-5" />
                          </span>
                          <span className="space-y-0.5">
                            <span
                              className={cn(
                                "block text-sm font-medium",
                                selected ? "text-primary" : "text-foreground group-hover:text-primary",
                              )}
                            >
                              {a.label}
                            </span>
                            <span className="block text-xs leading-relaxed text-muted-foreground">{a.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 子模块内容 */}
      {activeAction && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{activeAction.node.title}</span>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <activeAction.action.icon className="size-4 text-primary" />
              {activeAction.action.label}
            </span>
          </div>
          {actionContent[activeAction.action.key]?.(item)}
        </div>
      )}
    </div>
  )
}
