"use client"

import { useMemo, useState } from "react"
import { ChevronRight, Search, ArrowUpDown, PackageSearch, Gavel, ShoppingCart, Tag } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { listings, scrapCategories, type Channel, type Listing } from "@/lib/steel-zone-data"
import { RegionCascader, type RegionSelection } from "./region-cascader"
import { ScrapCard } from "./scrap-card"

export type ListKind = "opportunity" | "purchase" | "sales"

type KindConfig = {
  title: string
  desc: string
  icon: LucideIcon
  channels: Channel[]
  // 交易类型子筛选（首项恒为“全部”）
  subFilters: { key: string; label: string }[]
}

const KIND_CONFIG: Record<ListKind, KindConfig> = {
  opportunity: {
    title: "废钢商机",
    desc: "汇聚全国竞价回收与竞价销售商机，实时把握价格窗口",
    icon: Gavel,
    channels: ["竞价回收", "竞价销售"],
    subFilters: [
      { key: "all", label: "全部商机" },
      { key: "竞价回收", label: "竞价回收" },
      { key: "竞价销售", label: "竞价销售" },
    ],
  },
  purchase: {
    title: "废钢采购",
    desc: "钢厂与回收商采购挂牌，支持竞价回收与固定价回收",
    icon: ShoppingCart,
    channels: ["竞价回收", "固定价回收"],
    subFilters: [
      { key: "all", label: "全部采购" },
      { key: "竞价回收", label: "竞价回收" },
      { key: "固定价回收", label: "固定价回收" },
    ],
  },
  sales: {
    title: "废钢出售",
    desc: "现货废钢与副产品出售，支持竞价销售与固定价销售",
    icon: Tag,
    channels: ["竞价销售", "固定价销售"],
    subFilters: [
      { key: "all", label: "全部出售" },
      { key: "竞价销售", label: "竞价销售" },
      { key: "固定价销售", label: "固定价销售" },
    ],
  },
}

type SortKey = "default" | "priceAsc" | "priceDesc"
const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "综合排序" },
  { key: "priceAsc", label: "价格从低到高" },
  { key: "priceDesc", label: "价格从高到低" },
]

// 去除市/县/区后缀，便于与挂牌地区串（如“河北·唐山”）匹配
function stripSuffix(name?: string) {
  if (!name) return ""
  return name.replace(/(省|市|自治区|自治州|地区|县|区|旗)$/g, "")
}

export function SteelListPage({
  kind,
  onBack,
  onOpen,
}: {
  kind: ListKind
  onBack: () => void
  onOpen?: (id: string) => void
}) {
  const config = KIND_CONFIG[kind]
  const [cat, setCat] = useState("all")
  const [sub, setSub] = useState("all")
  const [region, setRegion] = useState<RegionSelection>({})
  const [keyword, setKeyword] = useState("")
  const [sort, setSort] = useState<SortKey>("default")
  const [sortOpen, setSortOpen] = useState(false)

  const results = useMemo(() => {
    const kw = keyword.trim()
    const prov = stripSuffix(region.province)
    const city = stripSuffix(region.city)
    let out: Listing[] = listings.filter((l) => config.channels.includes(l.channel))
    if (sub !== "all") out = out.filter((l) => l.channel === sub)
    if (cat !== "all") out = out.filter((l) => l.catKey === cat)
    if (prov) out = out.filter((l) => l.region.includes(prov))
    if (city) out = out.filter((l) => l.region.includes(city))
    if (kw) {
      out = out.filter((l) =>
        [l.title, l.company, l.region, l.category].some((f) => f.includes(kw)),
      )
    }
    if (sort === "priceAsc") out = [...out].sort((a, b) => a.price - b.price)
    if (sort === "priceDesc") out = [...out].sort((a, b) => b.price - a.price)
    return out
  }, [config.channels, sub, cat, region, keyword, sort])

  const Icon = config.icon
  const currentSort = SORTS.find((s) => s.key === sort) ?? SORTS[0]

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* 面包屑 */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={onBack} className="transition-colors hover:text-primary">
          首页
        </button>
        <ChevronRight className="size-3" />
        <span className="font-medium text-foreground">{config.title}</span>
      </nav>

      {/* 标题区 */}
      <div className="mt-3 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5.5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">{config.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{config.desc}</p>
        </div>
      </div>

      {/* 筛选面板 */}
      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
        {/* 地区 + 搜索 + 排序 */}
        <div className="flex flex-wrap items-center gap-3">
          <RegionCascader value={region} onChange={setRegion} />
          <span className="h-6 w-px bg-border" />
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-md bg-muted px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={`搜索${config.title}标题、企业、地区…`}
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
                  {SORTS.map((s) => (
                    <li key={s.key}>
                      <button
                        onClick={() => {
                          setSort(s.key)
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

        {/* 交易类型 */}
        <FilterRow label="交易类型">
          {config.subFilters.map((f) => (
            <Chip key={f.key} active={sub === f.key} onClick={() => setSub(f.key)}>
              {f.label}
            </Chip>
          ))}
        </FilterRow>

        {/* 废钢分类 */}
        <FilterRow label="废钢分类">
          {scrapCategories.map((c) => (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
              {c.name}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {/* 结果计数 */}
      <div className="mb-4 mt-5 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          共找到 <span className="font-semibold text-foreground">{results.length}</span> 条{config.title}信息
        </span>
      </div>

      {/* 结果网格 */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <PackageSearch className="size-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">未找到符合条件的{config.title}，试试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {results.map((it) => (
            <ScrapCard
              key={it.id}
              item={it}
              sale={it.channel.endsWith("销售")}
              onClick={onOpen && (() => onOpen(it.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-border pt-3">
      <span className="mt-1 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
