"use client"

import { useMemo, type ReactNode } from "react"
import { geoMercator, geoPath } from "d3-geo"
// @ts-expect-error 该包无类型声明
import rewind from "@mapbox/geojson-rewind"
import rawGeo from "@/lib/china-geo.json"

// 该 GeoJSON 数据源的多边形环绕方向与 d3-geo 的球面右手定则相反，
// 未处理时每个省份都会被填充成整幅世界地图（表现为一整块蓝色）。
// 用 geojson-rewind 以顺时针方向重排后即可正确渲染各省轮廓。
const geo = rewind(JSON.parse(JSON.stringify(rawGeo)), true) as {
  features: {
    type: string
    properties: { name: string; centroid?: [number, number]; center?: [number, number] }
    geometry: unknown
  }[]
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

// 画布宽度（viewBox 逻辑单位），高度按大陆纵横比自动推导
const W = 800

// 中国大陆取景框（经纬度）。刻意排除南纬 18° 以下的南海诸岛，
// 使大陆铺满板块，南海诸岛改由右下角角标单独展示。
// d3-geo 使用球面几何，外环需顺时针缠绕，否则会被当作“整球减去该框”。
const MAINLAND_BOX = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      [
        [73.4, 17.8],
        [73.4, 53.7],
        [135.2, 53.7],
        [135.2, 17.8],
        [73.4, 17.8],
      ],
    ],
  },
}

// 直辖市 / 港澳等相互紧邻的小区域，气泡与标签做轻微偏移避免重叠
const offset: Record<string, [number, number]> = {
  北京: [-6, -12],
  天津: [12, 6],
  上海: [14, 4],
  香港: [2, 12],
  澳门: [-14, 10],
  河北: [-8, 10],
}

// 密度配色：低值浅蓝 → 高值深蓝，与参考图一致
const LOW = [201, 224, 255]
const HIGH = [26, 86, 219]
function mixColor(t: number) {
  const c = LOW.map((x, i) => Math.round(x + (HIGH[i] - x) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

// 数量密度色块（choropleth）——5 档离散分级，由浅到深
const TIER_COLORS = ["#e4eefc", "#bcd6f7", "#88b6f0", "#4f8ae4", "#1e56d6"]
const NO_DATA_FILL = "#eef3f7"

// 根据最大值把数值切成 5 档，返回各档上界（用于填色与图例）
function buildTiers(max: number) {
  const top = Math.max(max, 5)
  return [0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.max(1, Math.round(top * f)))
}

function tierIndex(v: number, tiers: number[]) {
  for (let i = 0; i < tiers.length; i++) if (v <= tiers[i]) return i
  return tiers.length - 1
}

export function ChinaMap({
  values = {},
  hovered,
  onHover,
  tooltip,
}: {
  values?: Record<string, number>
  hovered: string | null
  onHover: (name: string | null) => void
  tooltip?: (name: string) => ReactNode
}) {
  const { H, features, pathFor, centroids } = useMemo(() => {
    // 先按宽度撑满测出大陆取景框的自然高度，保证不拉伸变形
    const measure = geoMercator().fitExtent(
      [
        [0, 0],
        [W, 100000],
      ],
      MAINLAND_BOX as never,
    )
    const measured = geoPath(measure).bounds(MAINLAND_BOX as never) as [[number, number], [number, number]]
    const H = Math.ceil(measured[1][1] - measured[0][1])

    const projection = geoMercator()
      .fitSize([W, H], MAINLAND_BOX as never)
      .clipExtent([
        [0, 0],
        [W, H],
      ])
    const path = geoPath(projection)

    const features = geo.features
      .filter((f) => f.properties?.name?.trim())
      .map((f) => ({ feature: f, name: shortName(f.properties.name) }))

    const centroids: Record<string, [number, number] | null> = {}
    for (const { feature, name } of features) {
      const lonlat = feature.properties.centroid ?? feature.properties.center
      centroids[name] = lonlat ? (projection(lonlat) as [number, number]) : null
    }
    return { H, features, pathFor: (f: unknown) => path(f as never), centroids }
  }, [])

  // 数值范围（用于气泡半径与配色的归一化）
  const { min, max } = useMemo(() => {
    const vs = Object.values(values).filter((v) => typeof v === "number")
    if (!vs.length) return { min: 0, max: 1 }
    return { min: Math.min(...vs), max: Math.max(...vs) }
  }, [values])

  // 密度色块分档（choropleth）及图例区间
  const { tiers, legend } = useMemo(() => {
    const tiers = buildTiers(max)
    const legend = tiers.map((upper, i) => {
      const lower = i === 0 ? 1 : tiers[i - 1] + 1
      const label = i === 0 ? `≤ ${upper}` : upper === lower ? `${upper}` : `${lower} - ${upper}`
      return { label, color: TIER_COLORS[i] }
    })
    return { tiers, legend }
  }, [max])

  const hoveredCentroid = hovered ? centroids[hovered] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="中国分布地图"
      >
        <defs>
          <filter id="bubbleGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1d4ed8" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 省份密度色块（choropleth）*/}
        <g>
          {features.map(({ feature, name }) => {
            const isHover = hovered === name
            const v = values[name]
            const fill = v == null ? NO_DATA_FILL : TIER_COLORS[tierIndex(v, tiers)]
            return (
              <path
                key={name}
                d={pathFor(feature) ?? undefined}
                fill={fill}
                stroke={isHover ? "#1e40af" : "#ffffff"}
                strokeWidth={isHover ? 1.8 : 1.2}
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer transition-colors duration-150"
                onMouseEnter={() => onHover(name)}
                onMouseLeave={() => onHover(null)}
              />
            )
          })}
        </g>

        {/* 数据聚合圈（密度气泡）+ 省份名称 */}
        <g>
          {features.map(({ name }) => {
            const c = centroids[name]
            if (!c) return null
            const [ox, oy] = offset[name] ?? [0, 0]
            const cx = c[0] + ox
            const cy = c[1] + oy
            const v = values[name]
            const isHover = hovered === name

            // 无数据的地区只标注名称
            if (v == null) {
              return (
                <text
                  key={`${name}-label`}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHover ? "#0f3d70" : "#5b7591"}
                  style={{ fontSize: 11, fontWeight: isHover ? 700 : 500 }}
                  className="pointer-events-none"
                >
                  {name}
                </text>
              )
            }

            const t = max > min ? (v - min) / (max - min) : 0.5
            const r = 10 + Math.sqrt(t) * 13
            const rr = isHover ? r + 2 : r
            const fill = mixColor(t)
            const textFill = t > 0.42 ? "#ffffff" : "#1e3a8a"
            const label = Math.round(v)
            const digits = String(label).length

            return (
              <g
                key={`${name}-bubble`}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => onHover(name)}
                onMouseLeave={() => onHover(null)}
              >
                {/* 外发光光晕 · 体现密度 */}
                <circle cx={cx} cy={cy} r={rr * 1.75} fill={fill} opacity={isHover ? 0.22 : 0.14} />
                {/* 主气泡 */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rr}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={1.6}
                  filter="url(#bubbleGlow)"
                />
                {/* 数值 */}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textFill}
                  style={{ fontSize: digits >= 3 ? 9.5 : 12, fontWeight: 700 }}
                  className="pointer-events-none tabular-nums"
                >
                  {label}
                </text>
                {/* 省份名称（气泡下方） */}
                <text
                  x={cx}
                  y={cy + rr + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHover ? "#0f3d70" : "#6b8199"}
                  style={{ fontSize: 9, fontWeight: isHover ? 700 : 500 }}
                  className="pointer-events-none"
                >
                  {name}
                </text>
              </g>
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

      {/* 密度色块图例（示例）*/}
      <div className="absolute bottom-2 left-2 rounded-lg border border-sky-100 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm">
        <p className="mb-1.5 text-[11px] font-semibold text-slate-600">数量密度（示例）</p>
        <div className="flex flex-col gap-1">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="inline-block size-3 rounded-sm ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] leading-none text-slate-500 tabular-nums">{item.label}</span>
            </div>
          ))}
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className="inline-block size-3 rounded-sm ring-1 ring-inset ring-black/5"
              style={{ backgroundColor: NO_DATA_FILL }}
            />
            <span className="text-[10px] leading-none text-slate-500">暂无数据</span>
          </div>
        </div>
      </div>

      {/* 南海诸岛 角标 */}
      <div className="absolute bottom-2 right-2 flex h-24 w-16 flex-col items-center justify-end rounded-md border border-sky-200 bg-sky-50/70 pb-1">
        <span className="text-[10px] leading-tight text-sky-700">南海诸岛</span>
      </div>
    </div>
  )
}
