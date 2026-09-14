"use client"

import { useState } from "react"
import {
  ArrowLeft,
  FileText,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  ChevronDown,
  CircleCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/shared/status-pill"
import { PurchaseNotice } from "./purchase-notice"
import type { SupplierBidItem } from "@/lib/steel-data"

// 网上报名流程：仅报名参与 → 缴费缴金
type StageKey = "join" | "pay"

const stages: { key: StageKey; label: string; icon: typeof FileText }[] = [
  { key: "join", label: "报名参与", icon: ClipboardCheck },
  { key: "pay", label: "缴费缴金", icon: Wallet },
]

function stageState(item: SupplierBidItem, key: StageKey): "done" | "active" | "todo" {
  const signedUp = item.signupStatus === "报名通过"
  const paid = item.feeStatus === "已缴" && item.depositStatus !== "未缴"
  if (key === "join") return signedUp ? "done" : "active"
  if (key === "pay") return paid ? "done" : signedUp ? "active" : "todo"
  return "todo"
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={strong ? "text-sm font-semibold text-foreground" : "text-sm text-foreground"}>{value}</span>
    </div>
  )
}

export function SignupDetail({ item, onBack }: { item: SupplierBidItem; onBack: () => void }) {
  const [open, setOpen] = useState<StageKey | null>(() => {
    const s = stages.find((st) => stageState(item, st.key) === "active")
    return s?.key ?? "join"
  })
  const [showNotice, setShowNotice] = useState(false)

  if (showNotice) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => setShowNotice(false)}>
          <ArrowLeft />
          返回报名
        </Button>
        <PurchaseNotice item={item} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* 顶部标题 + 返回 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft />
            返回列表
          </Button>
          <div>
            <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
            <p className="text-xs text-muted-foreground">
              竞价单号 {item.id} · 采购单位 {item.buyer}
            </p>
          </div>
        </div>
        <StatusPill tone={item.signupStatus === "报名通过" ? "green" : item.signupStatus === "报名驳回" ? "red" : "amber"}>
          {item.signupStatus}
        </StatusPill>
      </div>

      {/* 流程展示 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center">
          {stages.map((st, i) => {
            const state = stageState(item, st.key)
            const Icon = st.icon
            return (
              <div key={st.key} className="flex flex-1 items-center last:flex-none">
                <button onClick={() => setOpen(open === st.key ? null : st.key)} className="flex flex-col items-center gap-2">
                  <span
                    className={
                      "flex size-11 items-center justify-center rounded-full border-2 transition-colors " +
                      (state === "done"
                        ? "border-primary bg-primary text-primary-foreground"
                        : state === "active"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground")
                    }
                  >
                    {state === "done" ? <CircleCheck className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span
                    className={
                      "flex items-center gap-1 text-xs font-medium " +
                      (state === "todo" ? "text-muted-foreground" : "text-foreground")
                    }
                  >
                    {st.label}
                    <ChevronDown className={"size-3 transition-transform " + (open === st.key ? "rotate-180" : "")} />
                  </span>
                </button>
                {i < stages.length - 1 && (
                  <div className={"mx-2 h-0.5 flex-1 " + (state === "done" ? "bg-primary" : "bg-border")} />
                )}
              </div>
            )
          })}
        </div>

        {/* 报名参与 */}
        {open === "join" && (
          <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="采购单位" value={item.buyer} />
            <Field label="废钢类别" value={item.category} />
            <Field label="交货区域" value={item.region} />
            <Field label="采购数量" value={item.qty} />
            <Field label="起拍价" value={item.basePrice} />
            <Field label="报名截止" value={item.signupEnd} />
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs text-muted-foreground">报名状态</span>
              <StatusPill tone={item.signupStatus === "报名通过" ? "green" : item.signupStatus === "报名驳回" ? "red" : "amber"}>
                {item.signupStatus}
              </StatusPill>
              {item.signupStatus === "未报名" && <Button size="sm">立即报名</Button>}
              {item.signupStatus === "报名待审" && (
                <span className="text-xs text-muted-foreground">报名材料已提交，等待采购方审核</span>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowNotice(true)}>
                <FileText />
                查看采购公告
              </Button>
            </div>
          </div>
        )}

        {/* 缴费缴金 */}
        {open === "pay" && (
          <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">报名费</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-foreground">{item.signupFee}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill tone={item.feeStatus === "已缴" ? "green" : "amber"}>
                  {item.feeStatus === "未缴" ? "待缴纳" : item.feeStatus}
                </StatusPill>
                {item.feeStatus === "未缴" ? (
                  <Button size="sm">去缴纳</Button>
                ) : (
                  <Button variant="outline" size="sm">
                    查看凭证
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">投标保证金</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-foreground">{item.deposit}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill tone={item.depositStatus === "已缴" ? "green" : item.depositStatus === "已退还" ? "gray" : "amber"}>
                  {item.depositStatus === "未缴" ? "待缴纳" : item.depositStatus}
                </StatusPill>
                {item.depositStatus === "未缴" ? (
                  <Button size="sm">去缴纳</Button>
                ) : (
                  <Button variant="outline" size="sm">
                    查看凭证
                  </Button>
                )}
              </div>
            </div>
            <p className="sm:col-span-2 text-xs text-muted-foreground">
              提示：需在报名截止前完成报名费与保证金缴纳，方可参与竞价；未中标保证金将在竞价结束后按规则退还。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
