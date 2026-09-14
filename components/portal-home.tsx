import { MapPin, Search, ChevronDown, Recycle, ShoppingCart, Factory, Zap, Warehouse, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const newsList = [
  { title: "中国铁建循环物资平台与资环链金共商平台合作新篇章", date: "2026-09-05", featured: true },
  { title: "盘古循环资源平台上线钢厂废钢竞价回收新模式", date: "2026-09-04" },
  { title: "关于规范废旧物资回收交易流程的公告", date: "2026-09-02" },
  { title: "平台2026年第三季度绿色处置成果发布", date: "2026-08-30" },
]

const dealList = [
  { title: "dean-废旧电脑-090302 成交公告", date: "2026-09-03" },
  { title: "华东-废钢边角料-090215 成交公告", date: "2026-09-02" },
  { title: "西南-报废设备-083008 成交公告", date: "2026-08-30" },
  { title: "华北-废旧钢材-082906 成交公告", date: "2026-08-29" },
]

const topNav = [
  "首页",
  "资源盘活",
  "资源采购",
  "钢厂专区",
  "微电网",
  "云仓共享",
  "直购直租",
  "资讯中心",
  "关于我们",
]

const sideTabs = ["资讯公告", "重点推荐", "报价大厅", "资源盘活", "资源采购"]

const modules = [
  { key: "revitalize", label: "资源盘活", desc: "闲置资产处置变现", icon: Recycle, tone: "bg-emerald-50 text-emerald-600" },
  { key: "procure", label: "资源采购", desc: "阳光竞价采购", icon: ShoppingCart, tone: "bg-sky-50 text-sky-600" },
  { key: "steel", label: "钢厂专区", desc: "废钢回收一站式", icon: Factory, tone: "bg-primary/10 text-primary", steel: true },
  { key: "grid", label: "微电网", desc: "绿电交易与调度", icon: Zap, tone: "bg-amber-50 text-amber-600" },
  { key: "cloud", label: "云仓共享", desc: "仓储资源共享", icon: Warehouse, tone: "bg-violet-50 text-violet-600" },
]

export function PortalHome({ onNavigateSteel }: { onNavigateSteel: () => void }) {
  return (
    <div className="min-h-full bg-background pb-12">
      {/* 顶部导航 */}
      <header className="flex h-16 items-center gap-8 border-b border-border bg-card px-8">
        <div className="flex shrink-0 flex-col leading-none">
          <span className="text-xl font-bold tracking-tight text-foreground">盘古循环资源</span>
          <span className="mt-0.5 text-[10px] font-medium tracking-[0.2em] text-muted-foreground">
            PANGU CIRCULAR RESOURCE
          </span>
        </div>
        <nav className="flex flex-1 items-center gap-5 text-sm">
          {topNav.map((item) => {
            const isHome = item === "首页"
            const isSteel = item === "钢厂专区"
            return (
              <button
                key={item}
                onClick={isSteel ? onNavigateSteel : undefined}
                className={cn(
                  "relative whitespace-nowrap py-1 transition-colors",
                  isHome ? "font-semibold text-primary" : "text-foreground/80 hover:text-primary",
                )}
              >
                {item}
                {isHome && <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded bg-primary" />}
              </button>
            )
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <button className="font-semibold text-primary">进入工作台</button>
          <button className="flex items-center gap-1 text-foreground/80 hover:text-primary">
            演示集团 <ChevronDown className="size-3.5" />
          </button>
          <button className="flex items-center gap-1 text-foreground/80 hover:text-primary">
            yanshi <ChevronDown className="size-3.5" />
          </button>
        </div>
      </header>

      {/* 主视觉 */}
      <section className="relative">
        <div className="relative h-[420px] overflow-hidden">
          <img
            src="/images/portal-hero.png"
            alt="现代建筑与蓝天，寓意绿色循环与可持续未来"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/10 to-transparent" />
          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <h1 className="text-balance text-4xl font-bold tracking-[0.15em] text-white drop-shadow md:text-5xl">
              循环利用 · 价值重塑 · 绿建未来
            </h1>
            <p className="mt-6 text-base tracking-[0.35em] text-white/90 md:text-lg">
              规范处置 | 阳光交易 | 资源共享 | 合作共赢
            </p>
          </div>

          {/* 右侧浮动快捷入口 */}
          <div className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 flex-col overflow-hidden rounded-l-lg shadow-lg">
            {sideTabs.map((t) => (
              <button
                key={t}
                className="w-11 border-b border-white/20 bg-primary px-2 py-3 text-center text-xs leading-tight text-primary-foreground transition-colors last:border-b-0 hover:bg-primary/85"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索条 */}
        <div className="mx-auto -mt-9 flex max-w-4xl items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
          <button className="flex shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-red-500" />
            区域范围
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <span className="h-6 w-px bg-border" />
          <button className="flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            全部 <ChevronDown className="size-3.5" />
          </button>
          <input
            placeholder="请输入您要搜索的关键词"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button className="flex shrink-0 items-center justify-center rounded-md bg-primary px-7 py-2.5 text-primary-foreground transition-colors hover:bg-primary/90">
            <Search className="size-4" />
          </button>
        </div>
      </section>

      {/* 专区入口 */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-foreground">平台专区</h2>
          <span className="text-xs text-muted-foreground">规范处置 · 阳光交易</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {modules.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.key}
                onClick={m.steel ? onNavigateSteel : undefined}
                className={cn(
                  "group flex flex-col items-start rounded-lg border border-border bg-card p-4 text-left transition-colors",
                  m.steel ? "hover:border-primary" : "hover:border-primary/40",
                )}
              >
                <span className={cn("flex size-10 items-center justify-center rounded-lg", m.tone)}>
                  <Icon className="size-5" />
                </span>
                <span className="mt-3 text-sm font-semibold text-foreground">{m.label}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</span>
                {m.steel && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    进入专区
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* 新闻资讯 & 成交公告 */}
      <section className="mx-auto mt-10 grid max-w-6xl gap-5 px-6 lg:grid-cols-[1.6fr_1fr]">
        {/* 新闻资讯 */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span className="h-4 w-1 rounded bg-primary" />
              新闻资讯
            </h2>
            <button className="text-xs text-muted-foreground hover:text-primary">更多</button>
          </div>
          <div className="flex gap-4">
            <img
              src="/images/news-tech.png"
              alt="循环物资平台合作新闻配图"
              className="hidden h-28 w-44 shrink-0 rounded-md object-cover sm:block"
            />
            <ul className="min-w-0 flex-1 divide-y divide-border">
              {newsList.map((n) => (
                <li key={n.title} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <button className="min-w-0 flex-1 truncate text-left text-sm text-foreground/90 hover:text-primary">
                    {n.title}
                  </button>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 成交公告 */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span className="h-4 w-1 rounded bg-primary" />
              成交公告
            </h2>
            <button className="text-xs text-muted-foreground hover:text-primary">更多</button>
          </div>
          <ul className="divide-y divide-border">
            {dealList.map((d) => (
              <li key={d.title} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <button className="block w-full truncate text-left text-sm text-foreground/90 hover:text-primary">
                    {d.title}
                  </button>
                  <span className="text-xs text-muted-foreground">{d.date}</span>
                </div>
                <button className="flex shrink-0 items-center gap-0.5 text-xs text-primary hover:underline">
                  详情 <ArrowRight className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
