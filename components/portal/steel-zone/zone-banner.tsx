"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    img: "/images/zone-banner-1.png",
    title: "钢厂废钢回收一站式服务平台",
    desc: "阳光竞价 · 规范处置 · 全程可视 · 合作共赢",
  },
  {
    img: "/images/zone-banner-2.png",
    title: "绿色循环 · 短流程炼钢原料保障",
    desc: "提升废钢比 助力钢铁行业双碳目标",
  },
  {
    img: "/images/zone-banner-3.png",
    title: "智慧物流与供应链金融一体化",
    desc: "过磅验质 · 就近调度 · 账期融资 加速资金周转",
  },
]

export function ZoneBanner() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  const go = (d: number) => setIdx((i) => (i + d + slides.length) % slides.length)

  return (
    <section className="relative h-[360px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.img}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === idx ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <img src={s.img || "/placeholder.svg"} alt={s.title} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/25 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-10">
            <h1 className="max-w-xl text-balance text-3xl font-bold leading-tight text-white drop-shadow md:text-4xl">
              {s.title}
            </h1>
            <p className="mt-4 max-w-lg text-pretty text-sm text-white/90 md:text-base">{s.desc}</p>
          </div>
        </div>
      ))}

      <button
        onClick={() => go(-1)}
        aria-label="上一张"
        className="absolute left-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/40"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="下一张"
        className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/40"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.img}
            onClick={() => setIdx(i)}
            aria-label={`第 ${i + 1} 张`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  )
}
