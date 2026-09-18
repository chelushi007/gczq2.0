"use client"

import { useState } from "react"
import {
  ArrowLeft,
  FileText,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Gavel,
  Trophy,
  ChevronDown,
  Clock,
  CircleCheck,
  CircleDashed,
  TrendingDown,
  Landmark,
  Smartphone,
  CreditCard,
  Upload,
  Copy,
  Check,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/shared/status-pill"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import { BiddingHall } from "@/components/station/bidding-hall"
import type { SupplierBidItem } from "@/lib/steel-data"

  // 供应商参与竞价的流程：报名参与 → 缴费缴金 → 在线竞价 → 竞价结果
type StageKey = "join" | "pay" | "bid" | "win"

// 三类缴费：报名费、保证金、交易服务费，均支持线上/线下支付
type PayKind = "fee" | "deposit" | "service"
type PayTarget = { kind: PayKind; label: string; amount: string } | null

const stages: { key: StageKey; label: string; icon: typeof FileText }[] = [
  { key: "join", label: "报名参与", icon: ClipboardCheck },
  { key: "pay", label: "缴费缴金", icon: Wallet },
  { key: "bid", label: "在线竞价", icon: Gavel },
  { key: "win", label: "竞价结果", icon: Trophy },
]

const stageStatusMeta: Record<"done" | "active" | "todo", { label: string; cls: string }> = {
  done: { label: "已完成", cls: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  active: { label: "进行中", cls: "bg-primary/10 text-primary ring-primary/30" },
  todo: { label: "待处理", cls: "bg-muted text-muted-foreground ring-border" },
}

function stageState(item: SupplierBidItem, key: StageKey): "done" | "active" | "todo" {
  const signedUp = item.signupStatus === "报名通过"
  const paid = item.feeStatus === "已缴" && item.depositStatus !== "未缴"
  const bidding = item.result === "竞价中" || item.result === "待开标"
  const settled = item.result === "已中标" || item.result === "未中标"
  if (key === "join") return signedUp ? "done" : item.signupStatus === "未报名" ? "active" : "active"
  if (key === "pay") return paid ? "done" : signedUp ? "active" : "todo"
  if (key === "bid") return settled ? "done" : bidding && paid ? "active" : "todo"
  if (key === "win") return settled ? (item.result === "已中标" ? "done" : "done") : "todo"
  return "todo"
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={strong ? "text-sm font-semibold text-foreground" : "text-sm text-foreground"}>{value}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function SupplierBidDetail({ item, onBack }: { item: SupplierBidItem; onBack: () => void }) {
  const [open, setOpen] = useState<StageKey | null>(() => {
    const s = stages.find((st) => stageState(item, st.key) === "active")
    return s?.key ?? "join"
  })
  const [quote, setQuote] = useState("")
  const [confirmQuote, setConfirmQuote] = useState(false)
  const [inHall, setInHall] = useState(false)
  const [payTarget, setPayTarget] = useState<PayTarget>(null)

  if (inHall) {
    return <BiddingHall item={item} onBack={() => setInHall(false)} />
  }

  return (
    <div className="space-y-5">
      {/* 顶部标题 + 返回 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft />
            返回列表
          </Button>
          <div>
            <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
            <p className="text-xs text-muted-foreground">
              竞价单号 {item.id} · 采购单位 {item.buyer}
            </p>
          </div>
        </div>
        <StatusPill tone={item.result === "已中标" ? "green" : item.result === "竞价中" ? "primary" : "gray"}>
          {item.result}
        </StatusPill>
      </div>

      {/* 流程展示 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center">
          {stages.map((st, i) => {
            const state = stageState(item, st.key)
            const Icon = st.icon
            return (
              <div key={st.key} className="flex flex-1 items-center last:flex-none">
                <button
                  onClick={() => setOpen(open === st.key ? null : st.key)}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={
                      "flex size-11 items-center justify-center rounded-full border-2 transition-colors " +
                      (state === "done"
                        ? "border-primary bg-primary text-primary-foreground"
                        : state === "active"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground")
                    }
                  >
                    {state === "done" ? <CircleCheck className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span
                    className={
                      "flex items-center gap-1 text-xs font-medium " +
                      (state === "todo" ? "text-muted-foreground" : "text-foreground")
                    }
                  >
                    {st.label}
                    <ChevronDown className={"size-3 transition-transform " + (open === st.key ? "rotate-180" : "")} />
                  </span>
                  <span
                    className={
                      "rounded px-1.5 py-px text-[10px] font-medium leading-tight ring-1 " + stageStatusMeta[state].cls
                    }
                  >
                    {stageStatusMeta[state].label}
                  </span>
                </button>
                {i < stages.length - 1 && (
                  <div className={"mx-2 h-0.5 flex-1 " + (state === "done" ? "bg-primary" : "bg-border")} />
                )}
              </div>
            )
          })}
        </div>

        {/* 各节点展开内容 */}
        {open === "join" && (
          <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="采购单位" value={item.buyer} />
            <Field label="废钢类别" value={item.category} />
            <Field label="交货区域" value={item.region} />
            <Field label="采购数量" value={item.qty} />
            <Field label="起拍价" value={item.basePrice} />
            <Field label="报名截止" value={item.signupEnd} />
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs text-muted-foreground">报名状态</span>
              <StatusPill tone={item.signupStatus === "报名通过" ? "green" : item.signupStatus === "报名驳回" ? "red" : "amber"}>
                {item.signupStatus}
              </StatusPill>
              {item.signupStatus === "未报名" && <Button size="sm">立即报名</Button>}
              {item.signupStatus === "报名待审" && (
                <span className="text-xs text-muted-foreground">报名材料已提交，等待采购方审核</span>
              )}
              <Button variant="outline" size="sm">
                <FileText />
                查看采购公告
              </Button>
            </div>
          </div>
        )}

        {open === "pay" && (
          <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">报名费</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-foreground">{item.signupFee}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill tone={item.feeStatus === "已缴" ? "green" : "amber"}>{item.feeStatus}</StatusPill>
                {item.feeStatus === "未缴" ? (
                  <Button size="sm" onClick={() => setPayTarget({ kind: "fee", label: "报名费", amount: item.signupFee })}>
                    去缴纳
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    查看凭证
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">投标保证金</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-foreground">{item.deposit}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill tone={item.depositStatus === "已缴" ? "green" : item.depositStatus === "已退还" ? "gray" : "amber"}>
                  {item.depositStatus}
                </StatusPill>
                {item.depositStatus === "未缴" ? (
                  <Button
                    size="sm"
                    onClick={() => setPayTarget({ kind: "deposit", label: "投标保证金", amount: item.deposit })}
                  >
                    去缴纳
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    查看凭证
                  </Button>
                )}
              </div>
            </div>
            <p className="sm:col-span-2 text-xs text-muted-foreground">
              提示：需在报名截止前完成报名费与保证金缴纳，方可参与竞价；未中标保证金将在竞价结束后按规则退还。
            </p>
          </div>
        )}

        {open === "bid" && (
          <div className="mt-5 border-t border-border pt-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="竞价方式" value={item.bidMode} strong />
              <Field label="竞价时间" value={`${item.bidStart} ~ ${item.bidEnd}`} />
              <Field label="我的当前排名" value={item.myRank} strong />
              <Field label="我的最新报价" value={item.myQuote} strong />
            </div>
            {item.result === "竞价中" ? (
              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <TrendingDown className="size-4" />
                    {item.bidMode}进行中，报价越低越有利
                  </div>
                  <Button onClick={() => setInHall(true)}>
                    <Gavel />
                    进入竞价大厅
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="flex-1 min-w-[200px] space-y-1.5">
                    <span className="text-xs text-muted-foreground">快捷报价 (元/吨)</span>
                    <input
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="请输入报价，需低于当前报价"
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <Button variant="outline" disabled={!quote} onClick={() => setConfirmQuote(true)}>
                    <Gavel />
                    提交报价
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {item.result === "待开标" ? "竞价尚未开始，请留意竞价开始时间" : "本轮竞价已结束"}
                </span>
                {item.result === "待开标" && (
                  <Button variant="outline" onClick={() => setInHall(true)}>
                    <Gavel />
                    进入竞价大厅
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {open === "win" && (
          <div className="mt-5 border-t border-border pt-5">
            {item.result === "已中标" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <Trophy className="size-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">恭喜中标</p>
                    <p className="text-xs text-emerald-600/80">
                      中标价 {item.myQuote} · 成交金额约 ¥1,285,200 · 请及时缴纳服务费并签署合同
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">交易服务费</p>
                    <p className="mt-1.5 text-lg font-semibold text-foreground">¥3,200</p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => setPayTarget({ kind: "service", label: "交易服务费", amount: "¥3,200" })}
                    >
                      去缴纳
                    </Button>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">中标合同</p>
                    <p className="mt-1.5 text-lg font-semibold text-foreground">待签署</p>
                    <Button variant="outline" size="sm" className="mt-3">在线签署</Button>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">中标结果公告</p>
                    <p className="mt-1.5 text-lg font-semibold text-foreground">已发布</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <FileText />
                      查看
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <CircleDashed className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {item.result === "未中标"
                    ? "很遗憾，本次竞价未中标，保证金将按规则退还"
                    : "竞价结果尚未公布，请留意中标结果公告"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={confirmQuote}
        onClose={() => setConfirmQuote(false)}
        title="确认提交报价"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmQuote(false)}>
              取消
            </Button>
            <Button onClick={() => setConfirmQuote(false)}>确认提交</Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          您本次报价为 <span className="font-semibold text-primary">¥{quote || "—"}/吨</span>
          ，减价竞价一经提交不可撤回，是否确认？
        </p>
      </Modal>

      <PaymentModal target={payTarget} onClose={() => setPayTarget(null)} />
    </div>
  )
}

const onlineChannels: { key: string; label: string; desc: string; icon: typeof Landmark }[] = [
  { key: "netbank", label: "对公网银", desc: "企业网银快捷支付", icon: Landmark },
  { key: "wechat", label: "微信支付", desc: "扫码支付", icon: Smartphone },
  { key: "alipay", label: "支付宝", desc: "扫码支付", icon: Smartphone },
  { key: "unionpay", label: "银联快捷", desc: "储蓄卡 / 信用卡", icon: CreditCard },
]

function PaymentModal({ target, onClose }: { target: PayTarget; onClose: () => void }) {
  const [method, setMethod] = useState<"online" | "offline">("online")
  const [channel, setChannel] = useState("netbank")
  const [voucher, setVoucher] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const bankInfo = [
    { k: "收款户名", v: "废钢智慧交易平台运营有限公司" },
    { k: "开户银行", v: "招商银行苏州分行营业部" },
    { k: "银行账号", v: "5129 6688 2233 4455" },
    { k: "备注 / 摘要", v: target ? `${target.label} · JJ竞价缴费` : "" },
  ]

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={`缴纳${target?.label ?? ""}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          {method === "online" ? (
            <Button onClick={onClose}>
              <Zap />
              立即支付 {target?.amount}
            </Button>
          ) : (
            <Button disabled={!voucher} onClick={onClose}>
              <Upload />
              提交转账凭证
            </Button>
          )}
        </>
      }
    >
      {target && (
        <div className="space-y-4">
          {/* 金额概要 */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div>
              <div className="text-xs text-muted-foreground">缴费项目</div>
              <div className="text-sm font-medium text-foreground">{target.label}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">应缴金额</div>
              <div className="text-xl font-semibold text-primary">{target.amount}</div>
            </div>
          </div>

          {/* 支付方式切换 */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "online" as const, title: "线上支付", desc: "实时到账，自动核验", icon: Zap },
                { key: "offline" as const, title: "线下支付", desc: "银行转账，上传凭证", icon: Landmark },
              ]
            ).map((m) => {
              const active = method === m.key
              const Icon = m.icon
              return (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors " +
                    (active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/40")
                  }
                >
                  <span
                    className={
                      "flex size-9 shrink-0 items-center justify-center rounded-md " +
                      (active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                    }
                  >
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">{m.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {method === "online" ? (
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">选择支付渠道</div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {onlineChannels.map((c) => {
                  const active = channel === c.key
                  const Icon = c.icon
                  return (
                    <button
                      key={c.key}
                      onClick={() => setChannel(c.key)}
                      className={
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors " +
                        (active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-muted/40")
                      }
                    >
                      <Icon className={"size-5 " + (active ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-medium text-foreground">{c.label}</span>
                      <span className="text-[10px] leading-tight text-muted-foreground">{c.desc}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
                线上支付成功后系统实时核验到账，对应缴费状态将自动更新为「已缴」，无需人工确认。
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">平台收款账户</div>
              <div className="rounded-lg border border-border">
                {bankInfo.map((b, i) => (
                  <div
                    key={b.k}
                    className={"flex items-center justify-between gap-3 px-4 py-2.5 " + (i > 0 ? "border-t border-border" : "")}
                  >
                    <span className="text-xs text-muted-foreground">{b.k}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium tabular-nums text-foreground">{b.v}</span>
                      <button
                        onClick={() => copy(b.v)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label={`复制${b.k}`}
                      >
                        {copied === b.v ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  上传转账凭证
                </span>
                <div
                  className={
                    "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm transition-colors " +
                    (voucher ? "border-primary/40 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/40")
                  }
                >
                  {voucher ? <Check className="size-4" /> : <Upload className="size-4" />}
                  {voucher || "点击上传银行回单 / 转账截图（PNG、JPG、PDF）"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setVoucher(e.target.files?.[0]?.name ?? "")}
                  />
                </div>
              </label>
              <div className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                <Landmark className="mt-0.5 size-4 shrink-0 text-primary" />
                请按上述账户完成转账并上传凭证，平台财务将在 1 个工作日内人工核验，核验通过后缴费状态更新为「已缴」。
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
