"use client"

import { useMemo, useState } from "react"
import { ArrowRight, MapPin, ShoppingCart, Tag, Building2, ShieldCheck, TrendingUp, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  scrapCategories,
  provinceDemand,
  categoryCount,
  demandRecos,
  networkBase,
  networkStats,
  recyclers,
} from "@/lib/steel-zone-data"
import { ChinaMap } from "./china-map"

type DistTab = "demand" | "network"

export function DistributionTabs() {
  const [tab, setTab] = useState<DistTab>("demand")

  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="全国分布" />
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {(
          [
            { key: "demand", label: "废钢需求分布" },
            { key: "network", label: "回收网点分布" },
          ] as { key: DistTab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "demand" ? <DemandPanel /> : <NetworkPanel />}
    </section>
  )
}

/* ------------------------- 废钢需求分布 ------------------------- */
function DemandPanel() {
  const [cat, setCat] = useState("all")
  const [hovered, setHovered] = useState<string | null>(null)

  const demand = useMemo(() => provinceDemand(cat), [cat])
  const values = useMemo(() => {
    const v: Record<string, number> = {}
    for (const [k, d] of Object.entries(demand)) v[k] = d.total
    return v
  }, [demand])

  const catName = scrapCategories.find((c) => c.key === cat)?.name ?? "全部废钢"

  const recos = useMemo(() => {
    const base = demandRecos.filter((r) => cat === "all" || r.category === cat)
    const scoped = hovered ? base.filter((r) => r.province === hovered) : base
    const list = scoped.length ? scoped : base
    // 采购与销售混合，按类型标识
    return list
  }, [cat, hovered])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_320px]">
      {/* 左：废钢分类导航 */}
      <div className="overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground">
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="text-sm font-semibold">废钢分类</p>
        </div>
        <ul className="max-h-[520px] overflow-y-auto p-2">
          {scrapCategories.map((c) => {
            const isActive = cat === c.key
            return (
              <li key={c.key}>
                <button
                  onClick={() => setCat(c.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <span>{c.name}</span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isActive ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/50",
                    )}
                  >
                    {categoryCount(c.key).toLocaleString()}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="border-t border-sidebar-border px-4 py-3 text-[11px] leading-relaxed text-sidebar-foreground/55">
          鼠标悬停地图省份可查看采购 / 销售需求数量，右侧推荐将联动更新
        </div>
      </div>

      {/* 中：中国地图 */}
      <div className="relative rounded-xl border border-border bg-card p-2">
        <div className="absolute right-4 top-4 z-10">
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
            {catName} · 全国需求分布
          </span>
        </div>
        <ChinaMap
          values={values}
          hovered={hovered}
          onHover={setHovered}
          tooltip={(name) => {
            const d = demand[name]
            return (
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  {name}
                </p>
                <p className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">采购需求</span>
                  <span className="font-medium text-primary">{d?.purchase ?? 0} 条</span>
                </p>
                <p className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">销售需求</span>
                  <span className="font-medium text-emerald-600">{d?.sales ?? 0} 条</span>
                </p>
              </div>
            )
          }}
        />
      </div>

      {/* 右：需求推荐（采购/销售混合，无标题） */}
      <div className="flex max-h-[560px] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs text-muted-foreground">
            {catName}
            {hovered && <span className="ml-1 font-medium text-primary">· {hovered}</span>}
          </span>
          <span className="text-xs text-muted-foreground">共 {recos.length} 条</span>
        </div>
        {recos.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            该分类 / 地区暂无推荐
          </p>
        ) : (
          <ul className="space-y-2">
            {recos.map((r) => {
              const isPurchase = r.type === "purchase"
              return (
                <li
                  key={r.id}
                  className="group rounded-lg border border-border bg-background p-2.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          isPurchase ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-600",
                        )}
                      >
                        {isPurchase ? <ShoppingCart className="size-3" /> : <Tag className="size-3" />}
                        {isPurchase ? "采购" : "销售"}
                      </span>
                      <p className="line-clamp-1 text-[13px] font-medium text-foreground">{r.title}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={cn("text-sm font-semibold", isPurchase ? "text-primary" : "text-emerald-600")}>
                      {r.price.toLocaleString()}
                      <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">{r.unit}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">{r.spec}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" />
                    {r.place}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ------------------------- 回收网点分布 ------------------------- */
const levelStyle: Record<string, string> = {
  战略合作: "bg-primary/10 text-primary",
  金牌回收商: "bg-amber-50 text-amber-600",
  认证回收商: "bg-emerald-50 text-emerald-600",
}

function NetworkPanel() {
  const [hovered, setHovered] = useState<string | null>(null)
  const stats = useMemo(() => networkStats(), [])

  const recoList = useMemo(() => {
    const scoped = hovered ? recyclers.filter((r) => r.province === hovered) : recyclers
    return scoped.length ? scoped : recyclers
  }, [hovered])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_320px]">
      {/* 左：回收网点统计 */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Building2 className="size-4" />} label="回收网点" value={stats.total.toLocaleString()} />
          <StatCard icon={<MapPin className="size-4" />} label="覆盖省份" value={String(stats.provinces)} />
          <StatCard icon={<ShieldCheck className="size-4" />} label="认证回收商" value={stats.certified.toLocaleString()} />
          <StatCard icon={<TrendingUp className="size-4" />} label="本月新增" value={`+${stats.monthlyAdd}`} />
        </div>
        <div className="flex-1 rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-sm font-semibold text-foreground">网点数量 · 省份排行</p>
          <ul className="space-y-2">
            {stats.top.map((t, i) => {
              const max = stats.top[0].count
              const isHover = hovered === t.province
              return (
                <li
                  key={t.province}
                  onMouseEnter={() => setHovered(t.province)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-1.5 transition-colors",
                    isHover ? "bg-primary/5" : "hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded text-[10px] font-semibold",
                          i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      {t.province}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{t.count} 个</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(t.count / max) * 100}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* 中：中国地图 */}
      <div className="rounded-xl border border-border bg-card p-2">
        <ChinaMap
          values={networkBase}
          hovered={hovered}
          onHover={setHovered}
          tooltip={(name) => (
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <MapPin className="size-3.5 text-primary" />
                {name}
              </p>
              <p className="flex items-center justify-between gap-4 text-xs">
                <span className="text-muted-foreground">回收网点</span>
                <span className="font-medium text-primary">{networkBase[name] ?? 0} 个</span>
              </p>
            </div>
          )}
        />
      </div>

      {/* 右：网点推荐（无标题，与地图联动） */}
      <div className="flex max-h-[560px] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs text-muted-foreground">
            回收商推荐
            {hovered && <span className="ml-1 font-medium text-primary">· {hovered}</span>}
          </span>
          <span className="text-xs text-muted-foreground">共 {recoList.length} 家</span>
        </div>
        <ul className="space-y-2">
          {recoList.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-background p-2.5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 flex-1 text-[13px] font-medium text-foreground">{r.name}</p>
                <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", levelStyle[r.level])}>
                  {r.level}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {r.categories.map((c) => (
                  <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {r.address}
                </span>
                <span className="flex items-center gap-0.5 font-medium text-foreground">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {r.monthlyCap}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

/* ------------------------- 区块标题（无副标题） ------------------------- */
export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 mt-10 flex items-end justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded bg-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {action ?? (
        <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
          查看更多 <ArrowRight className="size-3" />
        </button>
      )}
    </div>
  )
}
