"use client"

import { AlertTriangle, X, Receipt } from "lucide-react"
import { naturalPersonAccount, yuan, type Listing } from "@/lib/steel-zone-data"

/**
 * 反向开票额度不足提醒弹窗
 * 当报名/报价，且本项目起拍总额超过剩余反向开票额度时展示。
 */
export function ReverseQuotaModal({
  item,
  check,
  onClose,
  onLearnMore,
}: {
  item: Listing
  check: { startingTotal: number; remaining: number; shortfall: number; tons: number }
  onClose: () => void
  onLearnMore?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rq-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* 头部 */}
        <div className="flex items-start gap-3 border-b border-border bg-destructive/5 px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="rq-title" className="text-base font-bold text-foreground">
              无法报名 · 反向开票额度不足
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              您当前的反向开票剩余额度不足以覆盖本项目起拍总额
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 正文 */}
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">
            报名
            <span className="font-medium">「{item.title}」</span>
            需按起拍总额校验反向开票额度。本项目起拍总额已超出本年度的剩余可开票额度，系统已自动拦截报名。
          </p>

          <dl className="mt-4 space-y-1 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <Row k="起拍单价" v={`${item.price.toLocaleString()} ${item.unit}`} />
            <Row k="项目数量" v={item.quantity} />
            <Row k="起拍总额" v={yuan(check.startingTotal)} strong />
            <div className="my-1 h-px bg-border" />
            <Row k="年度开票额度" v={yuan(naturalPersonAccount.annualQuota)} />
            <Row k="本年已开票" v={yuan(naturalPersonAccount.usedQuota)} />
            <Row k="剩余可开票额度" v={yuan(check.remaining)} />
            <Row k="本项目额度缺口" v={yuan(check.shortfall)} danger />
          </dl>

          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <Receipt className="mt-0.5 size-3.5 shrink-0 text-primary" />
            提示：您可选择起拍总额较小的采购需求参与报名，或待开票额度恢复后再参与。
          </p>
        </div>

        {/* 操作 */}
        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            我知道了
          </button>
          <button
            onClick={onLearnMore}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Receipt className="size-4" />
            了解反向开票
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ k, v, strong, danger }: { k: string; v: string; strong?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd
        className={
          danger
            ? "font-bold tabular-nums text-destructive"
            : strong
              ? "font-bold tabular-nums text-foreground"
              : "tabular-nums text-foreground"
        }
      >
        {v}
      </dd>
    </div>
  )
}
