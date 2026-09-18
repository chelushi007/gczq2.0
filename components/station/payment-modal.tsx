"use client"

import { useState, useEffect } from "react"
import { Landmark, Smartphone, CreditCard, Upload, Copy, Check, Zap, CircleCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/shared/modal"

// 三类缴费：报名费、保证金、交易服务费，均支持线上/线下支付
export type PayKind = "fee" | "deposit" | "service"
export type PayTarget = { kind: PayKind; label: string; amount: string } | null

const onlineChannels: { key: string; label: string; desc: string; icon: typeof Landmark }[] = [
  { key: "netbank", label: "对公网银", desc: "企业网银快捷支付", icon: Landmark },
  { key: "wechat", label: "微信支付", desc: "扫码支付", icon: Smartphone },
  { key: "alipay", label: "支付宝", desc: "扫码支付", icon: Smartphone },
  { key: "unionpay", label: "银联快捷", desc: "储蓄卡 / 信用卡", icon: CreditCard },
]

export function PaymentModal({
  target,
  onClose,
  onPaid,
}: {
  target: PayTarget
  onClose: () => void
  onPaid: (kind: PayKind, method: "online" | "offline") => void
}) {
  const [method, setMethod] = useState<"online" | "offline">("online")
  const [channel, setChannel] = useState("netbank")
  const [voucher, setVoucher] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [done, setDone] = useState<"online" | "offline" | null>(null)

  // 每次打开新的缴费项时重置表单
  useEffect(() => {
    if (target) {
      setMethod("online")
      setChannel("netbank")
      setVoucher("")
      setDone(null)
    }
  }, [target])

  const submit = () => {
    if (!target) return
    onPaid(target.kind, method)
    setDone(method)
  }

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
        done ? (
          <div className="flex justify-end">
            <Button onClick={onClose}>完成</Button>
          </div>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            {method === "online" ? (
              <Button onClick={submit}>
                <Zap />
                立即支付 {target?.amount}
              </Button>
            ) : (
              <Button disabled={!voucher} onClick={submit}>
                <Upload />
                提交转账凭证
              </Button>
            )}
          </>
        )
      }
    >
      {target && done && (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <span
            className={
              "flex size-14 items-center justify-center rounded-full " +
              (done === "online" ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary")
            }
          >
            {done === "online" ? <CircleCheck className="size-7" /> : <Clock className="size-7" />}
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              {done === "online" ? "支付成功" : "转账凭证已提交"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {done === "online"
                ? `${target.label} ${target.amount} 已支付成功，缴费状态已更新为「已缴」。`
                : `${target.label} ${target.amount} 的转账凭证已提交，平台财务将在 1 个工作日内核验，当前状态「待核验」。`}
            </p>
          </div>
          <div className="w-full rounded-lg border border-border bg-muted/30 p-3 text-left text-xs text-muted-foreground">
            <div className="flex justify-between py-0.5">
              <span>缴费项目</span>
              <span className="font-medium text-foreground">{target.label}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>缴费金额</span>
              <span className="font-medium text-foreground">{target.amount}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>支付方式</span>
              <span className="font-medium text-foreground">{done === "online" ? "线上支付" : "线下支付"}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>交易时间</span>
              <span className="font-medium tabular-nums text-foreground">{new Date().toLocaleString("zh-CN")}</span>
            </div>
          </div>
        </div>
      )}
      {target && !done && (
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
