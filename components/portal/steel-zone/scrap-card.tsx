import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { scrapImage, type Listing } from "@/lib/steel-zone-data"

export const statusStyle: Record<string, string> = {
  竞价中: "bg-primary text-primary-foreground",
  报名中: "bg-amber-500 text-white",
  即将开始: "bg-amber-500 text-white",
  固定价: "bg-emerald-600 text-white",
}

export function ScrapCard({ item, sale }: { item: Listing; sale?: boolean }) {
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
