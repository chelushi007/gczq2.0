"use client"

import { useMemo, useState } from "react"
import {
  ChevronRight,
  Search,
  ArrowUpDown,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Factory,
  Recycle,
  ArrowRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  qualityMills,
  qualityNetworks,
  type QualityMill,
  type QualityNetwork,
} from "@/lib/steel-zone-data"
import { RegionCascader, type RegionSelection } from "./region-cascader"

export type PartnerKind = "mills" | "networks"

type SortKey = "default" | "ratingDesc" | "capacityDesc"

// 去除行政区后缀，便于与“河北·唐山”式地区串匹配
function stripSuffix(name?: string) {
  if (!name) return ""
  return name.replace(/(省|市|自治区|自治州|地区|县|区|旗)$/g, "")
}

// 从“月加工 1.2 万吨 / 年采废钢 96 万吨”中提取数值用于排序
function parseAmount(text: string) {
  const m = text.match(/([\d.]+)\s*万?/)
  return m ? Number.parseFloat(m[1]) : 0
}

const MILL_SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "综合排序" },
  { key: "capacityDesc", label: "采购量优先" },
]
const NET_SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "综合排序" },
  { key: "ratingDesc", label: "评分优先" },
  { key: "capacityDesc", label: "加工量优先" },
]

// 工艺类型筛选（钢厂）
const PROCESS_FILTERS = [
  { key: "all", label: "全部工艺" },
  { key: "长流程", label: "长流程" },
  { key: "电炉", label: "电炉" },
  { key: "转炉", label: "转炉" },
]

export function PartnersListPage({
  kind,
  onBack,
  onOpen,
}: {
  kind: PartnerKind
  onBack: () => void
  onOpen?: (id: string) => void
}) {
  return kind === "mills" ? <MillsList onBack={onBack} onOpen={onOpen} /> : <NetworksList onBack={onBack} onOpen={onOpen} />
}

/* ============================ 优质钢厂列表 ============================ */
function MillsList({ onBack, onOpen }: { onBack: () => void; onOpen?: (id: string) => void }) {
  const [region, setRegion] = useState<RegionSelection>({})
  const [keyword, setKeyword] = useState("")
  const [proc, setProc] = useState("all")
  const [sort, setSort] = useState<SortKey>("default")

  const results = useMemo(() => {
    const kw = keyword.trim()
    const prov = stripSuffix(region.province)
    const city = stripSuffix(region.city)
    let out: QualityMill[] = [...qualityMills]
    if (prov) out = out.filter((m) => m.region.includes(prov))
    if (city) out = out.filter((m) => m.region.includes(city))
    if (proc !== "all") out = out.filter((m) => m.process.includes(proc))
    if (kw) out = out.filter((m) => [m.name, m.region, m.desc, ...m.tags].some((f) => f.includes(kw)))
    if (sort === "capacityDesc") out = [...out].sort((a, b) => parseAmount(b.annualDemand) - parseAmount(a.annualDemand))
    return out
  }, [region, keyword, proc, sort])

  return (
    <ListShell
      icon={Factory}
      title="优质钢厂"
      desc="认证优质钢厂直采名录，按地区与工艺快速筛选，稳定对接采购计划"
      crumb="优质钢厂"
      onBack={onBack}
      region={region}
      onRegion={setRegion}
      keyword={keyword}
      onKeyword={setKeyword}
      searchPlaceholder="搜索钢厂名称、地区、采购标签…"
      sorts={MILL_SORTS}
      sort={sort}
      onSort={setSort}
      filterLabel="生产工艺"
      filters={PROCESS_FILTERS}
      filterValue={proc}
      onFilter={setProc}
      count={results.length}
      countUnit="家优质钢厂"
    >
      {results.map((m) => (
        <li key={m.id}>
          <PartnerRow
            image={m.image}
            name={m.name}
            verified={m.verified}
            region={m.region}
            badge={m.process}
            desc={m.desc}
            tags={m.tags}
            tagClass="bg-primary/10 text-primary"
            metricLabel="年度采购"
            metric={m.annualDemand}
            metricClass="text-destructive"
            cta="对接采购"
            onOpen={onOpen && (() => onOpen(m.id))}
          />
        </li>
      ))}
    </ListShell>
  )
}

/* ============================ 优选回收网点列表 ============================ */
function NetworksList({ onBack, onOpen }: { onBack: () => void; onOpen?: (id: string) => void }) {
  const [region, setRegion] = useState<RegionSelection>({})
  const [keyword, setKeyword] = useState("")
  const [sort, setSort] = useState<SortKey>("default")

  const results = useMemo(() => {
    const kw = keyword.trim()
    const prov = stripSuffix(region.province)
    const city = stripSuffix(region.city)
    let out: QualityNetwork[] = [...qualityNetworks]
    if (prov) out = out.filter((n) => n.region.includes(prov))
    if (city) out = out.filter((n) => n.region.includes(city))
    if (kw) out = out.filter((n) => [n.name, n.region, n.desc, ...n.tags].some((f) => f.includes(kw)))
    if (sort === "ratingDesc") out = [...out].sort((a, b) => b.rating - a.rating)
    if (sort === "capacityDesc") out = [...out].sort((a, b) => parseAmount(b.capacity) - parseAmount(a.capacity))
    return out
  }, [region, keyword, sort])

  return (
    <ListShell
      icon={Recycle}
      title="优选回收网点"
      desc="认证回收网点名录，覆盖全国主要产废区域，就近收运、阳光结算"
      crumb="优选回收网点"
      onBack={onBack}
      region={region}
      onRegion={setRegion}
      keyword={keyword}
      onKeyword={setKeyword}
      searchPlaceholder="搜索网点名称、地区、服务标签…"
      sorts={NET_SORTS}
      sort={sort}
      onSort={setSort}
      count={results.length}
      countUnit="家优选网点"
    >
      {results.map((n) => (
        <li key={n.id}>
          <PartnerRow
            image={n.image}
            name={n.name}
            verified={n.verified}
            region={n.region}
            rating={n.rating}
            desc={n.desc}
            tags={n.tags}
            tagClass="bg-emerald-500/10 text-emerald-600"
            metricLabel="加工能力"
            metric={n.capacity}
            metricClass="text-emerald-600"
            cta="联系网点"
            onOpen={onOpen && (() => onOpen(n.id))}
          />
        </li>
      ))}
    </ListShell>
  )
}

/* ============================ 列表外壳（标题 + 筛选 + 结果） ============================ */
function ListShell({
  icon: Icon,
  title,
  desc,
  crumb,
  onBack,
  region,
  onRegion,
  keyword,
  onKeyword,
  searchPlaceholder,
  sorts,
  sort,
  onSort,
  filterLabel,
  filters,
  filterValue,
  onFilter,
  count,
  countUnit,
  children,
}: {
  icon: LucideIcon
  title: string
  desc: string
  crumb: string
  onBack: () => void
  region: RegionSelection
  onRegion: (r: RegionSelection) => void
  keyword: string
  onKeyword: (v: string) => void
  searchPlaceholder: string
  sorts: { key: SortKey; label: string }[]
  sort: SortKey
  onSort: (k: SortKey) => void
  filterLabel?: string
  filters?: { key: string; label: string }[]
  filterValue?: string
  onFilter?: (k: string) => void
  count: number
  countUnit: string
  children: React.ReactNode
}) {
  const [sortOpen, setSortOpen] = useState(false)
  const currentSort = sorts.find((s) => s.key === sort) ?? sorts[0]

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* 面包屑 */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={onBack} className="transition-colors hover:text-primary">
          首页
        </button>
        <ChevronRight className="size-3" />
        <span className="font-medium text-foreground">{crumb}</span>
      </nav>

      {/* 标题区 */}
      <div className="mt-3 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5.5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>

      {/* 筛选面板 */}
      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <RegionCascader value={region} onChange={onRegion} />
          <span className="h-6 w-px bg-border" />
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-md bg-muted px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => onKeyword(e.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              {currentSort.label}
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} aria-hidden />
                <ul className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
                  {sorts.map((s) => (
                    <li key={s.key}>
                      <button
                        onClick={() => {
                          onSort(s.key)
                          setSortOpen(false)
                        }}
                        className={cn(
                          "w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                          sort === s.key ? "font-medium text-primary" : "text-foreground",
                        )}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {filters && filterLabel && (
          <div className="flex gap-3 border-t border-border pt-3">
            <span className="mt-1 shrink-0 text-xs text-muted-foreground">{filterLabel}</span>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => onFilter?.(f.key)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    filterValue === f.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 结果计数 */}
      <div className="mb-4 mt-5 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          共找到 <span className="font-semibold text-foreground">{count}</span> {countUnit}
        </span>
      </div>

      {/* 列表结果 */}
      {count === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Building2 className="size-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">未找到符合条件的记录，试试调整筛选条件</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">{children}</ul>
      )}
    </div>
  )
}

/* ============================ 列表行（左图右文） ============================ */
function PartnerRow({
  image,
  name,
  verified,
  region,
  badge,
  rating,
  desc,
  tags,
  tagClass,
  metricLabel,
  metric,
  metricClass,
  cta,
  onOpen,
}: {
  image: string
  name: string
  verified: boolean
  region: string
  badge?: string
  rating?: number
  desc: string
  tags: string[]
  tagClass: string
  metricLabel: string
  metric: string
  metricClass: string
  cta: string
  onOpen?: () => void
}) {
  return (
    <article
      onClick={onOpen}
      className={cn(
        "group flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md",
        onOpen && "cursor-pointer",
      )}
    >
      <img
        src={image || "/placeholder.svg"}
        alt={name}
        className="h-32 w-44 shrink-0 rounded-lg object-cover"
        crossOrigin="anonymous"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-base font-semibold text-foreground">{name}</h3>
          {verified && <ShieldCheck className="size-4 shrink-0 text-primary" />}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MapPin className="size-3" />
            {region}
          </span>
          {badge && <span className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{badge}</span>}
          {rating != null && (
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="size-3 fill-amber-500" />
              {rating}
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {tags.map((t) => (
            <span key={t} className={cn("rounded px-1.5 py-0.5 text-[11px]", tagClass)}>
              {t}
            </span>
          ))}
        </div>
      </div>
      {/* 右侧指标 + 操作 */}
      <div className="flex w-32 shrink-0 flex-col items-end justify-between border-l border-border pl-4">
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">{metricLabel}</p>
          <p className={cn("mt-0.5 text-sm font-bold leading-tight", metricClass)}>{metric}</p>
        </div>
        <button
          onClick={onOpen}
          className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {cta}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </article>
  )
}
