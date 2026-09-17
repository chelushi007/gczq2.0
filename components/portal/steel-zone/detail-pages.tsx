"use client"

import {
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  Gavel,
  Scale,
  Phone,
  MessageSquare,
  Building2,
  Truck,
  Wallet,
  ScrollText,
  CheckCircle2,
  Factory,
  Recycle,
  TrendingUp,
  Award,
  PackageSearch,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  listings,
  qualityMills,
  qualityNetworks,
  scrapImage,
  latestBid,
  BID_STEP,
  type Listing,
} from "@/lib/steel-zone-data"
import { statusStyle } from "./scrap-card"

/* ============================ 通用外壳 ============================ */
function Breadcrumb({ crumb, onBack }: { crumb: string; onBack: () => void }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <button onClick={onBack} className="transition-colors hover:text-primary">
        首页
      </button>
      <ChevronRight className="size-3" />
      <span className="max-w-[60vw] truncate font-medium text-foreground">{crumb}</span>
    </nav>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <PackageSearch className="size-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">未找到该信息，可能已下架</p>
        <button
          onClick={onBack}
          className="mt-1 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

/* 右侧信息行 */
function InfoRow({ k, v, strong, accent }: { k: string; v: string; strong?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{k}</dt>
      <dd className={cn("truncate text-right text-sm", strong ? cn("text-base font-bold", accent) : "text-foreground")}>
        {v}
      </dd>
    </div>
  )
}

/* 服务保障（回收/出售通用） */
const GUARANTEES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Scale, title: "验质检斤", desc: "第三方验质、在线扣杂" },
  { icon: Truck, title: "智慧物流", desc: "过磅轨迹全程可视" },
  { icon: Wallet, title: "阳光结算", desc: "电子合同、资金存管" },
  { icon: ShieldCheck, title: "合规保障", desc: "反向开票、金税合规" },
]

function ServiceGuarantees() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">交易服务保障</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GUARANTEES.map((g) => (
          <div key={g.title} className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <g.icon className="size-4" />
            </span>
            <p className="text-[13px] font-medium text-foreground">{g.title}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{g.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============================ 挂牌详情（竞价回收 / 固定价回收 / 废钢出售） ============================ */

// 依据竞价热度合成报价记录（原型数据）
// 竞价回收：出价方为供应商；竞价销售：出价方为意向购买方
function bidRecords(item: Listing) {
  if (!item.bids) return []
  const isSale = !item.channel.endsWith("回收")
  const prefix = isSale ? "意向购买方" : "供应商"
  const n = Math.min(item.bids, 8)
  return Array.from({ length: n }, (_, i) => ({
    bidder: `${prefix}${String.fromCharCode(65 + i)}**`,
    price: item.price + (item.bids! - i) * BID_STEP,
    ago: `${(i + 1) * 3} 分钟前`,
    top: i === 0,
  }))
}

export function ListingDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const item = listings.find((l) => l.id === id)
  if (!item) return <NotFound onBack={onBack} />

  const isBid = item.channel.startsWith("竞价")
  const isRecycle = item.channel.endsWith("回收")
  const isSale = !isRecycle
  const live = item.status === "竞价中"
  const latest = latestBid(item)
  const accentText = isSale ? "text-emerald-600" : "text-primary"
  const records = isBid ? bidRecords(item) : []

  const primaryLabel = isBid
    ? live
      ? isRecycle
        ? "立即报价"
        : "立即出价"
      : "报名未开始"
    : isRecycle
      ? "接单供货"
      : "立即购买"

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <Breadcrumb crumb={item.title} onBack={onBack} />

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* 左：主体 */}
        <div className="space-y-5">
          {/* 图 + 标题 */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative">
              <img
                src={scrapImage(item.category) || "/placeholder.svg"}
                alt={item.title}
                className="h-64 w-full object-cover md:h-80"
                crossOrigin="anonymous"
              />
              <span
                className={cn(
                  "absolute left-3 top-3 rounded px-2 py-0.5 text-[11px] font-medium",
                  statusStyle[item.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {item.status}
              </span>
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/45 px-2 py-0.5 text-[11px] text-white">
                {isBid ? <Gavel className="size-3" /> : <Scale className="size-3" />}
                {item.channel}
              </span>
            </div>
            <div className="p-5">
              <h1 className="text-pretty text-xl font-bold leading-snug text-foreground">{item.title}</h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-foreground">{item.category}</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="size-3" />
                  {item.region}
                </span>
                <span className="flex items-center gap-0.5">
                  <Building2 className="size-3" />
                  {item.company}
                </span>
                <span className="text-muted-foreground/70">编号 {item.id}</span>
              </div>
            </div>
          </div>

          {/* 规格参数 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">标的参数</h3>
            <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <InfoRow k="废钢品类" v={item.category} />
              <InfoRow k="规格要求" v={item.spec} />
              <InfoRow k="交易数量" v={item.quantity} />
              <InfoRow k="交易方式" v={item.channel} />
              <InfoRow k="所在地区" v={item.region} />
              <InfoRow k={isBid ? "起拍单价" : "挂牌单价"} v={`${item.price.toLocaleString()} ${item.unit}`} />
            </dl>
          </section>

          {/* 竞价记录（仅竞价） */}
          {isBid && (
            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold text-foreground">实时报价记录</h3>
                <span className="text-xs text-muted-foreground">共 {item.bids ?? 0} 次报价</span>
              </div>
              {records.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">竞价尚未开始，暂无报价</p>
              ) : (
                <ul className="divide-y divide-border">
                  {records.map((r, i) => (
                    <li key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        {r.top ? (
                          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                            最高
                          </span>
                        ) : (
                          <span className="w-8 text-center text-xs text-muted-foreground">{i + 1}</span>
                        )}
                        {r.bidder}
                      </span>
                      <span className="flex items-center gap-4">
                        <span className={cn("font-semibold tabular-nums", r.top ? "text-primary" : "text-foreground")}>
                          {r.price.toLocaleString()}
                        </span>
                        <span className="w-16 text-right text-[11px] text-muted-foreground">{r.ago}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* 交易说明 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ScrollText className="size-4 text-primary" />
              交易说明
            </h3>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
              <li>· 本标的以磅计验质为准，杂质、水分按合同约定在线扣杂。</li>
              <li>· {isBid ? "竞价阶梯为每次加价的最小幅度，出价即视为认可挂牌条款。" : "固定价挂牌，接单/下单后按挂牌单价结算。"}</li>
              <li>· 支持第三方验质与争议复核，运输可就近调度、全程轨迹可视。</li>
              <li>· 货款通过平台资金存管，签订电子合同后按约结算。</li>
            </ul>
          </section>

          <ServiceGuarantees />
        </div>

        {/* 右：交易面板 */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              {isBid ? (
                <>
                  <p className="text-xs text-muted-foreground">{live ? "当前最高报价" : "起拍单价"}</p>
                  <p className={cn("mt-1 text-3xl font-bold tabular-nums", accentText)}>
                    {(live && latest ? latest : item.price).toLocaleString()}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{item.unit}</span>
                  </p>
                  <dl className="mt-3 border-t border-border pt-2">
                    <InfoRow k="起拍单价" v={`${item.price.toLocaleString()} ${item.unit}`} />
                    <InfoRow k="竞价阶梯" v={`${BID_STEP} 元/次`} />
                    <InfoRow k="交易数量" v={item.quantity} />
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <dt className="shrink-0 text-xs text-muted-foreground">剩余时间</dt>
                      <dd
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium tabular-nums",
                          live ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        <Clock className="size-3.5" />
                        {item.endsIn ?? "--"}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">挂牌单价</p>
                  <p className={cn("mt-1 text-3xl font-bold tabular-nums", accentText)}>
                    {item.price.toLocaleString()}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{item.unit}</span>
                  </p>
                  <dl className="mt-3 border-t border-border pt-2">
                    <InfoRow k="交易数量" v={item.quantity} />
                    <InfoRow k="规格要求" v={item.spec} />
                    <InfoRow k="所在地区" v={item.region} />
                  </dl>
                </>
              )}

              <button
                disabled={isBid && !live}
                className={cn(
                  "mt-4 w-full rounded-md py-2.5 text-sm font-medium transition-colors",
                  isBid && !live
                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {primaryLabel}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <MessageSquare className="size-3.5" />
                  在线咨询
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <Phone className="size-3.5" />
                  电话联系
                </button>
              </div>
            </div>

            {/* 发布企业 */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">发布企业</h3>
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
                    {item.company}
                    <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{item.region} · 平台认证企业</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ============================ 优质钢厂 详情 ============================ */
const MILL_REQUIREMENTS = [
  "磅计验质、在线扣杂，验质结果实时可查",
  "货款按约日结 / 月结，平台资金存管保障",
  "支持就近调度与物流补贴，降低到厂成本",
  "长期稳定框架采购，优先对接认证供应商",
]

export function MillDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const mill = qualityMills.find((m) => m.id === id)
  if (!mill) return <NotFound onBack={onBack} />

  const stats: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: TrendingUp, label: "年度采购", value: mill.annualDemand.replace("年采", "") },
    { icon: Factory, label: "生产工艺", value: mill.process },
    { icon: Wallet, label: "结算方式", value: "阳光结算" },
    { icon: Award, label: "认证状态", value: mill.verified ? "平台认证" : "待认证" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <Breadcrumb crumb={mill.name} onBack={onBack} />

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* 头部 */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={mill.image || "/placeholder.svg"}
              alt={mill.name}
              className="h-64 w-full object-cover md:h-72"
              crossOrigin="anonymous"
            />
            <div className="p-5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{mill.name}</h1>
                {mill.verified && <ShieldCheck className="size-5 text-primary" />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="size-3" />
                  {mill.region}
                </span>
                <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-foreground">{mill.process}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mill.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mill.tags.map((t) => (
                  <span key={t} className="rounded bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 企业实力 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">企业实力</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-background p-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="size-4" />
                  </span>
                  <p className="mt-2 text-sm font-semibold leading-tight text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 采购要求 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">采购与合作要求</h3>
            <ul className="space-y-2">
              {MILL_REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 右：对接面板 */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground">年度采购规模</p>
              <p className="mt-1 text-2xl font-bold text-destructive">{mill.annualDemand}</p>
              <button className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                对接采购
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <MessageSquare className="size-3.5" />
                  在线咨询
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <Phone className="size-3.5" />
                  电话联系
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-sky-50/60 p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Factory className="size-4 text-primary" />
                成为钢厂供应商
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                认证供应商可优先对接区域钢厂采购计划，享稳定订单、就近调度与阳光结算。
              </p>
              <button className="mt-3 w-full rounded-full bg-primary py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                申请成为供应商
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ============================ 回收网点 详情 ============================ */
const NETWORK_SERVICES = [
  "重型破碎与智能分选设备，加工品质稳定",
  "自有车队就近收运，过磅轨迹全程可视",
  "第三方验质检斤，在线扣杂、争议复核",
  "支持反向开票与阳光结算，货款按约到账",
]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("size-3.5", i < Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40")}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-amber-500">{rating}</span>
    </span>
  )
}

export function NetworkDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const net = qualityNetworks.find((n) => n.id === id)
  if (!net) return <NotFound onBack={onBack} />

  const stats: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: TrendingUp, label: "加工能力", value: net.capacity },
    { icon: Star, label: "综合评分", value: `${net.rating} 分` },
    { icon: Recycle, label: "回收类型", value: net.tags[0] ?? "综合回收" },
    { icon: Award, label: "认证状态", value: net.verified ? "优选认证" : "待认证" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <Breadcrumb crumb={net.name} onBack={onBack} />

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={net.image || "/placeholder.svg"}
              alt={net.name}
              className="h-64 w-full object-cover md:h-72"
              crossOrigin="anonymous"
            />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{net.name}</h1>
                {net.verified && <ShieldCheck className="size-5 text-primary" />}
                <span className="ml-auto">
                  <Stars rating={net.rating} />
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="size-3" />
                  {net.region}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{net.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {net.tags.map((t) => (
                  <span key={t} className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">服务能力</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-background p-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <s.icon className="size-4" />
                  </span>
                  <p className="mt-2 text-sm font-semibold leading-tight text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">网点服务与设备</h3>
            <ul className="space-y-2">
              {NETWORK_SERVICES.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <ServiceGuarantees />
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground">月加工能力</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{net.capacity}</p>
              <button className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                联系网点
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <MessageSquare className="size-3.5" />
                  在线咨询
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <Phone className="size-3.5" />
                  电话联系
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-sky-50/60 p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Recycle className="size-4 text-primary" />
                成为回收网点
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                成为平台优选回收网点，获取区域钢厂采购需求、品牌授权与运营扶持。
              </p>
              <button className="mt-3 w-full rounded-full bg-primary py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                申请成为网点
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
