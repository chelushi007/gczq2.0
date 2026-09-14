"use client"

import { useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  FileSignature,
  Wallet,
  Truck,
  PackageCheck,
  CheckCircle2,
  Clock,
  Circle,
  ScrollText,
  Plus,
  Upload,
  CreditCard,
  Banknote,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import type { OrderItem } from "@/lib/steel-data"

export type FulfillPerspective = "purchaser" | "supplier"

type NodeState = "done" | "active" | "todo"

interface NodeDef {
  id: string
  title: string
  icon: typeof FileSignature
}

const stateMeta: Record<NodeState, { label: string; Icon: typeof Clock }> = {
  done: { label: "已完成", Icon: CheckCircle2 },
  active: { label: "进行中", Icon: Clock },
  todo: { label: "待处理", Icon: Circle },
}

function num(s: string) {
  return Number((s || "").replace(/[^\d.]/g, "")) || 0
}
function unitOf(s: string) {
  return (s || "").replace(/[\d.,\s]/g, "") || "吨"
}
function money(n: number) {
  return "¥" + Math.round(n).toLocaleString()
}

const nodeDefs: Record<FulfillPerspective, NodeDef[]> = {
  purchaser: [
    { id: "contract", title: "合同签署", icon: FileSignature },
    { id: "reconcile", title: "发起对账", icon: ScrollText },
    { id: "payment", title: "货款支付", icon: Wallet },
    { id: "receipt", title: "确认收货", icon: PackageCheck },
  ],
  supplier: [
    { id: "contract", title: "合同签署", icon: FileSignature },
    { id: "reconcile", title: "确认对账", icon: ScrollText },
    { id: "collection", title: "货款收取", icon: Wallet },
    { id: "ship", title: "发货", icon: Truck },
  ],
}

export function OrderFulfill({
  item,
  perspective,
  onBack,
}: {
  item: OrderItem
  perspective: FulfillPerspective
  onBack: () => void
}) {
  const defs = nodeDefs[perspective]
  const [done, setDone] = useState<Set<string>>(() => new Set())
  const [openNode, setOpenNode] = useState<string>(defs[0].id)

  const nodes = defs.map((d) => {
    let state: NodeState
    if (done.has(d.id)) state = "done"
    else if (defs.findIndex((x) => !done.has(x.id)) === defs.indexOf(d)) state = "active"
    else state = "todo"
    return { ...d, state }
  })

  const markDone = (id: string) => setDone((prev) => new Set(prev).add(id))
  const total = num(item.qty)
  const unit = unitOf(item.qty)
  const amountNum = item.amount ? num(item.amount) : total * num(item.unitPrice)
  const buyer = "华东特钢集团"

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            返回订单列表
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">订单履约 · {item.id}</h2>
            <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
            <StatusPill tone="violet">{item.channel}</StatusPill>
          </div>
          <p className="text-sm text-muted-foreground">
            {perspective === "purchaser" ? "供应商" : "采购单位"}{" "}
            <span className="font-medium text-foreground">{perspective === "purchaser" ? item.supplier : buyer}</span> ·{" "}
            {item.category} · {item.qty} · <span className="text-primary">{item.unitPrice}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg border border-border bg-card px-4 py-3 text-xs">
          <span className="text-muted-foreground">合同金额</span>
          <span className="tabular-nums text-foreground">
            {item.amount ? item.amount : `${money(amountNum)}（协议周期结算）`}
          </span>
          <span className="text-muted-foreground">交货日期</span>
          <span className="tabular-nums text-foreground">{item.deliveryDate}</span>
          <span className="text-muted-foreground">视角</span>
          <span className="text-foreground">{perspective === "purchaser" ? "采购方履约" : "供应商履约"}</span>
        </div>
      </div>

      {/* 流程条：点击节点直接展示内容 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-1 text-sm font-medium text-foreground">履约流程</div>
        <p className="mb-5 text-xs text-muted-foreground">点击任一节点直接办理，节点之间可自由切换</p>
        <div className="flex items-center">
          {nodes.map((node, i) => {
            const meta = stateMeta[node.state]
            const active = openNode === node.id
            return (
              <div key={node.id} className="flex flex-1 items-center">
                <button
                  onClick={() => setOpenNode(node.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-md px-2 py-2 transition-colors",
                    active ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full ring-2 transition-colors",
                      node.state === "done" && "bg-emerald-50 text-emerald-600 ring-emerald-200",
                      node.state === "active" && "bg-primary/10 text-primary ring-primary/30",
                      node.state === "todo" && "bg-muted text-muted-foreground ring-border",
                      active && node.state === "todo" && "text-primary",
                    )}
                  >
                    <node.icon className="size-5" />
                  </span>
                  <span className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>
                    {node.title}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <meta.Icon
                      className={cn(
                        "size-3",
                        node.state === "done" && "text-emerald-600",
                        node.state === "active" && "text-primary",
                        node.state === "todo" && "text-muted-foreground",
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
      </div>

      {/* 节点内容：完全由 openNode 决定，切换不残留 */}
      <NodeContent
        key={openNode}
        nodeId={openNode}
        perspective={perspective}
        item={item}
        buyer={buyer}
        total={total}
        unit={unit}
        amountNum={amountNum}
        done={done.has(openNode)}
        onComplete={() => markDone(openNode)}
      />
    </div>
  )
}

function NodeContent({
  nodeId,
  perspective,
  item,
  buyer,
  total,
  unit,
  amountNum,
  done,
  onComplete,
}: {
  nodeId: string
  perspective: FulfillPerspective
  item: OrderItem
  buyer: string
  total: number
  unit: string
  amountNum: number
  done: boolean
  onComplete: () => void
}) {
  const contractNo = "HT" + item.id.replace("DD", "")
  if (nodeId === "contract")
    return (
      <ContractPanel
        item={item}
        perspective={perspective}
        buyer={buyer}
        contractNo={contractNo}
        amountNum={amountNum}
        done={done}
        onComplete={onComplete}
      />
    )
  if (nodeId === "reconcile")
    return (
      <ReconcilePanel
        item={item}
        perspective={perspective}
        total={total}
        unit={unit}
        done={done}
        onComplete={onComplete}
      />
    )
  if (nodeId === "payment")
    return <PaymentPanel item={item} amountNum={amountNum} done={done} onComplete={onComplete} />
  if (nodeId === "collection")
    return <CollectionPanel item={item} amountNum={amountNum} done={done} onComplete={onComplete} />
  if (nodeId === "receipt")
    return <ReceiptPanel item={item} total={total} unit={unit} done={done} onComplete={onComplete} />
  if (nodeId === "ship") return <ShipPanel item={item} total={total} unit={unit} done={done} onComplete={onComplete} />
  return null
}

/* ---------------- 合同签署 ---------------- */
function ContractPanel({
  item,
  perspective,
  buyer,
  contractNo,
  amountNum,
  done,
  onComplete,
}: {
  item: OrderItem
  perspective: FulfillPerspective
  buyer: string
  contractNo: string
  amountNum: number
  done: boolean
  onComplete: () => void
}) {
  const isPurchaser = perspective === "purchaser"
  const [method, setMethod] = useState<"online" | "offline">("online")
  const [confirm, setConfirm] = useState(false)
  const [ok, setOk] = useState(done)
  const [preview, setPreview] = useState(false)
  const [uploadName, setUploadName] = useState("")
  const uploadRef = useRef<HTMLInputElement>(null)

  return (
    <Panel title="合同签署" desc="选择线上电子签署或上传线下已签合同">
      <StatGrid
        rows={[
          ["合同编号", contractNo],
          ["采购单位", buyer],
          ["供应商", item.supplier],
          ["成交方式", item.channel],
          ["标的类别", item.category],
          ["合同数量", item.qty],
          ["结算单价", item.unitPrice],
          ["合同金额", item.amount ? item.amount : `${money(amountNum)}（协议周期结算）`],
          ["交货日期", item.deliveryDate],
        ]}
      />

      <div className="mt-5 space-y-3">
        <div className="text-sm font-medium text-foreground">签署方式</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MethodCard
            active={method === "online"}
            onClick={() => setMethod("online")}
            icon={FileSignature}
            title="线上电子签署"
            desc={isPurchaser ? "生成电子合同并推送供应商在线签署" : "在线确认并电子签署采购方发起的合同"}
          />
          <MethodCard
            active={method === "offline"}
            onClick={() => setMethod("offline")}
            icon={FileText}
            title="确认线下合同"
            desc="预览双方已线下签署盖章的合同并确认归档"
          />
        </div>

        {method === "offline" && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <FileText className="size-4" />
              {uploadName ? `已上传：${uploadName}` : `线下合同 ${contractNo}（双方已签署盖章）`}
            </span>
            <div className="flex items-center gap-2">
              <input
                ref={uploadRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setUploadName(e.target.files?.[0]?.name ?? "")}
              />
              <Button variant="outline" size="sm" onClick={() => uploadRef.current?.click()}>
                <Upload className="mr-1 size-4" />
                上传合同
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreview(true)}>
                预览合同
              </Button>
            </div>
          </div>
        )}
      </div>

      <ActionFooter
        ok={ok}
        doneText={
          method === "offline" ? "线下合同已确认归档" : isPurchaser ? "电子合同已发起并推送签署" : "电子合同已确认签署"
        }
        buttonText={
          method === "offline" ? "确认线下合同" : isPurchaser ? "发起电子合同" : "确认并签署合同"
        }
        onClick={() => setConfirm(true)}
        extra={
          <Button variant="outline" size="sm">
            下载合同 PDF
          </Button>
        }
      />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认合同签署？"
        desc={
          method === "offline"
            ? `确认线下合同 ${contractNo} 已由双方签署盖章并归档，归档后进入后续履约环节。`
            : isPurchaser
              ? `按成交结果生成电子合同 ${contractNo} 并推送「${item.supplier}」签署。`
              : `确认签署采购方发起的电子合同 ${contractNo}。`
        }
        onConfirm={() => {
          setOk(true)
          onComplete()
          setConfirm(false)
        }}
      />

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={`线下合同预览 · ${contractNo}`}
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreview(false)}>
            关闭
          </Button>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
            <div className="text-base font-semibold text-foreground">废钢采购合同</div>
            <div className="mt-1 text-xs text-muted-foreground">合同编号：{contractNo}</div>
          </div>
          <StatGrid
            rows={[
              ["采购单位（甲方）", buyer],
              ["供应商（乙方）", item.supplier],
              ["标的类别", item.category],
              ["合同数量", item.qty],
              ["结算单价", item.unitPrice],
              ["合同金额", item.amount ? item.amount : `${money(amountNum)}（协议周期结算）`],
              ["交货日期", item.deliveryDate],
              ["签署方式", "线下签署盖章"],
            ]}
          />
          <p className="leading-relaxed text-muted-foreground">
            甲乙双方经友好协商，就上述废钢采购事宜达成一致，双方已在纸质合同上签字盖章。本预览用于线上核对合同要素，确认无误后归档并进入后续履约环节。
          </p>
        </div>
      </Modal>
    </Panel>
  )
}

/* ---------------- 对账（采购方发起 / 供应商确认） ---------------- */
type Cycle = "一次性" | "按月" | "按季度"
function ReconcilePanel({
  item,
  perspective,
  total,
  unit,
  done,
  onComplete,
}: {
  item: OrderItem
  perspective: FulfillPerspective
  total: number
  unit: string
  done: boolean
  onComplete: () => void
}) {
  const isPurchaser = perspective === "purchaser"
  const [cycle, setCycle] = useState<Cycle>("一次性")
  const [confirm, setConfirm] = useState(false)
  const [ok, setOk] = useState(done)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmedRows, setConfirmedRows] = useState<string[]>([])
  const [rowConfirm, setRowConfirm] = useState<string | null>(null)
  const price = num(item.unitPrice)

  const history = useMemo(() => {
    const base = item.id.replace("DD", "DZ")
    if (cycle === "一次性") return []
    const periods =
      cycle === "按月"
        ? ["2026-06", "2026-07", "2026-08"]
        : ["2026-Q1", "2026-Q2", "2026-Q3"]
    return periods.map((p, i) => {
      const qty = Math.round((total / (periods.length + 1)) * (i + 1) * 0.5)
      const last = i === periods.length - 1
      const createdAt = p.includes("Q") ? `${p.replace("Q1", "03").replace("Q2", "06").replace("Q3", "09").replace("2026-", "2026-")}-25` : `${p}-25`
      return {
        no: `${base}-${String(i + 1).padStart(2, "0")}`,
        period: p,
        qty,
        amount: qty * price,
        status: last ? "待确认" : "已确认",
        createdAt,
        confirmedAt: last ? "" : p.includes("Q") ? `${p} 期末` : `${p}-28`,
      }
    })
  }, [cycle, total, price, item.id])

  const curQty = Math.round(total * 0.6)
  const curAmount = curQty * price

  return (
    <Panel
      title={isPurchaser ? "发起对账" : "确认对账"}
      desc={isPurchaser ? "按到货数量与结算单价发起对账单" : "核对采购方发起的对账单并确认"}
      action={
        isPurchaser ? (
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 size-4" />
            新增对账单
          </Button>
        ) : undefined
      }
    >
      <div className="mb-4 space-y-2">
        <div className="text-sm font-medium text-foreground">对账周期</div>
        <div className="flex flex-wrap gap-2">
          {(["一次性", "按月", "按季度"] as Cycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                cycle === c
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <StatGrid
        rows={[
          ["对账单号", item.id.replace("DD", "DZ") + "-C"],
          ["对账周期", cycle],
          ["本期对账数量", `${curQty} / ${total} ${unit}`],
          ["结算单价", item.unitPrice],
          ["本期对账金额", money(curAmount)],
          ["累计已对账", `${Math.round(total * 0.4)} ${unit}`],
          ["对账状态", ok ? (isPurchaser ? "已发起" : "已确认") : "待处理"],
          ["对账人", isPurchaser ? "刘采购" : "王供应"],
          ["更新时间", "2026-09-08"],
        ]}
      />

      {cycle !== "一次性" && (
        <div className="mt-5">
          <div className="mb-2 text-sm font-medium text-foreground">历史对账记录</div>
          <MiniTable
            head={["对账单号", "对账期", "对账数量", "对账金额", "创建时间", "确认时间", "状态", ...(isPurchaser ? [] : ["操作"])]}
            rows={history.map((h) => {
              const confirmed = h.status === "已确认" || confirmedRows.includes(h.no)
              return [
                h.no,
                h.period,
                `${h.qty} ${unit}`,
                money(h.amount),
                h.createdAt,
                confirmed ? h.confirmedAt || "2026-09-08" : "—",
                <StatusPill key="s" tone={confirmed ? "green" : "amber"}>
                  {confirmed ? "已确认" : "待确认"}
                </StatusPill>,
                ...(isPurchaser
                  ? []
                  : [
                      confirmed ? (
                        <span key="op" className="text-xs text-muted-foreground">
                          已确认
                        </span>
                      ) : (
                        <Button key="op" size="sm" variant="outline" onClick={() => setRowConfirm(h.no)}>
                          确认对账
                        </Button>
                      ),
                    ]),
              ]
            })}
          />
        </div>
      )}

      <ConfirmModal
        open={rowConfirm !== null}
        onClose={() => setRowConfirm(null)}
        title="确认对账单？"
        desc={`核对采购方对账单 ${rowConfirm ?? ""}，确认无误后该期对账完成，进入收款环节。`}
        onConfirm={() => {
          if (rowConfirm) {
            setConfirmedRows((prev) => [...prev, rowConfirm])
            const remaining = history.filter((h) => h.status !== "已确认" && !confirmedRows.includes(h.no) && h.no !== rowConfirm)
            if (remaining.length === 0) {
              setOk(true)
              onComplete()
            }
          }
          setRowConfirm(null)
        }}
      />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={isPurchaser ? "确认发起对账？" : "确认对账单？"}
        desc={
          isPurchaser
            ? `按 ${cycle} 对已到货 ${curQty} ${unit} × ${item.unitPrice} 生成对账单，金额 ${money(curAmount)}，推送供应商确认。`
            : `核对采购方 ${cycle} 对账单：数量 ${curQty} ${unit}、金额 ${money(curAmount)}，确认后进入收款环节。`
        }
        onConfirm={() => {
          setOk(true)
          onComplete()
          setConfirm(false)
        }}
      />

      <NewReconcileModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        item={item}
        unit={unit}
        curQty={curQty}
        defaultCycle={cycle}
      />
    </Panel>
  )
}

/* ---------------- 货款支付（采购方，线上/线下） ---------------- */
function PaymentPanel({
  item,
  amountNum,
  done,
  onComplete,
}: {
  item: OrderItem
  amountNum: number
  done: boolean
  onComplete: () => void
}) {
  const [method, setMethod] = useState<"online" | "offline">("online")
  const [confirm, setConfirm] = useState(false)
  const [ok, setOk] = useState(done)
  const [fileName, setFileName] = useState("")
  const paid = Math.round(amountNum * 0.4)
  const due = amountNum - paid
  const cycle = item.channel === "协议" ? "按月" : "一次性"
  const payer = "华东特钢集团"

  const history = [
    { no: item.id.replace("DD", "FK") + "-01", amount: paid, method: "线上支付", payer, payee: item.supplier, date: "2026-08-31", status: "已支付" },
  ]

  return (
    <Panel title="货款支付" desc="按对账周期支付货款，支持线上支付与线下转账">
      <div className="grid grid-cols-3 gap-3">
        <BigStat label="应付货款" value={money(amountNum)} tone="muted" />
        <BigStat label="已付货款" value={money(paid)} tone="green" />
        <BigStat label="待付货款" value={money(due)} tone="amber" />
      </div>

      {/* 突出本期应付 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div>
          <div className="text-xs font-medium text-primary">本期应付货款</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-primary">{money(due)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            对账周期：{cycle} · 付款方：{payer}
          </div>
        </div>
        <div className="rounded-md bg-card px-3 py-2 text-right text-xs text-muted-foreground">
          <div>本期对账单号</div>
          <div className="mt-0.5 font-medium text-foreground">{item.id.replace("DD", "DZ")}-C</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
        <Row k="付款方" v={payer} />
        <Row k="收款方" v={item.supplier} />
        <Row k="对账周期" v={cycle} />
        <Row k="付款单号" v={item.id.replace("DD", "FK")} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="text-sm font-medium text-foreground">支付方式</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MethodCard
            active={method === "online"}
            onClick={() => setMethod("online")}
            icon={CreditCard}
            title="线上支付"
            desc="通过平台绑定的对公账户在线完成付款"
          />
          <MethodCard
            active={method === "offline"}
            onClick={() => setMethod("offline")}
            icon={Banknote}
            title="线下转账"
            desc="银行线下转账后上传付款凭证登记"
          />
        </div>

        {method === "online" ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
            <Row k="付款账户" v="华东特钢集团 · 招商银行 ****8821" />
            <Row k="收款账户" v={`${item.supplier} · ****3390`} />
            <Row k="支付金额" v={money(due)} />
            <Row k="支付渠道" v="平台在线支付" />
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-border bg-background p-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              <Row k="收款开户行" v="工商银行苏州分行" />
              <Row k="收款账号" v="6222 **** **** 3390" />
              <Row k="转账金额" v={money(due)} />
              <Row k="转账户名" v={item.supplier} />
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Upload className="size-4" />
                {fileName || "上传银行付款凭证（PDF / JPG）"}
              </span>
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">选择文件</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "已选择文件")}
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2 text-sm font-medium text-foreground">历史支付记录</div>
        <MiniTable
          head={["付款单号", "支付金额", "支付方式", "付款方", "收款方", "支付时间", "状态"]}
          rows={history.map((h) => [
            h.no,
            money(h.amount),
            h.method,
            h.payer,
            h.payee,
            h.date,
            <StatusPill key="s" tone="green">
              {h.status}
            </StatusPill>,
          ])}
        />
      </div>

      <ActionFooter
        ok={ok}
        doneText={method === "online" ? "本期货款已线上支付" : "线下付款凭证已上传登记"}
        buttonText={method === "online" ? "确认支付" : "上传凭证并登记"}
        onClick={() => setConfirm(true)}
      />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认支付货款？"
        desc={
          method === "online"
            ? `由「${payer}」通过线上支付向「${item.supplier}」付款 ${money(due)}。`
            : `登记由「${payer}」向「${item.supplier}」的线下转账 ${money(due)}。`
        }
        onConfirm={() => {
          setOk(true)
          onComplete()
          setConfirm(false)
        }}
      />
    </Panel>
  )
}

/* ---------------- 货款收取（供应商） ---------------- */
function CollectionPanel({
  item,
  amountNum,
  done,
  onComplete,
}: {
  item: OrderItem
  amountNum: number
  done: boolean
  onComplete: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [ok, setOk] = useState(done)
  const received = Math.round(amountNum * 0.4)
  const due = amountNum - received
  const term = item.channel === "协议" ? "货到 30 天" : "货到 7 天"

  const history = [
    {
      no: item.id.replace("DD", "SK") + "-01",
      amount: received,
      method: "线上到账",
      term,
      date: "2026-08-31",
      account: "工商银行 ****3390",
      status: "已到账",
    },
  ]

  return (
    <Panel title="货款收取" desc="跟踪货款到账，核对应收 / 已收金额">
      <div className="grid grid-cols-3 gap-3">
        <BigStat label="应收货款" value={money(amountNum)} tone="muted" />
        <BigStat label="已收货款" value={money(received)} tone="green" />
        <BigStat label="待收货款" value={money(due)} tone="amber" />
      </div>
      <div className="mt-3">
        <ProgressBar value={received} total={amountNum} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
        <Row k="收款单号" v={item.id.replace("DD", "SK")} />
        <Row k="付款单位" v="华东特钢集团" />
        <Row k="收款账户" v="工商银行苏州分行 ****3390" />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-sm font-medium text-foreground">收款历史记录</div>
        <MiniTable
          head={["收款单号", "收款金额", "收款方式", "收款账户", "到账时间", "状态"]}
          rows={history.map((h) => [
            h.no,
            money(h.amount),
            h.method,
            h.account,
            h.date,
            <StatusPill key="s" tone="green">
              {h.status}
            </StatusPill>,
          ])}
        />
      </div>

      <ActionFooter
        ok={ok}
        doneText="已确认本期收款"
        buttonText="确认收款"
        onClick={() => setConfirm(true)}
      />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认收款？"
        desc={`确认已收到采购方支付的货款 ${money(received)}（账期 ${term}）。`}
        onConfirm={() => {
          setOk(true)
          onComplete()
          setConfirm(false)
        }}
      />
    </Panel>
  )
}

/* ---------------- 确认收货（采购方） ---------------- */
function ReceiptPanel({
  item,
  total,
  unit,
  done,
  onComplete,
}: {
  item: OrderItem
  total: number
  unit: string
  done: boolean
  onComplete: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [ok, setOk] = useState(done)
  const [track, setTrack] = useState<{ no: string; waybill: string } | null>(null)
  const received = Math.round(total * 0.6)

  const history = [
    {
      no: item.id.replace("DD", "SH") + "-01",
      goods: item.category,
      qty: Math.round(total * 0.35),
      shipDate: "2026-09-03",
      arriveDate: "2026-09-05",
      carrier: "顺丰物流",
      plate: "苏A·8823F",
      pickup: "TH-20260903-01",
      waybill: "SU-20260903-01",
      status: "已收货",
    },
    {
      no: item.id.replace("DD", "SH") + "-02",
      goods: item.category,
      qty: received - Math.round(total * 0.35),
      shipDate: "2026-09-06",
      arriveDate: "2026-09-08",
      carrier: "德邦物流",
      plate: "浙B·5567K",
      pickup: "TH-20260906-02",
      waybill: "SF-88213",
      status: "待收货",
    },
  ]

  return (
    <Panel title="确认收货" desc="登记到货批次并跟踪应收 / 已收货量">
      <QtyStats
        title="收货进度"
        total={total}
        value={received}
        unit={unit}
        receivableLabel="应收货量"
        receivedLabel="已收货量"
      />

      <div className="mt-5">
        <div className="mb-2 text-sm font-medium text-foreground">历史收货记录</div>
        <MiniTable
          head={["收货单号", "货物名称", "收货数量", "发货时间", "到货时间", "物流公司", "车牌号", "提货单", "物流单号", "状态"]}
          rows={history.map((h) => [
            h.no,
            h.goods,
            `${h.qty} ${unit}`,
            h.shipDate,
            h.arriveDate,
            h.carrier,
            h.plate,
            h.pickup,
            <button
              key="w"
              onClick={() => setTrack({ no: h.no, waybill: h.waybill })}
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
            >
              <Truck className="size-3.5" />
              {h.waybill}
            </button>,
            <StatusPill key="s" tone={h.status === "已收货" ? "green" : "amber"}>
              {h.status}
            </StatusPill>,
          ])}
        />
      </div>

      <TrackModal track={track} onClose={() => setTrack(null)} />

      <ActionFooter
        ok={ok}
        doneText="已确认收货"
        buttonText="确认收货"
        onClick={() => setConfirm(true)}
      />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认收货？"
        desc={`确认已收到「${item.supplier}」交付的 ${received} ${unit} 货物。`}
        onConfirm={() => {
          setOk(true)
          onComplete()
          setConfirm(false)
        }}
      />
    </Panel>
  )
}

/* ---------------- 发货（供应商） ---------------- */
function ShipPanel({
  item,
  total,
  unit,
  done,
  onComplete,
}: {
  item: OrderItem
  total: number
  unit: string
  done: boolean
  onComplete: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [ok, setOk] = useState(done)
  const [addOpen, setAddOpen] = useState(false)
  const [pickupOpen, setPickupOpen] = useState(false)
  const [track, setTrack] = useState<{ no: string; waybill: string } | null>(null)
  const shipped = Math.round(total * 0.6)

  const history = [
    {
      no: item.id.replace("DD", "FH") + "-01",
      goods: item.category,
      qty: Math.round(total * 0.35),
      date: "2026-09-03",
      logistics: "苏物流",
      plate: "苏E·6621F",
      waybill: "WL-20260903-01",
      pickup: "TH-0903-01",
      status: "已签收",
    },
    {
      no: item.id.replace("DD", "FH") + "-02",
      goods: item.category,
      qty: shipped - Math.round(total * 0.35),
      date: "2026-09-06",
      logistics: "顺丰重货",
      plate: "沪B·8821K",
      waybill: "SF-88213",
      pickup: "TH-0906-02",
      status: "运输中",
    },
  ]

  return (
    <Panel
      title="发货"
      desc="按批次登记发货、录入提货单，跟踪应发 / 已发数量"
      action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPickupOpen(true)}>
            <ScrollText className="mr-1 size-4" />
            录入提货单
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 size-4" />
            新增发货单
          </Button>
        </div>
      }
    >
      <QtyStats
        title="发货进度"
        total={total}
        value={shipped}
        unit={unit}
        receivableLabel="应发数量"
        receivedLabel="已发数量"
      />

      <div className="mt-5">
        <div className="mb-2 text-sm font-medium text-foreground">发货历史记录</div>
        <MiniTable
          head={["发货单号", "货物名称", "发货数量", "发货时间", "物流公司", "车牌号", "运单号", "提货单", "状态"]}
          rows={history.map((h) => [
            h.no,
            h.goods,
            `${h.qty} ${unit}`,
            h.date,
            h.logistics,
            h.plate,
            <button
              key="w"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => setTrack({ no: h.no, waybill: h.waybill })}
            >
              {h.waybill}
            </button>,
            h.pickup,
            <StatusPill key="s" tone={h.status === "已签收" ? "green" : "blue"}>
              {h.status}
            </StatusPill>,
          ])}
        />
      </div>

      <TrackModal track={track} onClose={() => setTrack(null)} />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认登记发货？"
        desc={`按合同向采购方发货，本次登记后已发 ${shipped} / ${total} ${unit}。`}
        onConfirm={() => {
          setOk(true)
          onComplete()
          setConfirm(false)
        }}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="新增发货单"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => setAddOpen(false)}>
              生成发货单
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="货物名称">
            <input className={inputCls} defaultValue={item.category} placeholder="如 重废" />
          </Field>
          <Field label="发货数量">
            <input className={inputCls} placeholder={`如 100 ${unit}`} />
          </Field>
          <Field label="物流公司">
            <input className={inputCls} placeholder="如 顺丰重货" />
          </Field>
          <Field label="车牌号">
            <input className={inputCls} placeholder="如 沪B·8821K" />
          </Field>
          <Field label="运单号">
            <input className={inputCls} placeholder="如 SF-88213" />
          </Field>
          <Field label="预计到达">
            <input className={inputCls} type="date" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={pickupOpen}
        onClose={() => setPickupOpen(false)}
        title="录入提货单"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPickupOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => setPickupOpen(false)}>
              保存提货单
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="提货单号">
            <input className={inputCls} placeholder="如 TH-0906-02" />
          </Field>
          <Field label="提货数量">
            <input className={inputCls} placeholder={`如 100 ${unit}`} />
          </Field>
          <Field label="提货人">
            <input className={inputCls} placeholder="提货人姓名" />
          </Field>
          <Field label="提货时间">
            <input className={inputCls} type="date" />
          </Field>
        </div>
      </Modal>
    </Panel>
  )
}

/* ---------------- 物流轨迹弹窗 ---------------- */
function TrackModal({ track, onClose }: { track: { no: string; waybill: string } | null; onClose: () => void }) {
  const steps = [
    { time: "2026-09-06 09:12", node: "苏州仓", desc: "货物已装车，发往华东特钢集团", done: true },
    { time: "2026-09-06 14:40", node: "苏州转运中心", desc: "货物已发出", done: true },
    { time: "2026-09-07 08:05", node: "无锡分拨中心", desc: "运输途中，预计次日到达", done: true },
    { time: "2026-09-08 10:30", node: "华东特钢集团收货区", desc: "已到达，等待卸货验收", done: false },
  ]
  return (
    <Modal
      open={!!track}
      onClose={onClose}
      title={`物流轨迹 · ${track?.waybill ?? ""}`}
      footer={
        <Button size="sm" onClick={onClose}>
          关闭
        </Button>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          收货单号 <span className="font-medium text-foreground">{track?.no}</span>
        </span>
        <span className="text-muted-foreground">
          运单号 <span className="font-medium text-foreground">{track?.waybill}</span>
        </span>
      </div>
      <ol className="space-y-0">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 flex size-3 shrink-0 items-center justify-center rounded-full ring-2",
                  s.done ? "bg-primary ring-primary/30" : "bg-muted ring-border",
                )}
              />
              {i < steps.length - 1 && (
                <span className={cn("w-0.5 flex-1", s.done ? "bg-primary/40" : "bg-border")} />
              )}
            </div>
            <div className={cn("pb-5", i === steps.length - 1 && "pb-0")}>
              <div className={cn("text-sm font-medium", s.done ? "text-foreground" : "text-muted-foreground")}>
                {s.node}
              </div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
              <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">{s.time}</div>
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  )
}

/* ---------------- 新增对账单弹窗 ---------------- */
function NewReconcileModal({
  open,
  onClose,
  item,
  unit,
  curQty,
  defaultCycle,
}: {
  open: boolean
  onClose: () => void
  item: OrderItem
  unit: string
  curQty: number
  defaultCycle: Cycle
}) {
  const [cycle, setCycle] = useState<Cycle>(defaultCycle)
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新增对账单"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" onClick={onClose}>
            生成对账单
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="对账周期">
          <select className={inputCls} value={cycle} onChange={(e) => setCycle(e.target.value as Cycle)}>
            <option value="一次性">一次性</option>
            <option value="按月">按月</option>
            <option value="按季度">按季度</option>
          </select>
        </Field>

        {cycle !== "一次性" && (
          <Field label={cycle === "按月" ? "对账月份" : "对账季度"}>
            {cycle === "按月" ? (
              <input className={inputCls} type="month" defaultValue="2026-09" />
            ) : (
              <select className={inputCls} defaultValue="2026-Q3">
                <option>2026-Q1</option>
                <option>2026-Q2</option>
                <option>2026-Q3</option>
                <option>2026-Q4</option>
              </select>
            )}
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="对账起始日期">
            <input className={inputCls} type="date" defaultValue="2026-09-01" />
          </Field>
          <Field label="对账截止日期">
            <input className={inputCls} type="date" defaultValue="2026-09-30" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="对账数量">
            <input className={inputCls} placeholder={`如 ${curQty} ${unit}`} />
          </Field>
          <Field label="结算单价">
            <input className={inputCls} defaultValue={item.unitPrice} />
          </Field>
        </div>
        <Field label="对账人">
          <input className={inputCls} defaultValue="刘采购" />
        </Field>
        <Field label="备注">
          <input className={inputCls} placeholder="选填" />
        </Field>
      </div>
    </Modal>
  )
}

/* ---------------- 通用小组件 ---------------- */
const inputCls =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"

function Panel({
  title,
  desc,
  action,
  children,
}: {
  title: string
  desc?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function MethodCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: typeof FileSignature
  title: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-primary/40",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="space-y-0.5">
        <span className={cn("block text-sm font-medium", active ? "text-primary" : "text-foreground")}>{title}</span>
        <span className="block text-xs leading-relaxed text-muted-foreground">{desc}</span>
      </span>
    </button>
  )
}

function ActionFooter({
  ok,
  doneText,
  buttonText,
  onClick,
  extra,
}: {
  ok: boolean
  doneText: string
  buttonText: string
  onClick: () => void
  extra?: React.ReactNode
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
      {extra}
      {ok ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
          <CheckCircle2 className="size-4" />
          {doneText}
        </span>
      ) : (
        <Button size="sm" onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </div>
  )
}

function ConfirmModal({
  open,
  onClose,
  title,
  desc,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  title: string
  desc: string
  onConfirm: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" onClick={onConfirm}>
            确认
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-border py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-foreground">{v}</span>
    </div>
  )
}

function StatGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([k, v]) => (
        <Row key={k} k={k} v={v} />
      ))}
    </div>
  )
}

function MiniTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-2 text-foreground">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QtyStats({
  title,
  total,
  value,
  unit,
  receivableLabel,
  receivedLabel,
}: {
  title: string
  total: number
  value: number
  unit: string
  receivableLabel: string
  receivedLabel: string
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="grid grid-cols-3 gap-3">
        <BigStat label={receivableLabel} value={`${total} ${unit}`} tone="muted" />
        <BigStat label={receivedLabel} value={`${value} ${unit}`} tone="green" />
        <BigStat label="待处理" value={`${total - value} ${unit}`} tone="amber" />
      </div>
      <ProgressBar value={value} total={total} />
    </div>
  )
}

function BigStat({ label, value, tone }: { label: string; value: string; tone: "muted" | "green" | "amber" }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          tone === "green" && "text-emerald-600",
          tone === "amber" && "text-amber-600",
          tone === "muted" && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  )
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>完成进度</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
