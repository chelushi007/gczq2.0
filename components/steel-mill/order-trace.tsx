"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Factory,
  Recycle,
  Wrench,
  Truck,
  Scale,
  FileCheck2,
  ClipboardList,
  PackageCheck,
  ShieldCheck,
  MapPin,
  ChevronDown,
  Camera,
  Receipt,
  User,
  GitBranch,
  Waypoints,
  FileText,
  Paperclip,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import type { OrderItem } from "@/lib/steel-data"

/* ------------------------------------------------------------------ */
/* 数据模型                                                            */
/* ------------------------------------------------------------------ */

type NodeKind = "supplier" | "recycler" | "processor" | "mill"

interface DocRef {
  label: string // 单据类型
  no: string // 单号
}

interface TraceNode {
  id: string
  kind: NodeKind
  role: string
  name: string
  region: string
  license?: string
  qty: string // 该节点确认/产出数量
  docs: DocRef[] // 节点对应单号
  vouchers: string[] // 节点对应凭证
}

interface TraceEdge {
  from: string
  to: string
  qty: string
  note?: string
  docNo: string // 该段流转的关键单号
}

interface TraceEvent {
  time: string
  title: string
  desc: string
  icon: LucideIcon
  docs?: DocRef[]
  vouchers?: string[]
}

interface TraceBatch {
  nodeId: string // 供应商节点
  events: TraceEvent[]
}

interface TraceStage {
  key: string
  title: string
  subtitle: string
  fromIds: string[]
  toId: string
  qtyOut: string
  lossRate: string
  batches?: TraceBatch[] // 多供应商：按供应商分批
  events?: TraceEvent[]
}

const nodeStyle: Record<NodeKind, { icon: LucideIcon; color: string; bg: string; ring: string; fill: string; stroke: string }> = {
  supplier: { icon: User, color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", fill: "#fffbeb", stroke: "#f59e0b" },
  recycler: { icon: Recycle, color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", fill: "#ecfdf5", stroke: "#10b981" },
  processor: { icon: Wrench, color: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200", fill: "#f5f3ff", stroke: "#8b5cf6" },
  mill: { icon: Factory, color: "text-primary", bg: "bg-primary/10", ring: "ring-primary/30", fill: "#eff6ff", stroke: "#2563eb" },
}

const tons = (n: number) => `${n.toFixed(2)} 吨`

function parseQty(q: string): number {
  const n = Number.parseFloat(q.replace(/[^\d.]/g, ""))
  return Number.isNaN(n) ? 0 : n
}

/* ------------------------------------------------------------------ */
/* 溯源数据（原型）：多个供应商 → 回收商 → 加工基地 → 钢厂                */
/* ------------------------------------------------------------------ */

function buildTrace(item: OrderItem) {
  const millQty = parseQty(item.qty)
  const processorIn = millQty / 0.92 // 加工损耗 8%
  const recyclerConfirm = processorIn
  const supplierGross = recyclerConfirm / 0.99 // 扣杂 1%

  // 固定价订单：钢厂订单的供应商来源可以有多个；其他方式默认单一来源
  const multi = item.channel === "固定价"
  const supplierProfiles = multi
    ? [
        { name: "张建国（自然人）", region: "江苏·无锡 惠山区", ratio: 0.45, plate: "苏B·7K***", date: "08-28", inv: "0417" },
        { name: "李文涛（自然人）", region: "江苏·无锡 江阴市", ratio: 0.35, plate: "苏B·2D***", date: "08-29", inv: "0418" },
        { name: "无锡宏运物资经营部", region: "江苏·无锡 新吴区", ratio: 0.2, plate: "苏B·9F***", date: "08-30", inv: "0421" },
      ]
    : [{ name: "张建国（自然人）", region: "江苏·无锡 惠山区", ratio: 1, plate: "苏B·7K***", date: "08-28", inv: "0417" }]

  const suppliers: TraceNode[] = supplierProfiles.map((p, i) => {
    const gross = supplierGross * p.ratio
    const confirm = recyclerConfirm * p.ratio
    const seq = String(i + 1).padStart(2, "0")
    return {
      id: `sup${i + 1}`,
      kind: "supplier",
      role: p.name.includes("自然人") ? "供应商 · 自然人" : "供应商 · 个体经营",
      name: p.name,
      region: p.region,
      qty: tons(confirm),
      docs: [
        { label: "供货单", no: `GH-2026${p.date.replace("-", "")}-0${seq}` },
        { label: "磅单", no: `BD-2026${p.date.replace("-", "")}-03${seq}` },
        { label: "反向开票", no: `3200 ****** ${p.inv}` },
      ],
      vouchers: ["磅单照片", "车辆车牌照片", "验质照片", "身份证明"],
    }
  })
  void supplierGross

  const recycler: TraceNode = {
    id: "rec",
    kind: "recycler",
    role: "回收商 · 交易主体",
    name: item.supplier,
    region: item.region,
    license: "再生资源回收备案 · 苏锡回备 2024-0187",
    qty: tons(recyclerConfirm),
    docs: [
      { label: "采购需求", no: "F2615" },
      { label: "入库汇总单", no: "RK-20260830-007" },
      { label: "委托加工单", no: "WT-20260831-012" },
    ],
    vouchers: ["回收备案证", "入库汇总表", "委托加工协议"],
  }

  const processor: TraceNode = {
    id: "proc",
    kind: "processor",
    role: "加工基地 · 受托方",
    name: "锡东废钢改制加工基地",
    region: "江苏·无锡 锡山区",
    license: "废钢加工准入企业 · 工信部第 9 批",
    qty: tons(millQty),
    docs: [
      { label: "入场磅单", no: "BD-20260831-0089" },
      { label: "加工记录单", no: "JG-20260902-015" },
      { label: "发货单", no: "FH-20260906-004" },
    ],
    vouchers: ["准入企业证书", "加工现场照片", "出库磅单", "GPS 运输轨迹"],
  }

  const mill: TraceNode = {
    id: "mill",
    kind: "mill",
    role: "钢厂 · 采购方",
    name: "华东钢铁厂",
    region: "江苏·苏州 张家港",
    qty: item.qty,
    docs: [
      { label: "采购订单", no: item.id },
      { label: "到厂磅单", no: "GC-20260906-1187" },
      { label: "入库单", no: "RK-20260906-0562" },
    ],
    vouchers: ["到厂磅单", "验质报告", "入库单", "结算凭证"],
  }

  const nodes: TraceNode[] = [...suppliers, recycler, processor, mill]
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<string, TraceNode>

  const edges: TraceEdge[] = [
    ...suppliers.map((s) => ({
      from: s.id,
      to: recycler.id,
      qty: s.qty,
      note: "扣杂 1.0%",
      docNo: s.docs[1].no,
    })),
    { from: recycler.id, to: processor.id, qty: tons(recyclerConfirm), note: "委托加工", docNo: "WT-20260831-012" },
    { from: processor.id, to: mill.id, qty: tons(millQty), note: "直发钢厂 · 损耗 8%", docNo: "FH-20260906-004" },
  ]

  const stages: TraceStage[] = [
    {
      key: "s1",
      title: multi ? `第一段 · ${suppliers.length} 家供应商分批供货至回收商` : "第一段 · 供应商供货至回收商",
      subtitle: "供应商向回收商出售废钢原料，回收商逐批过磅验质并反向开票",
      fromIds: suppliers.map((s) => s.id),
      toId: recycler.id,
      qtyOut: tons(recyclerConfirm),
      lossRate: "扣杂 1.0%",
      batches: suppliers.map((s, i) => {
        const p = supplierProfiles[i]
        const gross = supplierGross * p.ratio
        const confirm = recyclerConfirm * p.ratio
        return {
          nodeId: s.id,
          events: [
            {
              time: `2026-${p.date} 09:12`,
              title: "供应商接单供货",
              desc: "供应商在回收商固定价采购需求下接单供货",
              icon: ClipboardList,
              docs: [s.docs[0], { label: "采购需求", no: "F2615" }],
            },
            {
              time: `2026-${p.date} 14:40`,
              title: "到场过磅",
              desc: `回收商场地磅房过磅，净重 ${tons(gross)}`,
              icon: Scale,
              docs: [s.docs[1], { label: "运输车牌", no: p.plate }],
              vouchers: ["磅单照片", "车辆车牌照片"],
            },
            {
              time: `2026-${p.date} 15:05`,
              title: "验质扣杂",
              desc: `现场验质：含杂 1.0%，扣杂后确认 ${tons(confirm)}`,
              icon: ShieldCheck,
              docs: [{ label: "验质单", no: `YZ-2026${p.date.replace("-", "")}-0${i + 1}` }],
              vouchers: ["验质照片 ×4"],
            },
            {
              time: `2026-${p.date} 17:30`,
              title: "反向开票 · 结算",
              desc: "回收商为供应商代开发票并代征税款，税后货款打入本人账户",
              icon: Receipt,
              docs: [s.docs[2]],
              vouchers: ["电子发票", "付款回单"],
            },
          ],
        }
      }),
    },
    {
      key: "s2",
      title: "第二段 · 回收商委托加工基地改制加工",
      subtitle: "回收商将汇总原料运至加工基地，委托剪切 / 打包改制为炉料",
      fromIds: [recycler.id],
      toId: processor.id,
      qtyOut: tons(millQty),
      lossRate: "加工损耗 8.0%",
      events: [
        {
          time: "2026-08-31 08:30",
          title: "签订委托加工单",
          desc: "回收商与加工基地签订委托加工协议，约定改制为 ≤1m 剪切料",
          icon: FileCheck2,
          docs: [{ label: "委托单号", no: "WT-20260831-012" }],
          vouchers: ["委托加工协议"],
        },
        {
          time: "2026-08-31 13:15",
          title: "原料入场过磅",
          desc: `加工基地入场过磅，净重 ${tons(recyclerConfirm)}，与回收商入库汇总一致`,
          icon: Scale,
          docs: [
            { label: "磅单号", no: "BD-20260831-0089" },
            { label: "入库汇总单", no: "RK-20260830-007" },
          ],
          vouchers: ["入场磅单", "运输轨迹"],
        },
        {
          time: "2026-09-02 17:40",
          title: "改制加工完成",
          desc: `剪切 / 打包完成，产出 ≤1m 剪切料 ${tons(millQty)}，加工损耗 ${tons(recyclerConfirm - millQty)}`,
          icon: Wrench,
          docs: [{ label: "加工记录单", no: "JG-20260902-015" }],
          vouchers: ["加工现场照片 ×6", "加工记录单"],
        },
      ],
    },
    {
      key: "s3",
      title: "第三段 · 加工基地直发钢厂",
      subtitle: "加工完成后由加工基地直接向钢厂发货，回收商为交易主体",
      fromIds: [processor.id],
      toId: mill.id,
      qtyOut: item.qty,
      lossRate: "扣杂 0%",
      events: [
        {
          time: "2026-09-04 09:00",
          title: "钢厂订单成交",
          desc: `回收商与钢厂通过${item.channel}方式成交`,
          icon: ClipboardList,
          docs: [
            { label: "采购订单", no: item.id },
            { label: "成交单价", no: item.unitPrice },
          ],
        },
        {
          time: "2026-09-06 07:45",
          title: "加工基地发货",
          desc: "加工基地装车出库，按钢厂要求直发张家港厂区",
          icon: Truck,
          docs: [
            { label: "发货单号", no: "FH-20260906-004" },
            { label: "运输车牌", no: "苏E·3M***" },
          ],
          vouchers: ["出库磅单", "装车照片 ×3", "GPS 运输轨迹"],
        },
        {
          time: "2026-09-06 15:20",
          title: "钢厂到厂过磅",
          desc: `钢厂磅房过磅，净重 ${item.qty}，与发货数量一致`,
          icon: Scale,
          docs: [{ label: "磅单号", no: "GC-20260906-1187" }],
          vouchers: ["到厂磅单"],
        },
        {
          time: "2026-09-06 16:30",
          title: "钢厂验质入库",
          desc: "钢厂质检确认剪切料合格，无扣杂，正式入库",
          icon: PackageCheck,
          docs: [
            { label: "入库单", no: "RK-20260906-0562" },
            { label: "质检结论", no: "合格 · 无扣杂" },
          ],
          vouchers: ["验质报告", "入库单"],
        },
        {
          time: "2026-09-08 11:00",
          title: "结算完成",
          desc: "钢厂向回收商完成货款结算，订单履约结束",
          icon: Receipt,
          docs: [
            { label: "结算单", no: "JS-20260908-031" },
            { label: "结算金额", no: item.amount ?? "按周期结算" },
          ],
          vouchers: ["付款回单"],
        },
      ],
    },
  ]

  return { nodes, nodeMap, suppliers, recycler, processor, mill, edges, stages, multi }
}

/* ------------------------------------------------------------------ */
/* 页面                                                                */
/* ------------------------------------------------------------------ */

type ViewMode = "flow" | "graph"

export function OrderTrace({ item, onBack }: { item: OrderItem; onBack: () => void }) {
  const trace = useMemo(() => buildTrace(item), [item])
  const { nodes, nodeMap, suppliers, recycler, processor, mill, edges, stages, multi } = trace
  const [view, setView] = useState<ViewMode>("flow")
  const [openStage, setOpenStage] = useState<string | null>(stages[0]?.key ?? null)
  const [selected, setSelected] = useState<string>(mill.id)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="size-4" />
          返回
        </Button>
      </div>

      <PageHeader
        title="订单溯源"
        desc="追溯货物从多家供应商供货、回收商委托加工到加工基地直发钢厂入库的全过程，每个节点均对应单号与凭证"
      />

      {/* 订单摘要 */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Field label="订单编号" value={item.id} />
          <Field label="交易主体" value={item.supplier} />
          <Field label="成交方式" value={item.channel} />
          <Field label="品类" value={item.category} />
          <Field label="入库数量" value={item.qty} mono />
          <Field label="订单金额" value={item.amount ?? "协议按周期结算"} mono />
          <Field label="供应商来源" value={`${suppliers.length} 家`} mono />
          <StatusPill tone="green">{item.status}</StatusPill>
        </div>
      </section>

      {/* 视图切换 + 链路 / 图谱 */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">溯源链路</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {multi ? `${suppliers.length} 家供应商` : "供应商"} → 回收商 → 加工基地 → 钢厂 · 加工完成后由加工基地直发钢厂
            </p>
          </div>
          <div className="inline-flex rounded-md border border-border bg-background p-0.5 text-xs">
            <ViewTab active={view === "flow"} onClick={() => setView("flow")} icon={GitBranch} label="链路视图" />
            <ViewTab active={view === "graph"} onClick={() => setView("graph")} icon={Waypoints} label="知识图谱" />
          </div>
        </div>

        {view === "flow" ? (
          <FlowView
            suppliers={suppliers}
            recycler={recycler}
            processor={processor}
            mill={mill}
            edges={edges}
            selected={selected}
            onSelect={setSelected}
          />
        ) : (
          <GraphView nodes={nodes} nodeMap={nodeMap} edges={edges} selected={selected} onSelect={setSelected} />
        )}

        {/* 选中节点：单号与凭证 */}
        <NodePanel node={nodeMap[selected]} edges={edges} nodeMap={nodeMap} />

        {/* 数量流转汇总 */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label={multi ? `供应商供货（${suppliers.length} 家）` : "供应商供货"} value={recycler.qty} hint="扣杂后合计" />
          <Kpi label="回收商汇总入库" value={recycler.qty} hint="委托加工" />
          <Kpi label="加工基地产出" value={processor.qty} hint="加工损耗 8.0%" />
          <Kpi label="钢厂入库" value={mill.qty} hint="无扣杂" accent />
        </div>
      </section>

      {/* 分段明细 */}
      <section className="space-y-3">
        {stages.map((st, idx) => {
          const to = nodeMap[st.toId]
          const ToIcon = nodeStyle[to.kind].icon
          const open = openStage === st.key
          const fromNodes = st.fromIds.map((id) => nodeMap[id])
          const FromIcon = nodeStyle[fromNodes[0].kind].icon
          return (
            <div key={st.key} className="overflow-hidden rounded-lg border border-border bg-card">
              <button
                onClick={() => setOpenStage(open ? null : st.key)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                aria-expanded={open}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{st.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{st.subtitle}</p>
                </div>
                <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                  <span className={cn("flex items-center gap-1", nodeStyle[fromNodes[0].kind].color)}>
                    <FromIcon className="size-3.5" />
                    {fromNodes.length > 1 ? `${fromNodes.length} 家供应商` : fromNodes[0].name}
                  </span>
                  <span>→</span>
                  <span className={cn("flex items-center gap-1", nodeStyle[to.kind].color)}>
                    <ToIcon className="size-3.5" />
                    {to.name}
                  </span>
                </div>
                <div className="hidden shrink-0 text-right md:block">
                  <p className="text-xs text-muted-foreground">交付数量</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">{st.qtyOut}</p>
                </div>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                />
              </button>

              {open && (
                <div className="border-t border-border px-5 py-5">
                  {st.batches ? (
                    <div className="space-y-6">
                      {st.batches.map((b, bi) => {
                        const n = nodeMap[b.nodeId]
                        const s = nodeStyle[n.kind]
                        const Icon = s.icon
                        return (
                          <div key={b.nodeId}>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className={cn("flex size-6 items-center justify-center rounded-md", s.bg, s.color)}>
                                <Icon className="size-3.5" />
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                批次 {bi + 1} · {n.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{n.region}</span>
                              <span className="ml-auto rounded-full border border-border bg-background px-2 py-0.5 text-[11px] tabular-nums text-foreground">
                                确认 {n.qty}
                              </span>
                            </div>
                            <Timeline events={b.events} />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <Timeline events={st.events ?? []} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 链路视图（流程图）                                                    */
/* ------------------------------------------------------------------ */

function FlowView({
  suppliers,
  recycler,
  processor,
  mill,
  edges,
  selected,
  onSelect,
}: {
  suppliers: TraceNode[]
  recycler: TraceNode
  processor: TraceNode
  mill: TraceNode
  edges: TraceEdge[]
  selected: string
  onSelect: (id: string) => void
}) {
  const e2 = edges.find((e) => e.from === recycler.id)!
  const e3 = edges.find((e) => e.from === processor.id)!
  return (
    <div className="mt-5 flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.15fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
      {/* 供应商列（可多个）：窄屏横排，宽屏纵排 */}
      <div className={cn("grid gap-2 xl:grid-cols-1", suppliers.length > 1 && "sm:grid-cols-3")}>
        {suppliers.map((s) => (
          <NodeCard key={s.id} node={s} compact selected={selected === s.id} onClick={() => onSelect(s.id)} />
        ))}
      </div>
      <Connector qty={recycler.qty} note={suppliers.length > 1 ? `${suppliers.length} 批汇总 · 扣杂 1.0%` : "扣杂 1.0%"} />
      <NodeCard node={recycler} selected={selected === recycler.id} onClick={() => onSelect(recycler.id)} />
      <Connector qty={e2.qty} note={e2.note} />
      <NodeCard node={processor} selected={selected === processor.id} onClick={() => onSelect(processor.id)} />
      <Connector qty={e3.qty} note={e3.note} />
      <NodeCard node={mill} selected={selected === mill.id} onClick={() => onSelect(mill.id)} />
    </div>
  )
}

function NodeCard({
  node,
  compact,
  selected,
  onClick,
}: {
  node: TraceNode
  compact?: boolean
  selected: boolean
  onClick: () => void
}) {
  const s = nodeStyle[node.kind]
  const Icon = s.icon
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-col rounded-lg text-left ring-1 transition-shadow",
        compact ? "p-2.5" : "p-3.5",
        s.bg,
        selected ? "ring-2 ring-primary shadow-sm" : s.ring,
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex shrink-0 items-center justify-center rounded-md bg-white/80", compact ? "size-7" : "size-8", s.color)}>
          <Icon className={compact ? "size-3.5" : "size-4"} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-muted-foreground">{node.role}</p>
          <p className={cn("truncate font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>{node.name}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded bg-white/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
          {node.qty}
        </span>
      </div>
      {!compact && (
        <>
          <p className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {node.region}
          </p>
          {node.license && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{node.license}</p>}
        </>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {node.docs.slice(0, compact ? 2 : 3).map((d) => (
          <span key={d.no} className="inline-flex items-center gap-1 rounded border border-border/60 bg-white/70 px-1.5 py-0.5 text-[10px] tabular-nums text-foreground">
            <FileText className="size-2.5 text-muted-foreground" />
            {d.no}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 rounded bg-white/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <Paperclip className="size-2.5" />
          凭证 {node.vouchers.length}
        </span>
      </div>
    </button>
  )
}

function Connector({ qty, note }: { qty: string; note?: string }) {
  return (
    <div className="flex items-center gap-2 px-1 text-center xl:w-[76px] xl:flex-col xl:gap-0">
      <div className="h-px flex-1 bg-border xl:w-full xl:flex-none" />
      <div className="flex items-center gap-2 xl:my-1 xl:flex-col xl:gap-0">
        <div className="whitespace-nowrap rounded-full border border-border bg-background px-2 py-0.5 text-[11px] tabular-nums text-foreground">
          {qty}
        </div>
        {note && <p className="whitespace-nowrap text-[10px] leading-tight text-muted-foreground xl:whitespace-normal">{note}</p>}
      </div>
      <div className="h-px flex-1 bg-border xl:w-full xl:flex-none" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 知识图谱视图（SVG 网络图）                                            */
/* ------------------------------------------------------------------ */

interface GraphPoint {
  x: number
  y: number
}

function GraphView({
  nodes,
  nodeMap,
  edges,
  selected,
  onSelect,
}: {
  nodes: TraceNode[]
  nodeMap: Record<string, TraceNode>
  edges: TraceEdge[]
  selected: string
  onSelect: (id: string) => void
}) {
  const W = 1040
  const H = 500
  const suppliers = nodes.filter((n) => n.kind === "supplier")

  // 主体节点布局：供应商左列纵向分布，其余三方横向排列
  const pos: Record<string, GraphPoint> = {}
  const gap = (H - 40) / (suppliers.length + 1)
  suppliers.forEach((s, i) => {
    pos[s.id] = { x: 150, y: 20 + gap * (i + 1) }
  })
  pos.rec = { x: 420, y: H / 2 }
  pos.proc = { x: 680, y: H / 2 }
  pos.mill = { x: 920, y: H / 2 }

  // 单据节点：挂在对应主体节点周围
  const docNodes = nodes.flatMap((n) => {
    const p = pos[n.id]
    const isSupplier = n.kind === "supplier"
    return n.docs.map((d, i) => {
      // 供应商单据：向左散开；其余主体：向下扇形排列
      const angle = isSupplier ? Math.PI + (i - 1) * 0.42 : Math.PI / 2 + (i - 1) * 0.7
      const r = isSupplier ? 100 : 115
      return {
        id: `${n.id}-doc-${i}`,
        owner: n.id,
        label: d.label,
        no: d.no,
        x: p.x + Math.cos(angle) * r,
        y: p.y + Math.sin(angle) * r,
      }
    })
  })

  const neighbors = new Set<string>([selected])
  edges.forEach((e) => {
    if (e.from === selected) neighbors.add(e.to)
    if (e.to === selected) neighbors.add(e.from)
  })

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-gradient-to-b from-background to-muted/30">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="订单溯源知识图谱">
        <defs>
          <marker id="trace-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="trace-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>

        {/* 单据 → 主体 虚线 */}
        {docNodes.map((d) => {
          const p = pos[d.owner]
          const dim = !neighbors.has(d.owner)
          return (
            <line
              key={`l-${d.id}`}
              x1={d.x}
              y1={d.y}
              x2={p.x}
              y2={p.y}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={dim ? 0.35 : 0.9}
            />
          )
        })}

        {/* 主体流转边 */}
        {edges.map((e) => {
          const a = pos[e.from]
          const b = pos[e.to]
          const active = e.from === selected || e.to === selected
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          // 供应商 → 回收商 用二次曲线汇聚
          const curved = nodeMap[e.from].kind === "supplier"
          const d = curved
            ? `M ${a.x + 40} ${a.y} Q ${mx} ${a.y} ${b.x - 44} ${b.y}`
            : `M ${a.x + 44} ${a.y} L ${b.x - 44} ${b.y}`
          const labelX = curved ? (a.x + b.x) / 2 - 10 : mx
          const labelY = curved ? (a.y + b.y) / 2 - 8 : my - 10
          return (
            <g key={`${e.from}-${e.to}`} opacity={active || selected === "" ? 1 : 0.4}>
              <path
                d={d}
                fill="none"
                stroke={active ? "#2563eb" : "#94a3b8"}
                strokeWidth={active ? 2.2 : 1.5}
                markerEnd={active ? "url(#trace-arrow-active)" : "url(#trace-arrow)"}
              />
              <g transform={`translate(${labelX}, ${labelY})`}>
                <rect x={-46} y={-18} width={92} height={30} rx={6} fill="white" stroke={active ? "#2563eb" : "#e2e8f0"} />
                <text textAnchor="middle" y={-5} fontSize={10.5} fontWeight={600} fill="#0f172a">
                  {e.qty}
                </text>
                <text textAnchor="middle" y={7} fontSize={8.5} fill="#64748b">
                  {e.docNo}
                </text>
              </g>
            </g>
          )
        })}

        {/* 单据节点 */}
        {docNodes.map((d) => {
          const dim = !neighbors.has(d.owner)
          return (
            <g
              key={d.id}
              transform={`translate(${d.x}, ${d.y})`}
              opacity={dim ? 0.4 : 1}
              className="cursor-pointer"
              onClick={() => onSelect(d.owner)}
            >
              <rect x={-38} y={-14} width={76} height={28} rx={14} fill="white" stroke="#cbd5e1" />
              <text textAnchor="middle" y={-2.5} fontSize={8.5} fill="#64748b">
                {d.label}
              </text>
              <text textAnchor="middle" y={8.5} fontSize={7.5} fontWeight={600} fill="#0f172a">
                {d.no.length > 16 ? d.no.slice(0, 16) + "…" : d.no}
              </text>
            </g>
          )
        })}

        {/* 主体节点 */}
        {nodes.map((n) => {
          const p = pos[n.id]
          const s = nodeStyle[n.kind]
          const isSel = selected === n.id
          const dim = !neighbors.has(n.id)
          return (
            <g
              key={n.id}
              transform={`translate(${p.x}, ${p.y})`}
              className="cursor-pointer"
              onClick={() => onSelect(n.id)}
              opacity={dim ? 0.55 : 1}
            >
              {isSel && <circle r={50} fill={s.stroke} opacity={0.12} />}
              <circle r={40} fill={s.fill} stroke={s.stroke} strokeWidth={isSel ? 3 : 2} />
              <text textAnchor="middle" y={-6} fontSize={11} fontWeight={700} fill="#0f172a">
                {n.name.length > 8 ? n.name.slice(0, 8) + "…" : n.name}
              </text>
              <text textAnchor="middle" y={8} fontSize={9} fill="#475569">
                {n.role.split(" · ")[0]}
              </text>
              <text textAnchor="middle" y={21} fontSize={9} fontWeight={600} fill={s.stroke}>
                {n.qty}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-card px-4 py-2 text-[11px] text-muted-foreground">
        <Legend color="#f59e0b" label="供应商" />
        <Legend color="#10b981" label="回收商" />
        <Legend color="#8b5cf6" label="加工基地" />
        <Legend color="#2563eb" label="钢厂" />
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-7 rounded-full border border-slate-300 bg-white" />
          单据节点
        </span>
        <span className="ml-auto">点击节点查看单号与凭证 · 实线为货物流转，虚线为单据归属</span>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* 选中节点面板：单号 + 凭证                                            */
/* ------------------------------------------------------------------ */

function NodePanel({
  node,
  edges,
  nodeMap,
}: {
  node: TraceNode
  edges: TraceEdge[]
  nodeMap: Record<string, TraceNode>
}) {
  const s = nodeStyle[node.kind]
  const Icon = s.icon
  const inbound = edges.filter((e) => e.to === node.id)
  const outbound = edges.filter((e) => e.from === node.id)
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-border bg-background p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-9 items-center justify-center rounded-md", s.bg, s.color)}>
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{node.role}</p>
            <p className="truncate text-sm font-semibold text-foreground">{node.name}</p>
          </div>
        </div>
        <dl className="mt-3 space-y-1 text-xs">
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-muted-foreground">所在地</dt>
            <dd className="text-foreground">{node.region}</dd>
          </div>
          {node.license && (
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">资质</dt>
              <dd className="text-foreground">{node.license}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-muted-foreground">确认数量</dt>
            <dd className="font-medium tabular-nums text-foreground">{node.qty}</dd>
          </div>
          {inbound.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">来源</dt>
              <dd className="text-foreground">{inbound.map((e) => nodeMap[e.from].name).join("、")}</dd>
            </div>
          )}
          {outbound.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">去向</dt>
              <dd className="text-foreground">{outbound.map((e) => nodeMap[e.to].name).join("、")}</dd>
            </div>
          )}
        </dl>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <FileText className="size-3.5 text-muted-foreground" />
          对应单号
        </p>
        <ul className="mt-2 space-y-1.5">
          {node.docs.map((d) => (
            <li key={d.no} className="flex items-center justify-between gap-2 rounded border border-border bg-card px-2.5 py-1.5 text-xs">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-medium tabular-nums text-foreground">{d.no}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Paperclip className="size-3.5 text-muted-foreground" />
          对应凭证
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {node.vouchers.map((v) => (
            <button
              key={v}
              className="inline-flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-xs text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Camera className="size-3" />
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 通用小组件                                                          */
/* ------------------------------------------------------------------ */

function Timeline({ events }: { events: TraceEvent[] }) {
  return (
    <ol className="relative ml-3 space-y-5 border-l border-border pl-6">
      {events.map((ev, i) => {
        const Icon = ev.icon
        const last = i === events.length - 1
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-0.5 flex size-5 items-center justify-center rounded-full ring-4 ring-card",
                last ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-3" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-medium text-foreground">{ev.title}</p>
              <time className="text-xs tabular-nums text-muted-foreground">{ev.time}</time>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ev.desc}</p>
            {(ev.docs || ev.vouchers) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                {ev.docs?.map((d) => (
                  <span key={d.label + d.no} className="text-muted-foreground">
                    {d.label}：<span className="font-medium tabular-nums text-foreground">{d.no}</span>
                  </span>
                ))}
                {ev.vouchers?.map((a) => (
                  <button
                    key={a}
                    className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Camera className="size-3" />
                    {a}
                  </button>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ViewTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: LucideIcon; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
      aria-pressed={active}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-muted-foreground">{label} </span>
      <span className={cn("font-medium text-foreground", mono && "tabular-nums")}>{value}</span>
    </div>
  )
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", accent ? "border-primary/30 bg-primary/5" : "border-border bg-background")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold tabular-nums", accent ? "text-primary" : "text-foreground")}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
