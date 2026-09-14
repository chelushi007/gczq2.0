"use client"

import { useState } from "react"
import {
  Search,
  MapPin,
  ChevronDown,
  Megaphone,
  Gavel,
  Flame,
  ArrowRight,
  Receipt,
  Truck,
  Scale,
  Wallet,
  ShieldCheck,
  Leaf,
  Clock,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  listings,
  listingsByChannel,
  zoneDeals,
  zoneNews,
  featuredServices,
  partnerCompanies,
  scrapCategories,
  scrapImage,
  latestBid,
  BID_STEP,
  type Channel,
  type Listing,
} from "@/lib/steel-zone-data"
import { ZoneBanner } from "./steel-zone/zone-banner"
import { DistributionTabs, SectionTitle } from "./steel-zone/demand-distribution"

const topNav = ["首页", "竞价大厅", "废钢采购", "废钢出售"]

export function SteelZoneChannel() {
  const [publishOpen, setPublishOpen] = useState(false)
  const [searchCat, setSearchCat] = useState("all")
  const [catOpen, setCatOpen] = useState(false)

  return (
    <div className="min-h-full bg-background pb-16">
      {/* 频道顶部导航 */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b border-border bg-card/95 px-8 backdrop-blur">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            钢
          </span>
          <span className="text-base font-bold text-foreground">钢厂专区</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">CHANNEL</span>
        </div>
        <nav className="flex flex-1 items-center gap-5 text-sm">
          {topNav.map((t, i) => (
            <button
              key={t}
              className={cn(
                "whitespace-nowrap py-1 transition-colors",
                i === 0 ? "font-semibold text-primary" : "text-foreground/75 hover:text-primary",
              )}
            >
              {t}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setPublishOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Megaphone className="size-4" />
          发布回收需求
        </button>
      </header>

      {/* 1. Banner 轮播 */}
      <ZoneBanner />

      {/* 2. 搜索引擎 */}
      <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
          <button className="flex shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-primary" />
            全国
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <span className="h-6 w-px bg-border" />
          <div className="relative shrink-0">
            <button
              onClick={() => setCatOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-2 text-sm text-foreground"
            >
              {searchCat === "all" ? "废钢分类" : scrapCategories.find((c) => c.key === searchCat)?.name}
              <ChevronDown className={cn("size-3.5 transition-transform", catOpen && "rotate-180")} />
            </button>
            {catOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setCatOpen(false)} aria-hidden />
                <ul className="absolute left-0 top-full z-30 mt-1 max-h-72 w-40 overflow-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                  {scrapCategories.map((c) => (
                    <li key={c.key}>
                      <button
                        onClick={() => {
                          setSearchCat(c.key)
                          setCatOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                          searchCat === c.key ? "font-medium text-primary" : "text-foreground",
                        )}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <input
            placeholder="搜索废钢品类、回收 / 销售需求、回收商…"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Search className="size-4" />
            搜索
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-xs text-muted-foreground">
          <span>热门：</span>
          {scrapCategories.slice(1, 7).map((c) => (
            <button
              key={c.key}
              onClick={() => setSearchCat(c.key)}
              className={cn("hover:text-primary", searchCat === c.key && "font-medium text-primary")}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 全国分布（废钢需求 / 回收网点 两个 Tab） */}
      <DistributionTabs />

      {/* 4. 竞价大厅 */}
      <BiddingHall />

      {/* 5. 废钢采购 */}
      <ScrapPurchase />

      {/* 6. 废钢销售 */}
      <ScrapSales />

      {/* 7. 成交公告（单独一行） */}
      <DealAnnouncements />

      {/* 8. 资讯服务（单独一行） */}
      <NewsService />

      {/* 9. 特色服务 */}
      <FeaturedServices />

      {/* 10. 合作企业 */}
      <PartnerCompanies />

      {publishOpen && <PublishDemandModal onClose={() => setPublishOpen(false)} />}
    </div>
  )
}

/* ------------------------- 竞价大厅（表格 + 详情卡，参考图2） ------------------------- */
function BiddingHall() {
  const tabs: { key: Channel; label: string; icon: LucideIcon }[] = [
    { key: "竞价回收", label: "竞价回收", icon: Gavel },
    { key: "竞价销售", label: "竞价销售", icon: Flame },
  ]
  const [tab, setTab] = useState<Channel>("竞价回收")
  const items = listingsByChannel(tab)
  const [selectedId, setSelectedId] = useState(items[0]?.id)

  const selected = items.find((i) => i.id === selectedId) ?? items[0]

  function switchTab(k: Channel) {
    setTab(k)
    const first = listingsByChannel(k)[0]
    setSelectedId(first?.id)
  }

  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="竞价大厅" />
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* 左：竞价标的表格 */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">项目名称</th>
                <th className="px-4 py-2.5 font-medium">剩余时间</th>
                <th className="px-4 py-2.5 text-right font-medium">起始价</th>
                <th className="px-4 py-2.5 text-right font-medium">最新报价</th>
                <th className="px-4 py-2.5 text-center font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const live = it.status === "竞价中"
                const latest = latestBid(it)
                const isSel = selected?.id === it.id
                return (
                  <tr
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className={cn(
                      "cursor-pointer border-b border-border last:border-0 transition-colors",
                      isSel ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <td className="max-w-64 truncate px-4 py-3 font-medium text-foreground">{it.title}</td>
                    <td className="px-4 py-3">
                      <span className={cn("flex items-center gap-1 text-xs", live ? "text-destructive" : "text-muted-foreground")}>
                        <Clock className="size-3" />
                        {it.endsIn}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{it.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary">
                      {latest ? latest.toLocaleString() : "--"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 text-[11px] font-medium",
                          live
                            ? "border-destructive/40 bg-destructive/5 text-destructive"
                            : "border-primary/40 bg-primary/5 text-primary",
                        )}
                      >
                        {live ? "报价中" : "未开始"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 右：竞价详情卡 */}
        {selected && <BidDetailCard item={selected} />}
      </div>
    </section>
  )
}

function BidDetailCard({ item }: { item: Listing }) {
  const live = item.status === "竞价中"
  const latest = latestBid(item)
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <img
        src={scrapImage(item.category) || "/placeholder.svg"}
        alt={item.title}
        className="h-40 w-full object-cover"
        crossOrigin="anonymous"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{item.title}</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <Row k="最新报价" v={latest ? `${latest.toLocaleString()} ${item.unit}` : "--"} strong />
          <Row k="起始价" v={`${item.price.toLocaleString()} ${item.unit}`} />
          <Row k="竞价阶梯" v={`${BID_STEP} 元`} />
          <Row k="数量" v={item.quantity} />
          <Row k="剩余时间" v={item.endsIn ?? "--"} />
        </dl>
        <button
          className={cn(
            "mt-4 w-full rounded-md py-2 text-sm font-medium transition-colors",
            live
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
          disabled={!live}
        >
          {live ? "立即报价" : "未开始"}
        </button>
      </div>
    </div>
  )
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={cn("tabular-nums", strong ? "text-base font-bold text-primary" : "text-foreground")}>{v}</dd>
    </div>
  )
}

/* ------------------------- 废钢采购（分类联动 + 竞价回收 / 固定价回收 各两行八卡） ------------------------- */
function ScrapPurchase() {
  const [cat, setCat] = useState("all")
  const inCat = (l: Listing) => cat === "all" || l.catKey === cat
  const bidItems = listings.filter((l) => l.channel === "竞价回收" && inCat(l)).slice(0, 8)
  const fixedItems = listings.filter((l) => l.channel === "固定价回收" && inCat(l)).slice(0, 8)

  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle
        title="废钢采购"
        action={
          <div className="flex max-w-full flex-wrap justify-end gap-1.5">
            {scrapCategories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  cat === c.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        }
      />

      <PurchaseGroup label="竞价回收" icon={Gavel} items={bidItems} />
      <PurchaseGroup label="固定价回收" icon={Scale} items={fixedItems} className="mt-8" />
    </section>
  )
}

function PurchaseGroup({
  label,
  icon: Icon,
  items,
  className,
}: {
  label: string
  icon: LucideIcon
  items: Listing[]
  className?: string
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{items.length} 条</span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-10 text-center text-sm text-muted-foreground">
          该分类下暂无{label}挂牌
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <ScrapCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------- 废钢出售（卡片式，两行八卡） ------------------------- */
function ScrapSales() {
  const items = [...listingsByChannel("竞价销售"), ...listingsByChannel("固定价销售")].slice(0, 8)
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="废钢出售" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <ScrapCard key={it.id} item={it} sale />
        ))}
      </div>
    </section>
  )
}

const statusStyle: Record<string, string> = {
  竞价中: "bg-primary text-primary-foreground",
  报名中: "bg-amber-500 text-white",
  即将开始: "bg-amber-500 text-white",
  固定价: "bg-emerald-600 text-white",
}

function ScrapCard({ item, sale }: { item: Listing; sale?: boolean }) {
  const priceColor = sale ? "text-emerald-600" : "text-destructive"
  const isBid = item.channel.startsWith("竞价")
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
      <div className="relative">
        <img
          src={scrapImage(item.category) || "/placeholder.svg"}
          alt={item.title}
          className="h-32 w-full object-cover"
          crossOrigin="anonymous"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium",
            statusStyle[item.status] ?? "bg-muted text-muted-foreground",
          )}
        >
          {item.status}
        </span>
        {item.endsIn && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/45 px-2 py-1 text-[11px] text-white">
            {isBid ? `${item.endsIn}` : item.spec}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-snug text-foreground">{item.title}</h3>
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-muted-foreground">{isBid ? "起拍价" : "价格"}</span>
            <span className={cn("font-bold", priceColor)}>
              {item.price.toLocaleString()}
              <span className="text-[11px] font-normal text-muted-foreground"> {item.unit}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-muted-foreground">数　量</span>
            <span className="font-medium text-emerald-600">{item.quantity}</span>
          </div>
          <div className="flex items-center gap-1 truncate text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {item.region} · {item.company}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- 成交公告（单独一行） ------------------------- */
function DealAnnouncements() {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="成交公告" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">成交标的</th>
              <th className="px-4 py-2.5 font-medium">品类</th>
              <th className="px-4 py-2.5 font-medium">数量</th>
              <th className="px-4 py-2.5 text-right font-medium">成交价</th>
              <th className="px-4 py-2.5 font-medium">地区</th>
              <th className="px-4 py-2.5 text-right font-medium">成交日期</th>
              <th className="px-4 py-2.5 text-center font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {zoneDeals.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="max-w-72 truncate px-4 py-3 font-medium text-foreground">{d.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.weight}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary">{d.price}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.region}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{d.date}</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                    已成交
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ------------------------- 资讯服务（单独一行） ------------------------- */
function NewsService() {
  const [featured, ...rest] = zoneNews
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="资讯服务" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{featured.tag}</span>
          <h3 className="mt-2 text-pretty text-base font-semibold leading-snug text-foreground">{featured.title}</h3>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{featured.summary}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{featured.date}</span>
            <button className="flex items-center gap-1 text-primary hover:underline">
              阅读全文 <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card px-4">
          {rest.map((n) => (
            <li key={n.id} className="py-2.5 first:pt-3 last:pb-3">
              <button className="group block w-full text-left">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{n.tag}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{n.date}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-[13px] text-foreground/90 group-hover:text-primary">{n.title}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------- 特色服务 ------------------------- */
const serviceIcon: Record<string, LucideIcon> = {
  receipt: Receipt,
  truck: Truck,
  scale: Scale,
  wallet: Wallet,
  shield: ShieldCheck,
  leaf: Leaf,
}

function FeaturedServices() {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="特色服务" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {featuredServices.map((s) => {
          const Icon = serviceIcon[s.icon] ?? ShieldCheck
          return (
            <div
              key={s.key}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/50"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <p className="mt-2.5 text-sm font-medium text-foreground">{s.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------- 合作企业 ------------------------- */
function PartnerCompanies() {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <SectionTitle title="合作企业" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {partnerCompanies.map((p) => (
          <div
            key={p}
            className="flex h-16 items-center justify-center rounded-lg border border-border bg-card px-3 text-center text-sm font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
          >
            {p}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------- 发布回收需求 弹窗 ------------------------- */
function PublishDemandModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="发布回收需求"
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Megaphone className="size-4 text-primary" />
            发布回收需求
          </h3>
          <button onClick={onClose} aria-label="关闭" className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">需求已发布</p>
            <p className="text-xs text-muted-foreground">平台将为您匹配区域内认证回收商，请留意工作台通知。</p>
            <button
              onClick={onClose}
              className="mt-3 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              完成
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Field label="废钢品类">
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                {scrapCategories.slice(1).map((c) => (
                  <option key={c.key}>{c.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="需求数量（吨）">
                <input
                  type="number"
                  placeholder="如 1000"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>
              <Field label="意向单价（元/吨）">
                <input
                  type="number"
                  placeholder="如 2600"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="所在地区">
                <input
                  placeholder="如 河北·唐山"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>
              <Field label="规格要求">
                <input
                  placeholder="如 ≥6mm 优质料"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>
            </div>
            <button
              onClick={() => setSubmitted(true)}
              className="mt-2 w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              发布需求
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
