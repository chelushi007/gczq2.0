import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

const toneText: Record<string, string> = {
  primary: "text-primary",
  amber: "text-amber-600",
  green: "text-emerald-600",
  violet: "text-violet-600",
}

const toneBg: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  violet: "bg-violet-500",
}

// 运营指标卡
export function KpiCard({
  label,
  value,
  unit,
  trend,
  trendUp,
  tone = "primary",
}: {
  label: string
  value: string
  unit?: string
  trend?: string
  trendUp?: boolean
  tone?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium",
              trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn("text-2xl font-semibold", toneText[tone] ?? "text-foreground")}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full w-2/3 rounded-full", toneBg[tone] ?? "bg-primary")} />
      </div>
    </div>
  )
}

// 区块卡片：标题 + 说明 + 内容
export function SectionCard({
  title,
  desc,
  icon,
  action,
  className,
  children,
}: {
  title: string
  desc?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}
