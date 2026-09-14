"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Gavel, Phone, Radio, ShieldAlert, TrendingDown, TrendingUp, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/shared/modal"
import type { SupplierBidItem } from "@/lib/steel-data"

type QuoteRecord = { time: string; supplier: string; price: number; mine: boolean }

// 把 "¥2,500/吨" 解析为数值 2500
function parsePrice(text: string): number {
  const n = Number(text.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function fmt(n: number): string {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

export function BiddingHall({ item, onBack }: { item: SupplierBidItem; onBack: () => void }) {
  const isDrop = item.bidMode.includes("减价")
  const base = parsePrice(item.basePrice) || 2500
  const step = 50 // 竞价阶梯（元）
  const extendCycle = 60 // 延长周期（秒）

  // 竞价进行中：从当前时间起倒计时 15 分 50 秒（演示）；待开标则显示未开始
  const running = item.result === "竞价中"
  const ended = item.result === "已中标" || item.result === "未中标"
  const [remain, setRemain] = useState(running ? 15 * 60 + 50 : ended ? 0 : 45 * 60)
  const [best, setBest] = useState(() => {
    const mine = parsePrice(item.myQuote)
    return mine || (isDrop ? base - step : base)
  })
  const [multiplier, setMultiplier] = useState(1)
  const [confirm, setConfirm] = useState(false)
  const [latency, setLatency] = useState(122)
  const [history, setHistory] = useState<QuoteRecord[]>(() => {
    const mine = parsePrice(item.myQuote) || base
    return [
      { time: "09:12:05", supplier: "我方", price: mine, mine: true },
      { time: "09:10:41", supplier: "供应商 C", price: isDrop ? mine + step : mine - step, mine: false },
      { time: "09:08:12", supplier: "供应商 A", price: isDrop ? mine + step * 2 : mine - step * 2, mine: false },
      { time: "09:00:00", supplier: "系统", price: base, mine: false },
    ]
  })
  const [messages, setMessages] = useState<string[]>([
    running ? "竞价已开始，请及时报价" : ended ? "本轮竞价已结束" : "竞价尚未开始，请留意开始时间",
  ])
  const feedRef = useRef<HTMLDivElement>(null)

  // 倒计时
  useEffect(() => {
    if (!running || remain <= 0) return
    const t = setInterval(() => setRemain((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [running, remain])

  // 网络延时轻微波动（演示）
  useEffect(() => {
    const t = setInterval(() => setLatency(90 + Math.floor(Math.random() * 80)), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0 })
  }, [messages])

  const hh = Math.floor(remain / 3600)
  const mm = Math.floor((remain % 3600) / 60)
  const ss = remain % 60

  const nextPrice = useMemo(() => (isDrop ? best - step * multiplier : best + step * multiplier), [best, isDrop, multiplier, step])

  // 我方最新报价与全场对比：减价竞价看是否最低，加价竞价看排名
  const myLatest = useMemo(() => {
    const mine = history.filter((h) => h.mine)
    return mine.length ? mine[0].price : parsePrice(item.myQuote)
  }, [history, item.myQuote])

  const others = useMemo(() => history.filter((h) => !h.mine && h.supplier !== "系统").map((h) => h.price), [history])
  const myIsLowest = others.length ? myLatest <= Math.min(...others) : true
  // 加价竞价：报价越高排名越靠前
  const myRank = useMemo(() => {
    const higher = others.filter((p) => p > myLatest).length
    return higher + 1
  }, [others, myLatest])

  const statusLabel = running ? "进行中" : ended ? "已结束" : "未开始"
  const statusTone = running ? "text-emerald-400" : ended ? "text-zinc-400" : "text-amber-400"

  function submitQuote() {
    setConfirm(false)
    const now = new Date()
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    setBest(nextPrice)
    setHistory((h) => [{ time, supplier: "我方", price: nextPrice, mine: true }, ...h])
    setMessages((m) => [`您已报价 ¥${fmt(nextPrice)} 元，当前排名第 1`, ...m])
    // 触发延时竞价
    if (running && remain < extendCycle) setRemain(extendCycle)
  }

  const myQuoteCount = history.filter((h) => h.mine).length

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft />
        返回竞价详情
      </Button>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-lg">
        {/* 顶部栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950 px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight">盘古循环资源竞价系统</h2>
            <span className="hidden text-sm font-medium text-amber-400 sm:inline">
              同一标的竞价时请勿多开页面，以防出现浏览器异常！
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Radio className="size-3.5 text-emerald-400" />
              {item.id.slice(-4)}
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="size-3.5" />
              网络延时 <span className="font-semibold text-emerald-400">{latency} ms</span>
            </span>
            <span>版本号 v2.6</span>
          </div>
        </div>
        <div className="border-b border-zinc-800 bg-zinc-950/60 px-5 py-2 text-sm text-zinc-300">
          <span className="font-medium text-zinc-100">{item.title}</span>
          <span className="mx-2 text-zinc-600">·</span>
          {item.buyer}
          <span className="mx-2 text-zinc-600">·</span>
          {item.category}
        </div>

        {/* 三栏主体 */}
        <div className="grid gap-4 p-4 lg:grid-cols-[300px_1fr_320px]">
          {/* 左栏：标的信息 + 竞价历史 */}
          <div className="space-y-4">
            <HallCard title="标的信息">
              <dl className="space-y-2.5 text-sm">
                <HallRow label="开始时间" value={item.bidStart} accent />
                <HallRow label="结束时间" value={item.bidEnd} accent />
                <HallRow label="起始价格" value={`${fmt(base)} 元/吨`} accent />
                <HallRow label="采购数量" value={item.qty} />
                <HallRow label="竞价方式" value={item.bidMode} accent />
                <HallRow label="竞价阶梯" value={`${fmt(step)} 元`} accent />
                <HallRow label="延长周期" value={`${extendCycle} 秒`} accent />
                <HallRow label="保证金" value={item.deposit} />
                <HallRow label="是否有优先权" value="否" accent />
              </dl>
            </HallCard>

            <HallCard title="竞价历史">
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={
                      "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs " +
                      (h.mine ? "bg-primary/15 text-primary-foreground" : "bg-zinc-800/60")
                    }
                  >
                    <div className="flex flex-col">
                      <span className={h.mine ? "font-semibold text-sky-300" : "text-zinc-300"}>{h.supplier}</span>
                      <span className="text-[11px] text-zinc-500">{h.time}</span>
                    </div>
                    <span className={"font-mono text-sm font-semibold " + (h.mine ? "text-sky-300" : "text-zinc-200")}>
                      ¥{fmt(h.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t border-zinc-800 pt-2 text-right text-xs text-zinc-400">
                报价总次数 {myQuoteCount} 次 &gt;
              </div>
            </HallCard>
          </div>

          {/* 中栏：系统消息 + 竞价看板 + 紧急求助 */}
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 py-4 text-xs font-medium text-zinc-400">
                <Radio className="mb-1 size-4" />
                <span>系统</span>
                <span>消息</span>
              </div>
              <div
                ref={feedRef}
                className="max-h-24 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300"
              >
                {messages.map((m, i) => (
                  <p key={i} className="leading-relaxed">
                    <span className="text-zinc-600">[系统]</span> {m}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-zinc-800 bg-zinc-950 p-8">
              <div className="text-center">
                <p className="text-sm text-zinc-400">距竞价结束</p>
                <p className="mt-1 font-mono text-3xl font-bold text-amber-400">
                  {running ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : ended ? "00:00:00" : "--:--:--"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400">当前最优报价</p>
                <p className="mt-1 flex items-center justify-center gap-2 font-mono text-4xl font-bold text-emerald-400">
                  {isDrop ? <TrendingDown className="size-7" /> : <TrendingUp className="size-7" />}¥{fmt(best)}
                </p>
                {isDrop ? (
                  /* 减价竞价：提醒当前是最高 / 最低报价 */
                  <div className="mt-2 flex justify-center text-xs font-medium">
                    {myIsLowest ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400">
                        <TrendingDown className="size-3.5" />
                        您当前为最低报价（领先）
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-red-400">
                        <TrendingUp className="size-3.5" />
                        您非最低报价，需继续降价
                      </span>
                    )}
                  </div>
                ) : (
                  /* 加价竞价：体现排名 */
                  <p className="mt-1 text-xs text-zinc-500">
                    当前排名{" "}
                    <span className={"font-semibold " + (myRank === 1 ? "text-emerald-400" : "text-sky-300")}>
                      第 {myRank} 名
                    </span>{" "}
                    / 共 {item.quotes} 家
                  </p>
                )}
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-zinc-700 py-4 text-lg font-bold text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800">
              <Phone className="size-5" />
              紧急求助电话
            </button>
          </div>

          {/* 右栏：状态 + 倒计时 + 报价 */}
          <div className="space-y-4">
            <HallCard title={<span className="flex items-center gap-2"><ShieldAlert className="size-4" />当前状态</span>}>
              <div className="text-center">
                <p className={"text-sm font-semibold " + statusTone}>{statusLabel}</p>
                <div className="mt-3 rounded-lg border-2 border-red-500/70 bg-zinc-950 py-4">
                  <p className="font-mono text-3xl font-bold text-zinc-100">
                    {running ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : ended ? "00:00:00" : "15:50:58"}
                  </p>
                </div>
                <p className="mt-2 text-xs text-zinc-500">竞价时间以服务器时间为准</p>
              </div>
            </HallCard>

            <HallCard title="我的报价 (元/吨)">
              <div
                className={
                  "flex h-16 items-center justify-center rounded-md text-2xl font-bold " +
                  (running ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")
                }
              >
                {running ? `¥${fmt(nextPrice)}` : "—"}
              </div>

              <div className="mt-4">
                <p className="mb-1.5 text-xs text-zinc-400">竞价阶梯倍数</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 5].map((m) => (
                    <button
                      key={m}
                      disabled={!running}
                      onClick={() => setMultiplier(m)}
                      className={
                        "rounded-md border py-1.5 text-sm font-medium transition-colors disabled:opacity-40 " +
                        (multiplier === m
                          ? "border-sky-500 bg-sky-500/20 text-sky-300"
                          : "border-zinc-700 text-zinc-300 hover:border-zinc-500")
                      }
                    >
                      x{m}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  {isDrop ? "每次下调" : "每次上调"} {fmt(step * multiplier)} 元
                </p>
              </div>

              <button
                disabled={!running}
                onClick={() => setConfirm(true)}
                className={
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-lg font-bold transition-colors " +
                  (running
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "cursor-not-allowed bg-zinc-700 text-zinc-400")
                }
              >
                {running ? (
                  <>
                    <Gavel className="size-5" />
                    立即报价
                  </>
                ) : ended ? (
                  "已结束"
                ) : (
                  "未开始"
                )}
              </button>
            </HallCard>
          </div>
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="确认报价"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              取消
            </Button>
            <Button onClick={submitQuote}>确认报价</Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          本次{isDrop ? "减价" : "加价"} {multiplier} 个阶梯（{fmt(step * multiplier)} 元），报价为{" "}
          <span className="font-semibold text-primary">¥{fmt(nextPrice)} 元/吨</span>。
        </p>
        <p className="mt-2 text-xs text-muted-foreground">报价一经提交不可撤回，请确认无误。</p>
      </Modal>
    </div>
  )
}

function HallCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-100">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function HallRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-400">{label}</dt>
      <dd className={accent ? "font-medium text-amber-400" : "text-zinc-200"}>{value}</dd>
    </div>
  )
}
