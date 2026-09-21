"use client"

import {
  ChevronRight,
  Receipt,
  ShieldCheck,
  Gauge,
  Wallet,
  ChevronDown,
  CircleHelp,
  IdCard,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  reverseIntro,
  reverseSteps,
  reverseAdvantages,
  reverseFaq,
  naturalPersonAccount,
  npListings,
  yuan,
} from "@/lib/steel-zone-data"
import { SectionTitle } from "./demand-distribution"
import { ScrapCard } from "./scrap-card"

const advIcon: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  receipt: Receipt,
  gauge: Gauge,
  wallet: Wallet,
}

export function ReverseInvoicePage({
  onBack,
  onOpen,
}: {
  onBack: () => void
  onOpen: (id: string) => void
}) {
  const items = npListings()
  const usedPct = Math.round((naturalPersonAccount.usedQuota / naturalPersonAccount.annualQuota) * 100)

  return (
    <div className="min-h-full bg-background pb-16">
      {/* 面包屑 */}
      <div className="mx-auto max-w-6xl px-6 pt-5">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <button onClick={onBack} className="transition-colors hover:text-primary">
            首页
          </button>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">反向开票</span>
        </nav>
      </div>

      {/* Hero 介绍 */}
      <section className="mx-auto mt-4 max-w-6xl px-6">
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8">
          <div className="flex items-center gap-2 text-primary">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
              <Receipt className="size-5" />
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium">平台特色服务</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground md:text-3xl">反向开票</h1>
          <p className="mt-2 text-base font-medium text-primary">{reverseIntro.tagline}</p>
          <div className="mt-4 max-w-3xl space-y-2.5">
            {reverseIntro.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 自然人额度卡 */}
      <section className="mx-auto mt-6 max-w-6xl px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* 流程 */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="反向开票流程" />
            <ol className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {reverseSteps.map((s, i) => (
                <li key={s.step} className="relative rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {s.step}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                  {i < reverseSteps.length - 1 && (
                    <ChevronRight className="absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground/30 sm:block" />
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* 我的额度 */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">我的反向开票额度</h3>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                已实名
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IdCard className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{naturalPersonAccount.name}</p>
                <p className="truncate text-xs text-muted-foreground">身份证 {naturalPersonAccount.idMasked}</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">年度额度已用 {usedPct}%</span>
                <span className="font-medium text-foreground">
                  剩余 <span className="font-bold text-destructive">{yuan(naturalPersonAccount.remainingQuota)}</span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-destructive"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">年度额度</dt>
                <dd className="font-medium tabular-nums text-foreground">{yuan(naturalPersonAccount.annualQuota)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">本年已开票</dt>
                <dd className="font-medium tabular-nums text-foreground">{yuan(naturalPersonAccount.usedQuota)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 优势 */}
      <section className="mx-auto mt-8 max-w-6xl px-6">
        <SectionTitle title="为什么选择反向开票" />
        <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {reverseAdvantages.map((a) => {
            const Icon = advIcon[a.icon] ?? Receipt
            return (
              <div key={a.title} className="rounded-xl border border-border bg-card p-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground">{a.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 采购需求 */}
      <section className="mx-auto mt-8 max-w-6xl px-6">
        <SectionTitle
          title="采购需求"
          action={<span className="text-xs text-muted-foreground">共 {items.length} 条 · 报名/下单前自动校验开票额度</span>}
        />
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
            暂无采购需求
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <ScrapCard key={it.id} item={it} onClick={() => onOpen(it.id)} />
            ))}
          </div>
        )}
      </section>

      {/* 常见问题 */}
      <section className="mx-auto mt-8 max-w-6xl px-6">
        <SectionTitle title="常见问题" />
        <div className="mt-2 space-y-2">
          {reverseFaq.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>
    </div>
  )
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <CircleHelp className="size-4 shrink-0 text-primary" />
        <span className="flex-1 text-sm font-medium text-foreground">{q}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="border-t border-border px-4 py-3 pl-10 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}
