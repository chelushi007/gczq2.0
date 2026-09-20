"use client"

import { useState } from "react"
import { Download, TrendingUp, PieChart, MapPin, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { FilterBar, FilterChip } from "@/components/shared/data-table"
import { SectionCard } from "./ops-ui"
import { opsTrend, opsCategoryDist, opsChannelDist, opsRegionRank } from "@/lib/steel-data"

const ranges = ["近 7 天", "近 30 天", "近 6 个月", "本年"]
const catColors = ["bg-primary", "bg-amber-500", "bg-violet-500"]

export function OpsStats() {
  const [range, setRange] = useState("近 6 个月")

  const maxGmv = Math.max(...opsTrend.map((t) => t.gmv))
  const maxVol = Math.max(...opsTrend.map((t) => t.volume))
  const maxRegion = Math.max(...opsRegionRank.map((r) => r.amount))
  const catTotal = opsCategoryDist.reduce((s, c) => s + c.value, 0)
  const maxChannel = Math.max(...opsChannelDist.map((c) => c.value))

  return (
    <div className="space-y-5">
      <PageHeader
        title="统计查询"
        desc="平台经营数据分析：成交趋势、品类与渠道结构、区域分布"
        action={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-4" />
            导出报表
          </Button>
        }
      />

      <FilterBar>
        {ranges.map((r) => (
          <FilterChip key={r} active={range === r} onClick={() => setRange(r)}>
            {r}
          </FilterChip>
        ))}
      </FilterBar>

      {/* 趋势：GMV 与 成交量 双列图 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="成交额趋势"
          desc="单位：百万元"
          icon={<TrendingUp className="size-4 text-primary" />}
        >
          <div className="flex h-48 items-end justify-between gap-3">
            {opsTrend.map((t) => (
              <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium tabular-nums text-foreground">{t.gmv}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-primary transition-all"
                    style={{ height: `${(t.gmv / maxGmv) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{t.month}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="成交量趋势"
          desc="单位：吨"
          icon={<TrendingUp className="size-4 text-emerald-600" />}
        >
          <div className="flex h-48 items-end justify-between gap-3">
            {opsTrend.map((t) => (
              <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium tabular-nums text-foreground">{t.volume.toLocaleString()}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-emerald-500 transition-all"
                    style={{ height: `${(t.volume / maxVol) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{t.month}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 品类分布 */}
        <SectionCard
          title="品类成交分布"
          desc="按成交金额占比统计"
          icon={<Layers className="size-4 text-primary" />}
        >
          {/* 占比条 */}
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {opsCategoryDist.map((c, i) => (
              <div
                key={c.name}
                className={catColors[i]}
                style={{ width: `${(c.value / catTotal) * 100}%` }}
                title={`${c.name} ${c.value}%`}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-3">
            {opsCategoryDist.map((c, i) => (
              <li key={c.name} className="flex items-center gap-3 text-sm">
                <span className={`size-2.5 shrink-0 rounded-full ${catColors[i]}`} />
                <span className="flex-1 text-foreground">{c.name}</span>
                <span className="tabular-nums text-muted-foreground">{c.amount}</span>
                <span className="w-12 text-right font-medium tabular-nums text-foreground">{c.value}%</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 渠道分布 */}
        <SectionCard
          title="成交渠道分布"
          desc="按竞价 / 固定价 / 协议统计"
          icon={<PieChart className="size-4 text-primary" />}
        >
          <ul className="space-y-4">
            {opsChannelDist.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-foreground">{c.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / maxChannel) * 100}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                  {c.value}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* 区域排行 */}
      <SectionCard
        title="区域成交排行"
        desc="按成交金额（万元）排序 Top 5"
        icon={<MapPin className="size-4 text-primary" />}
      >
        <ul className="space-y-3">
          {opsRegionRank.map((r, i) => (
            <li key={r.region} className="flex items-center gap-3">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                  i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="w-28 shrink-0 text-sm text-foreground">{r.region}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(r.amount / maxRegion) * 100}%` }} />
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                {r.amount.toLocaleString()} 万
              </span>
              <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">{r.orders} 单</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
