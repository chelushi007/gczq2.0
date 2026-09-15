"use client"

import { MapPin, ShieldCheck, Star, Factory, Recycle, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionTitle } from "./demand-distribution"
import {
  qualityMills,
  qualityNetworks,
  millSupplierSteps,
  networkJoinSteps,
} from "@/lib/steel-zone-data"

/* ------------------------- 优质钢厂 ------------------------- */
export function QualityMills({ onMore }: { onMore?: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="优质钢厂" action={onMore && <ViewMoreLink onClick={onMore} />} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {qualityMills.map((m) => (
          <article
            key={m.id}
            className="group flex gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <img
              src={m.image || "/placeholder.svg"}
              alt={m.name}
              className="h-28 w-28 shrink-0 rounded-lg object-cover"
              crossOrigin="anonymous"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-semibold text-foreground">{m.name}</h3>
                {m.verified && <ShieldCheck className="size-3.5 shrink-0 text-primary" />}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="size-3" />
                  {m.region}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{m.process}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{m.desc}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
                {m.tags.map((t) => (
                  <span key={t} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-xs font-medium text-destructive">{m.annualDemand}</p>
            </div>
          </article>
        ))}
      </div>

      <JoinEntry
        icon={Factory}
        title="成为钢厂供应商"
        intro="加入平台优质钢厂供应链，直供大型钢厂，享稳定订单、就近调度与阳光结算。认证供应商可优先对接区域钢厂采购计划，货款按约到账。"
        steps={millSupplierSteps}
        cta="申请成为供应商"
      />
    </section>
  )
}

/* ------------------------- 优选回收网点 ------------------------- */
export function QualityNetworks({ onMore }: { onMore?: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="优选回收网点" action={onMore && <ViewMoreLink onClick={onMore} />} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {qualityNetworks.map((n) => (
          <article
            key={n.id}
            className="group flex gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <img
              src={n.image || "/placeholder.svg"}
              alt={n.name}
              className="h-28 w-28 shrink-0 rounded-lg object-cover"
              crossOrigin="anonymous"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-semibold text-foreground">{n.name}</h3>
                {n.verified && <ShieldCheck className="size-3.5 shrink-0 text-primary" />}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex min-w-0 items-center gap-0.5">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{n.region}</span>
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
                  <Star className="size-3 fill-amber-500" />
                  {n.rating}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{n.desc}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
                {n.tags.map((t) => (
                  <span key={t} className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-xs font-medium text-emerald-600">{n.capacity}</p>
            </div>
          </article>
        ))}
      </div>

      <JoinEntry
        icon={Recycle}
        title="成为回收网点"
        intro="成为平台优选回收网点，获取区域钢厂采购需求、品牌授权与运营扶持。认证网点可享物流、供应链金融与阳光结算全流程赋能。"
        steps={networkJoinSteps}
        cta="申请成为网点"
      />
    </section>
  )
}

/* 板块右上角“查看更多”文字链接 */
function ViewMoreLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
    >
      查看更多 <ArrowRight className="size-3" />
    </button>
  )
}

/* ------------------------- 入驻入口（流程 + 介绍 + 入口） ------------------------- */
function JoinEntry({
  icon: Icon,
  title,
  intro,
  steps,
  cta,
}: {
  icon: typeof Factory
  title: string
  intro: string
  steps: { step: string; title: string; desc: string }[]
  cta: string
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-sky-50/60">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">{intro}</p>
          </div>
        </div>
        <button className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          {cta}
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* 流程步骤 */}
      <div className="border-t border-primary/10 bg-card/40 px-5 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s.step} className="relative flex flex-col">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {s.step}
                </span>
                <CheckCircle2 className="size-3.5 text-primary/40" />
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-2.5 top-1.5 hidden size-3.5 text-primary/25 lg:block" />
                )}
              </div>
              <p className="mt-1.5 text-[13px] font-medium text-foreground">{s.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
