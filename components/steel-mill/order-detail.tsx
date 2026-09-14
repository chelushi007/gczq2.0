"use client"

import { useState } from "react"
import {
  ArrowLeft,
  FileSignature,
  Wallet,
  Truck,
  PackageCheck,
  CheckCircle2,
  ScrollText,
  MapPin,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import type { OrderItem } from "@/lib/steel-data"
import type { FulfillPerspective } from "@/components/steel-mill/order-fulfill"

function num(s: string) {
  return Number((s || "").replace(/[^\d.]/g, "")) || 0
}
function unitOf(s: string) {
  return (s || "").replace(/[\d.,\s]/g, "") || "吨"
}
function money(n: number) {
  return "¥" + Math.round(n).toLocaleString()
}

interface TimelineNode {
  title: string
  icon: typeof FileSignature
  desc: string
  time: string
}

export function OrderDetail({
  item,
  perspective,
  onBack,
}: {
  item: OrderItem
  perspective: FulfillPerspective
  onBack: () => void
}) {
  const [track, setTrack] = useState<string | null>(null)
  const isPurchaser = perspective === "purchaser"
  const total = num(item.qty)
  const unit = unitOf(item.qty)
  const amountNum = item.amount ? num(item.amount) : total * num(item.unitPrice)
  const buyer = "华东特钢集团"
  const counterparty = isPurchaser ? item.supplier : buyer
  const shipNo = item.id.replace("DD", "WL")

  function handleExport() {
    const rows = nodes.map((n) => `<tr><td>${n.title}</td><td>已完成</td><td>${n.desc}</td><td>${n.time}</td></tr>`).join("")
    const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>履约档案 ${item.id}</title>
<style>
  body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#1a1a1a;padding:40px;line-height:1.6}
  h1{font-size:20px;margin:0 0 4px}
  .sub{color:#666;font-size:13px;margin-bottom:24px}
  h2{font-size:15px;margin:24px 0 8px;border-left:3px solid #333;padding-left:8px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
  th{background:#f5f5f5}
  .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 24px;font-size:13px}
  .grid div{padding:4px 0;border-bottom:1px solid #f0f0f0}
  .grid span{color:#888;display:inline-block;width:80px}
  @media print{body{padding:0}}
</style></head><body>
<h1>履约档案 · ${item.id}</h1>
<div class="sub">成交方式：${item.channel}　|　履约状态：${item.status}　|　导出时间：${new Date().toLocaleString("zh-CN")}</div>
<h2>订单基本信息</h2>
<div class="grid">
  <div><span>订单编号</span>${item.id}</div>
  <div><span>${isPurchaser ? "供应商" : "采购单位"}</span>${counterparty}</div>
  <div><span>物料类别</span>${item.category}</div>
  <div><span>成交数量</span>${item.qty}</div>
  <div><span>成交单价</span>${item.unitPrice}</div>
  <div><span>订单金额</span>${item.amount ? item.amount : money(amountNum) + "（协议周期结算）"}</div>
  <div><span>所在地区</span>${item.region}</div>
  <div><span>下单日期</span>${item.createdAt}</div>
  <div><span>交货日期</span>${item.deliveryDate}</div>
  <div><span>结算状态</span>已结清</div>
</div>
<h2>履约进度</h2>
<table><thead><tr><th>节点</th><th>状态</th><th>说明</th><th>时间</th></tr></thead><tbody>${rows}</tbody></table>
<h2>结算汇总</h2>
<div class="grid">
  <div><span>对账金额</span>${money(amountNum)}</div>
  <div><span>${isPurchaser ? "已付货款" : "已收货款"}</span>${money(amountNum)}</div>
  <div><span>${isPurchaser ? "已收货量" : "已发货量"}</span>${item.qty}</div>
  <div><span>物流单号</span>${shipNo}</div>
</div>
</body></html>`
    const w = window.open("", "_blank", "width=900,height=700")
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  const nodes: TimelineNode[] = isPurchaser
    ? [
        { title: "合同签署", icon: FileSignature, desc: "线上电子签署，合同已归档", time: `${item.createdAt} 09:20` },
        { title: "发起对账", icon: ScrollText, desc: `对账数量 ${item.qty}，金额 ${money(amountNum)}`, time: `${item.deliveryDate} 10:05` },
        { title: "货款支付", icon: Wallet, desc: `已付 ${money(amountNum)}，付款方 ${buyer}`, time: `${item.deliveryDate} 15:30` },
        { title: "确认收货", icon: PackageCheck, desc: `已收 ${item.qty}，全部验收合格`, time: `${item.deliveryDate} 17:40` },
      ]
    : [
        { title: "合同签署", icon: FileSignature, desc: "线下合同已双方签署盖章归档", time: `${item.createdAt} 09:20` },
        { title: "确认对账", icon: ScrollText, desc: `确认对账数量 ${item.qty}，金额 ${money(amountNum)}`, time: `${item.deliveryDate} 10:05` },
        { title: "货款收取", icon: Wallet, desc: `已收 ${money(amountNum)}，付款方 ${buyer}`, time: `${item.deliveryDate} 16:10` },
        { title: "发货", icon: Truck, desc: `已发 ${item.qty}，全部签收`, time: `${item.deliveryDate} 08:15` },
      ]

  return (
    <div className="space-y-5">
      {/* 头部 */}
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
            <h2 className="text-lg font-semibold text-foreground">履约结束 · {item.id}</h2>
            <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
            <StatusPill tone="violet">{item.channel}</StatusPill>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPurchaser ? "供应商" : "采购单位"} <span className="font-medium text-foreground">{counterparty}</span> ·{" "}
            {item.category} · {item.qty} · <span className="text-primary">{item.unitPrice}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={handleExport}>
          <Download className="size-3.5" />
          导出履约档案
        </Button>
      </div>

      {/* 订单基本信息 */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileSignature className="size-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">订单基本信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
          <Field k="订单编号" v={item.id} />
          <Field k={isPurchaser ? "供应商" : "采购单位"} v={counterparty} />
          <Field k="成交方式" v={item.channel} />
          <Field k="物料类别" v={item.category} />
          <Field k="成交数量" v={item.qty} />
          <Field k="成交单价" v={item.unitPrice} />
          <Field k="订单金额" v={item.amount ? item.amount : `${money(amountNum)}（协议周期结算）`} />
          <Field k="所在地区" v={item.region} />
          <Field k="下单日期" v={item.createdAt} />
          <Field k="交货日期" v={item.deliveryDate} />
          <Field k="履约状态" v={item.status} />
          <Field k="结算状态" v="已结清" />
        </div>
      </section>

      {/* 履约进度（全部完成） */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <h3 className="text-sm font-medium text-foreground">履约进度</h3>
          <span className="text-xs text-muted-foreground">全部节点已完成</span>
        </div>
        <ol className="relative space-y-5 pl-6">
          <span className="absolute left-[9px] top-1 h-[calc(100%-1rem)] w-px bg-border" aria-hidden />
          {nodes.map((n) => (
            <li key={n.title} className="relative">
              <span className="absolute -left-6 top-0.5 flex size-[19px] items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <n.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  <StatusPill tone="emerald">已完成</StatusPill>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{n.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 结算汇总 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="对账金额" value={money(amountNum)} sub={`数量 ${item.qty}`} />
        <SummaryCard
          label={isPurchaser ? "已付货款" : "已收货款"}
          value={money(amountNum)}
          sub={isPurchaser ? `付款方 ${buyer}` : `收款方 ${item.supplier}`}
          highlight
        />
        <SummaryCard label={isPurchaser ? "已收货量" : "已发货量"} value={item.qty} sub={`共 ${total} ${unit} 全部完成`} />
      </div>

      {/* 物流与收发记录 */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Truck className="size-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">{isPurchaser ? "收货与物流记录" : "发货与物流记录"}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">{isPurchaser ? "收货单号" : "发货单号"}</th>
                <th className="pb-2 font-medium">货物名称</th>
                <th className="pb-2 font-medium">数量</th>
                <th className="pb-2 font-medium">物流公司</th>
                <th className="pb-2 font-medium">车牌号</th>
                <th className="pb-2 font-medium">物流单号</th>
                <th className="pb-2 font-medium">{isPurchaser ? "到货时间" : "发货时间"}</th>
                <th className="pb-2 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2.5 font-medium text-foreground">{item.id.replace("DD", isPurchaser ? "SH" : "FH")}</td>
                <td className="py-2.5 text-muted-foreground">{item.category}</td>
                <td className="py-2.5 tabular-nums">{item.qty}</td>
                <td className="py-2.5 text-muted-foreground">顺丰物流</td>
                <td className="py-2.5 tabular-nums text-muted-foreground">苏E·8890{isPurchaser ? "6" : "2"}</td>
                <td className="py-2.5">
                  <button
                    onClick={() => setTrack(shipNo)}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <MapPin className="size-3.5" />
                    {shipNo}
                  </button>
                </td>
                <td className="py-2.5 tabular-nums text-muted-foreground">{item.deliveryDate}</td>
                <td className="py-2.5">
                  <StatusPill tone="emerald">{isPurchaser ? "已签收" : "已送达"}</StatusPill>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <TrackModal no={track} onClose={() => setTrack(null)} />
    </div>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">{v}</span>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div
      className={
        "rounded-lg border bg-card p-4 " + (highlight ? "border-primary" : "border-border")
      }
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"mt-1 text-xl font-semibold tabular-nums " + (highlight ? "text-primary" : "text-foreground")}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

function TrackModal({ no, onClose }: { no: string | null; onClose: () => void }) {
  const steps = [
    { t: "货物装车出库", d: "苏州分拨中心", time: "09-08 08:15" },
    { t: "运输中·途经无锡转运", d: "无锡转运中心", time: "09-08 13:40" },
    { t: "到达目的分拨中心", d: "宝山分拨中心", time: "09-09 07:20" },
    { t: "已送达并签收", d: "收货区·仓管确认", time: "09-09 10:05" },
  ]
  return (
    <Modal open={!!no} onClose={onClose} title={`物流轨迹 · ${no ?? ""}`} size="md">
      <ol className="relative space-y-5 pl-6">
        <span className="absolute left-[7px] top-1 h-[calc(100%-1rem)] w-px bg-border" aria-hidden />
        {steps.map((s, i) => (
          <li key={s.t} className="relative">
            <span
              className={
                "absolute -left-6 top-1 size-3.5 rounded-full border-2 " +
                (i === steps.length - 1 ? "border-emerald-600 bg-emerald-100" : "border-primary bg-background")
              }
              aria-hidden
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{s.t}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{s.time}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
