"use client"

import { useMemo, type ReactNode } from "react"
import { geoMercator, geoPath } from "d3-geo"
import rawGeo from "@/lib/china-geo.json"

const geo = rawGeo as unknown as {
  features: { type: string; properties: { name: string }; geometry: unknown }[]
}

function shortName(full: string) {
  return full
    .replace("维吾尔自治区", "")
    .replace("壮族自治区", "")
    .replace("回族自治区", "")
    .replace("特别行政区", "")
    .replace("自治区", "")
    .replace(/省$/, "")
    .replace(/市$/, "")
}

export type MapLegendItem = { label: string; color: string }

const W = 800
const H = 640

export function ChinaMap({
  values,
  hovered,
  onHover,
  tooltip,
}: {
  values: Record<string, number>
  hovered: string | null
  onHover: (name: string | null) => void
  tooltip?: (name: string) => ReactNode
}) {
  const { features, pathFor, centroids } = useMemo(() => {
    const projection = geoMercator().fitSize([W, H], geo as never)
    const path = geoPath(projection)
    const features = geo.features.map((f) => ({ feature: f, name: shortName(f.properties.name) }))
    const centroids: Record<string, [number, number]> = {}
    for (const { feature, name } of features) {
      centroids[name] = path.centroid(feature as never) as [number, number]
    }
    return { features, pathFor: (f: unknown) => path(f as never), centroids }
  }, [])

  const hoveredCentroid = hovered ? centroids[hovered] : null

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="中国分布地图">
        <g>
          {features.map(({ feature, name }) => {
            const isHover = hovered === name
            return (
              <path
                key={name}
                d={pathFor(feature) ?? undefined}
                fill={isHover ? "#7fb8f2" : "#cfe6fb"}
                stroke="#ffffff"
                strokeWidth={0.8}
                className="cursor-pointer transition-colors duration-150"
                onMouseEnter={() => onHover(name)}
                onMouseLeave={() => onHover(null)}
              />
            )
          })}
        </g>
        {/* 省份名称标注 */}
        <g className="pointer-events-none">
          {features.map(({ name }) => {
            const c = centroids[name]
            if (!c) return null
            const [x, y] = c
            return (
              <text
                key={`${name}-label`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={hovered === name ? "#0f3d70" : "#5b7591"}
                style={{ fontSize: 10, fontWeight: hovered === name ? 700 : 500 }}
              >
                {name}
              </text>
            )
          })}
        </g>
      </svg>

      {/* 悬浮提示 */}
      {hovered && hoveredCentroid && tooltip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(hoveredCentroid[0] / W) * 100}%`,
            top: `${(hoveredCentroid[1] / H) * 100}%`,
          }}
        >
          <div className="mb-2 min-w-36 rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
            {tooltip(hovered)}
          </div>
        </div>
      )}

      {/* 南海诸岛 装饰角标 */}
      <div className="absolute bottom-3 right-3 flex h-20 w-14 flex-col items-center justify-end rounded-md border border-sky-200 bg-sky-50/70 pb-1">
        <span className="text-[10px] leading-tight text-sky-700">南海诸岛</span>
      </div>
    </div>
  )
}
