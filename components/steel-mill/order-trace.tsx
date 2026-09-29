"use client"

import { useState } from "react"
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
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import type { OrderItem } from "@/lib/steel-data"

/* ------------------------------------------------------------------ */
/* 溯源数据（原型）：供应商 → 回收商 → 加工基地 → 钢厂                    */
/* ------------------------------------------------------------------ */

type NodeKind = "supplier" | "recycler" | "processor" | "mill"

interface TraceNode {
  kind: NodeKind
  role: string
  name: string
  region: string
  license?: string
  contact: string
}

interface TraceEvent {
  time: string
  title: string
  desc: string
  icon: LucideIcon
  meta?: { label: string; value: string }[]
  attachments?: string[]
}

interface TraceStage {
  key: string
  title: string
  subtitle: string
  from: NodeKind
  to: NodeKind
  qtyIn: string
  qtyOut: string
  lossRate?: string
  events: TraceEvent[]
}

const nodeStyle: Record<NodeKind, { icon: LucideIcon; color: string; bg: string; ring: string }> = {
  supplier: { icon: User, color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  recycler: { icon: Recycle, color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  processor: { icon: Wrench, color: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200" },
  mill: { icon: Factory, color: "text-primary", bg: "bg-primary/10", ring: "ring-primary/30" },
}

function buildTrace(item: OrderItem) {
  const nodes: Record<NodeKind, TraceNode> = {
    supplier: {
      kind: "supplier",
      role: "供应商",
      name: "张建国（自然人）",
      region: "江苏·无锡 惠山区",
      contact: "138****2231",
    },
    recycler: {
      kind: "recycler",
      role: "回收商",
      name: item.supplier,
      region: item.region,
      license: "再生资源回收备案 · 苏锡回备 2024-0187",
      contact: "0510-8862****",
    },
    processor: {
      kind: "processor",
      role: "加工基地",
      name: "锡东废钢改制加工基地",
      region: "江苏·无锡 锡山区",
      license: "废钢加工准入企业 · 工信部第 9 批",
      contact: "0510-8831****",
    },
    mill: {
      kind: "mill",
      role: "钢厂",
      name: "华东钢铁厂",
      region: "江苏·苏州 张家港",
      contact: "采购部 · 0512-5672****",
    },
  }

  const stages: TraceStage[] = [
    {
      key: "s1",
      title: "第一段 · 供应商供货至回收商",
      subtitle: "自然人向回收商出售废钢原料，回收商反向开票",
      from: "supplier",
      to: "recycler",
      qtyIn: "38.60 吨",
      qtyOut: "38.20 吨",
      lossRate: "扣杂 1.0%",
      events: [
        {
          time: "2026-08-28 09:12",
          title: "供应商下单",
          desc: "供应商在回收商固定价采购需求下接单供货",
          icon: ClipboardList,
          meta: [
            { label: "采购需求", value: "F2615 · 统废固定价回收" },
            { label: "预报数量", value: "38.60 吨" },
          ],
        },
        {
          time: "2026-08-29 14:40",
          title: "到场过磅",
          desc: "回收商场地磅房过磅，毛重 46.12 吨，皮重 7.52 吨",
          icon: Scale,
          meta: [
            { label: "磅单号", value: "BD-20260829-0331" },
            { label: "净重", value: "38.60 吨" },
          ],
          attachments: ["磅单照片", "车辆车牌照片"],
        },
        {
          time: "2026-08-29 15:05",
          title: "验质扣杂",
          desc: "现场验质：统废统料，含杂 1.0%，扣杂后确认 38.20 吨",
          icon: ShieldCheck,
          meta: [
            { label: "质检员", value: "王志强" },
            { label: "确认数量", value: "38.20 吨" },
          ],
          attachments: ["验质照片 ×4"],
        },
        {
          time: "2026-08-30 10:20",
          title: "反向开票 · 结算",
          desc: "回收商为供应商代开发票并代征税款，税后货款打入本人账户",
          icon: Receipt,
          meta: [
            { label: "发票代码", value: "3200 ****** 0417" },
            { label: "开票金额", value: "¥92,062" },
          ],
        },
      ],
    },
    {
      key: "s2",
      title: "第二段 · 回收商委托加工基地改制加工",
      subtitle: "回收商将原料运至加工基地，委托剪切 / 打包改制为炉料",
      from: "recycler",
      to: "processor",
      qtyIn: "38.20 吨",
      qtyOut: "35.00 吨",
      lossRate: "加工损耗 8.4%",
      events: [
        {
          time: "2026-08-31 08:30",
          title: "委托加工单",
          desc: "回收商与加工基地签订委托加工协议，约定改制为 ≤1m 剪切料",
          icon: FileCheck2,
          meta: [
            { label: "委托单号", value: "WT-20260831-012" },
            { label: "加工方式", value: "剪切 · 打包" },
          ],
          attachments: ["委托加工协议"],
        },
        {
          time: "2026-08-31 13:15",
          title: "原料入场过磅",
          desc: "加工基地入场过磅，净重 38.20 吨，与回收商出库一致",
          icon: Scale,
          meta: [
            { label: "磅单号", value: "BD-20260831-0089" },
            { label: "运输车牌", value: "苏B·7K***" },
          ],
          attachments: ["入场磅单", "运输轨迹"],
        },
        {
          time: "2026-09-02 17:40",
          title: "改制加工完成",
          desc: "剪切 / 打包完成，产出 ≤1m 剪切料 35.00 吨，加工损耗 3.20 吨",
          icon: Wrench,
          meta: [
            { label: "产出品类", value: "剪切料（≤1m）" },
            { label: "产出数量", value: "35.00 吨" },
          ],
          attachments: ["加工现场照片 ×6", "加工记录单"],
        },
      ],
    },
    {
      key: "s3",
      title: "第三段 · 加工基地直发钢厂",
      subtitle: "加工完成后由加工基地直接向钢厂发货，回收商为交易主体",
      from: "processor",
      to: "mill",
      qtyIn: "35.00 吨",
      qtyOut: item.qty,
      lossRate: "扣杂 0%",
      events: [
        {
          time: "2026-09-04 09:00",
          title: "钢厂订单成交",
          desc: `回收商与钢厂通过${item.channel}方式成交，订单号 ${item.id}`,
          icon: ClipboardList,
          meta: [
            { label: "成交方式", value: item.channel },
            { label: "成交单价", value: item.unitPrice },
          ],
        },
        {
          time: "2026-09-06 07:45",
          title: "加工基地发货",
          desc: "加工基地装车出库，按钢厂要求直发张家港厂区",
          icon: Truck,
          meta: [
            { label: "发货单号", value: "FH-20260906-004" },
            { label: "运输车牌", value: "苏E·3M***" },
          ],
          attachments: ["出库磅单", "装车照片 ×3", "GPS 运输轨迹"],
        },
        {
          time: "2026-09-06 15:20",
          title: "钢厂到厂过磅",
          desc: "钢厂磅房过磅，净重 35.00 吨，与发货数量一致",
          icon: Scale,
          meta: [
            { label: "磅单号", value: "GC-20260906-1187" },
            { label: "净重", value: "35.00 吨" },
          ],
          attachments: ["到厂磅单"],
        },
        {
          time: "2026-09-06 16:30",
          title: "钢厂验质入库",
          desc: "钢厂质检确认剪切料合格，无扣杂，正式入库",
          icon: PackageCheck,
          meta: [
            { label: "质检结论", value: "合格 · 无扣杂" },
            { label: "入库数量", value: item.qty },
          ],
          attachments: ["验质报告", "入库单"],
        },
        {
          time: "2026-09-08 11:00",
          title: "结算完成",
          desc: "钢厂向回收商完成货款结算，订单履约结束",
          icon: Receipt,
          meta: [
            { label: "结算金额", value: item.amount ?? "按周期结算" },
            { label: "结算状态", value: "已付款" },
          ],
        },
      ],
    },
  ]

  return { nodes, stages }
}

/* ------------------------------------------------------------------ */
/* 页面                                                                */
/* ------------------------------------------------------------------ */

export function OrderTrace({ item, onBack }: { item: OrderItem; onBack: () => void }) {
  const { nodes, stages } = buildTrace(item)
  const [openStage, setOpenStage] = useState<string | null>(stages[0]?.key ?? null)

  const chain: NodeKind[] = ["supplier", "recycler", "processor", "mill"]

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
        desc="逐段追溯货物从供应商供货、回收商委托加工到钢厂入库的全过程，每一段均以磅单、验质与票据为凭"
      />

      {/* 订单摘要 */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">订单编号 </span>
            <span className="font-medium text-foreground">{item.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">交易主体 </span>
            <span className="font-medium text-foreground">{item.supplier}</span>
          </div>
          <div>
            <span className="text-muted-foreground">品类 </span>
            <span className="font-medium text-foreground">{item.category}</span>
          </div>
          <div>
            <span className="text-muted-foreground">入库数量 </span>
            <span className="font-medium tabular-nums text-foreground">{item.qty}</span>
          </div>
          <div>
            <span className="text-muted-foreground">订单金额 </span>
            <span className="font-medium tabular-nums text-foreground">{item.amount ?? "协议按周期结算"}</span>
          </div>
          <StatusPill tone="green">{item.status}</StatusPill>
        </div>
      </section>

      {/* 溯源链路总览 */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">溯源链路</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          供应商 → 回收商 → 加工基地 → 钢厂 · 加工完成后由加工基地直发钢厂
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
          {chain.map((k, i) => {
            const n = nodes[k]
            const s = nodeStyle[k]
            const Icon = s.icon
            const stage = i < stages.length ? stages[i] : null
            return (
              <div key={k} className="contents">
                <div className={cn("flex min-w-0 flex-col rounded-lg p-3.5 ring-1", s.bg, s.ring)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-8 items-center justify-center rounded-md bg-white/80", s.color)}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">{n.role}</p>
                      <p className="truncate text-sm font-semibold text-foreground">{n.name}</p>
                    </div>
                  </div>
                  <p className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {n.region}
                  </p>
                  {n.license && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{n.license}</p>}
                </div>

                {stage && (
                  <div className="flex flex-col items-center justify-center px-1 text-center md:w-[72px]">
                    <div className="hidden h-px w-full bg-border md:block" />
                    <div className="my-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] tabular-nums text-foreground">
                      {stage.qtyOut}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{stage.lossRate}</p>
                    <div className="hidden h-px w-full bg-border md:block" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 数量流转汇总 */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="供应商供货" value="38.60 吨" hint="原料毛料" />
          <Kpi label="回收商确认" value="38.20 吨" hint="扣杂 1.0%" />
          <Kpi label="加工基地产出" value="35.00 吨" hint="加工损耗 8.4%" />
          <Kpi label="钢厂入库" value={item.qty} hint="无扣杂" accent />
        </div>
      </section>

      {/* 分段明细 */}
      <section className="space-y-3">
        {stages.map((st, idx) => {
          const from = nodes[st.from]
          const to = nodes[st.to]
          const FromIcon = nodeStyle[st.from].icon
          const ToIcon = nodeStyle[st.to].icon
          const open = openStage === st.key
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
                  <span className={cn("flex items-center gap-1", nodeStyle[st.from].color)}>
                    <FromIcon className="size-3.5" />
                    {from.name}
                  </span>
                  <span>→</span>
                  <span className={cn("flex items-center gap-1", nodeStyle[st.to].color)}>
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
                  <ol className="relative ml-3 space-y-5 border-l border-border pl-6">
                    {st.events.map((ev, i) => {
                      const Icon = ev.icon
                      const last = i === st.events.length - 1
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
                          {(ev.meta || ev.attachments) && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                              {ev.meta?.map((m) => (
                                <span key={m.label} className="text-muted-foreground">
                                  {m.label}：<span className="font-medium tabular-nums text-foreground">{m.value}</span>
                                </span>
                              ))}
                              {ev.attachments?.map((a) => (
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
                </div>
              )}
            </div>
          )
        })}
      </section>
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
