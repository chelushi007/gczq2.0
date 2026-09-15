"use client"

import { useMemo, useState } from "react"
import { MapPin, ChevronDown, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { regionTree, NATIONWIDE, type RegionNode } from "@/lib/china-regions"

export type RegionSelection = {
  province?: string
  city?: string
  county?: string
}

function label(sel: RegionSelection) {
  const parts = [sel.province, sel.city, sel.county].filter(Boolean)
  return parts.length ? parts.join(" / ") : NATIONWIDE
}

export function RegionCascader({
  value,
  onChange,
}: {
  value: RegionSelection
  onChange: (sel: RegionSelection) => void
}) {
  const [open, setOpen] = useState(false)
  // 面板内高亮的省/市（用于展开下一级），与已确认的选择解耦
  const [activeProvince, setActiveProvince] = useState<string | undefined>(value.province)
  const [activeCity, setActiveCity] = useState<string | undefined>(value.city)

  const provinces = regionTree
  const cities = useMemo<RegionNode[]>(
    () => provinces.find((p) => p.name === activeProvince)?.children ?? [],
    [provinces, activeProvince],
  )
  const counties = useMemo<RegionNode[]>(
    () => cities.find((c) => c.name === activeCity)?.children ?? [],
    [cities, activeCity],
  )

  function openPanel() {
    setActiveProvince(value.province)
    setActiveCity(value.city)
    setOpen(true)
  }

  function pickNationwide() {
    onChange({})
    setActiveProvince(undefined)
    setActiveCity(undefined)
    setOpen(false)
  }

  function pickProvince(name: string) {
    setActiveProvince(name)
    setActiveCity(undefined)
    // 省无下级则直接确认
    const p = provinces.find((x) => x.name === name)
    if (!p?.children?.length) {
      onChange({ province: name })
      setOpen(false)
    }
  }

  function pickCity(name: string) {
    setActiveCity(name)
    const c = cities.find((x) => x.name === name)
    if (!c?.children?.length) {
      onChange({ province: activeProvince, city: name })
      setOpen(false)
    }
  }

  function pickCounty(name: string) {
    onChange({ province: activeProvince, city: activeCity, county: name })
    setOpen(false)
  }

  const isNationwide = !value.province

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="flex max-w-52 items-center gap-1.5 px-2 text-sm font-medium text-foreground"
      >
        <MapPin className="size-4 shrink-0 text-primary" />
        <span className="truncate">{label(value)}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-0 top-full z-30 mt-2 w-[520px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            {/* 全国 */}
            <button
              type="button"
              onClick={pickNationwide}
              className={cn(
                "flex w-full items-center justify-between border-b border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                isNationwide ? "font-semibold text-primary" : "text-foreground",
              )}
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {NATIONWIDE}
              </span>
              {isNationwide && <Check className="size-4" />}
            </button>

            {/* 三栏级联：省 | 市 | 县/区 */}
            <div className="grid grid-cols-3 divide-x divide-border" style={{ height: 280 }}>
              <Column
                items={provinces}
                active={activeProvince}
                selected={value.province}
                onPick={pickProvince}
                showArrow
                emptyText="暂无省份"
              />
              <Column
                items={cities}
                active={activeCity}
                selected={value.city}
                onPick={pickCity}
                showArrow
                emptyText={activeProvince ? "该地区无下级" : "请选择省份"}
              />
              <Column
                items={counties}
                active={value.county}
                selected={value.county}
                onPick={pickCounty}
                emptyText={activeCity ? "该地区无下级" : "请选择城市"}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Column({
  items,
  active,
  selected,
  onPick,
  showArrow,
  emptyText,
}: {
  items: RegionNode[]
  active?: string
  selected?: string
  onPick: (name: string) => void
  showArrow?: boolean
  emptyText: string
}) {
  if (!items.length) {
    return <div className="flex items-center justify-center px-3 text-center text-xs text-muted-foreground">{emptyText}</div>
  }
  return (
    <ul className="overflow-y-auto py-1">
      {items.map((it) => {
        const isActive = active === it.name
        const isSelected = selected === it.name
        return (
          <li key={it.name}>
            <button
              type="button"
              onClick={() => onPick(it.name)}
              className={cn(
                "flex w-full items-center justify-between gap-1 px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                isActive ? "bg-primary/8 font-medium text-primary" : "text-foreground",
              )}
            >
              <span className="truncate">{it.name}</span>
              {isSelected ? (
                <Check className="size-3.5 shrink-0 text-primary" />
              ) : showArrow && it.children?.length ? (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
