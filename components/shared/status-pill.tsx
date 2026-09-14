import { cn } from "@/lib/utils"

type Tone = "blue" | "green" | "amber" | "red" | "gray" | "violet"

const toneMap: Record<Tone, string> = {
  blue: "bg-primary/10 text-primary ring-primary/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  gray: "bg-muted text-muted-foreground ring-border",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
}

export function StatusPill({ children, tone = "gray" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneMap[tone],
      )}
    >
      {children}
    </span>
  )
}

// 常用状态 -> 色调映射
export function statusTone(status: string): Tone {
  switch (status) {
    case "进行中":
    case "履约中":
    case "合作中":
    case "已成交":
    case "已完成":
    case "已结算":
    case "已签署":
    case "已归档":
      return status.startsWith("已") ? "green" : "blue"
    case "待开标":
    case "挂单中":
    case "部分成交":
    case "结算中":
      return "amber"
    case "待签署":
    case "待审核":
    case "待结算":
      return "violet"
    case "已流标":
    case "已停用":
    case "已到期":
      return "red"
    default:
      return "gray"
  }
}
