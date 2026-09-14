"use client"

import { useState } from "react"
import { CheckCircle2, X, Send, Mail, FileText, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import {
  millInviteList,
  coopApplicationList,
  type MillInvite,
  type CoopApplication,
} from "@/lib/steel-data"

const inviteTone: Record<MillInvite["status"], "amber" | "green" | "gray"> = {
  待回复: "amber",
  已接受: "green",
  已拒绝: "gray",
}
const appTone: Record<CoopApplication["status"], "amber" | "green" | "red"> = {
  审核中: "amber",
  已通过: "green",
  已驳回: "red",
}

export function SupplierBase() {
  const [invites, setInvites] = useState<MillInvite[]>(millInviteList)
  const [apps, setApps] = useState<CoopApplication[]>(coopApplicationList)
  const [reply, setReply] = useState<{ item: MillInvite; action: "accept" | "reject" } | null>(null)
  const [apply, setApply] = useState(false)

  function handleReply(id: string, action: "accept" | "reject") {
    setInvites((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: action === "accept" ? "已接受" : "已拒绝" } : v)),
    )
    setReply(null)
  }

  function handleApply(millName: string, category: string) {
    setApps((prev) => [
      {
        id: `AP${String(prev.length + 100)}`,
        millName,
        category,
        appliedAt: new Date().toISOString().slice(0, 10),
        status: "审核中",
        note: "申请已提交，等待钢厂审核资质材料",
      },
      ...prev,
    ])
    setApply(false)
  }

  const pending = invites.filter((v) => v.status === "待回复").length
  const cooperating = apps.filter((a) => a.status === "已通过").length

  const inviteCols: Column<MillInvite>[] = [
    { key: "millName", header: "邀约钢厂", render: (r) => <span className="font-medium text-foreground">{r.millName}</span> },
    { key: "region", header: "所在地区" },
    { key: "category", header: "意向类别" },
    { key: "settlement", header: "结算方式", className: "text-muted-foreground" },
    { key: "invitedAt", header: "邀请时间", className: "tabular-nums text-muted-foreground" },
    { key: "status", header: "状态", render: (r) => <StatusPill tone={inviteTone[r.status]}>{r.status}</StatusPill> },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        r.status === "待回复" ? (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => setReply({ item: r, action: "accept" })}>
              接受
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setReply({ item: r, action: "reject" })}>
              拒绝
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm">
            查看
          </Button>
        ),
    },
  ]

  const appCols: Column<CoopApplication>[] = [
    { key: "millName", header: "申请合作钢厂", render: (r) => <span className="font-medium text-foreground">{r.millName}</span> },
    { key: "category", header: "供货类别" },
    { key: "appliedAt", header: "申请时间", className: "tabular-nums text-muted-foreground" },
    { key: "status", header: "审核状态", render: (r) => <StatusPill tone={appTone[r.status]}>{r.status}</StatusPill> },
    { key: "note", header: "说明", className: "text-muted-foreground" },
  ]

  const stats = [
    { label: "待回复邀约", value: pending },
    { label: "累计邀约", value: invites.length },
    { label: "已合作钢厂", value: cooperating },
    { label: "进行中申请", value: apps.filter((a) => a.status === "审核中").length },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-5">
        <PageHeader
          title="基地管理"
          desc="接受钢厂合作邀约，或主动申请成为钢厂的合作回收基地"
          action={
            <Button onClick={() => setApply(true)}>
              <Send />
              申请成为合作基地
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">钢厂邀约</h2>
            {pending > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {pending} 条待回复
              </span>
            )}
          </div>
          <DataTable columns={inviteCols} rows={invites} rowKey={(r) => r.id} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">我的合作申请</h2>
          </div>
          <DataTable columns={appCols} rows={apps} rowKey={(r) => r.id} />
        </section>
      </div>

      {reply && (
        <ReplyModal
          item={reply.item}
          action={reply.action}
          onClose={() => setReply(null)}
          onConfirm={() => handleReply(reply.item.id, reply.action)}
        />
      )}
      {apply && <ApplyModal onClose={() => setApply(false)} onSubmit={handleApply} />}
    </div>
  )
}

function ReplyModal({
  item,
  action,
  onClose,
  onConfirm,
}: {
  item: MillInvite
  action: "accept" | "reject"
  onClose: () => void
  onConfirm: () => void
}) {
  const accept = action === "accept"
  return (
    <Modal open onClose={onClose} size="md" title={accept ? "接受合作邀约" : "拒绝合作邀约"}>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.millName}</p>
              <p className="text-xs text-muted-foreground">
                {item.region} · {item.category} · {item.settlement}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">「{item.message}」</p>
        </div>
        <p className="text-sm text-foreground">
          {accept
            ? "接受后将与该钢厂建立合作关系，进入其待审核入驻流程，审核通过即成为其合作基地。"
            : "确认拒绝该钢厂的合作邀约？拒绝后可在后续通过「申请成为合作基地」重新发起。"}
        </p>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            <X />
            取消
          </Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 />
            {accept ? "确认接受" : "确认拒绝"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ApplyModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (millName: string, category: string) => void
}) {
  const [millName, setMillName] = useState("")
  const [category, setCategory] = useState("重废")
  const [note, setNote] = useState("我方为区域大型回收基地，具备稳定货源与合规资质，申请建立协议合作。")

  return (
    <Modal open onClose={onClose} size="lg" title="申请成为合作基地">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="size-4.5" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            主动向目标钢厂申请合作。提交后钢厂将在其「基地管理」中审核贵基地资质，通过后即建立合作关系。
          </p>
        </div>

        <Field label="申请合作钢厂">
          <input
            value={millName}
            onChange={(e) => setMillName(e.target.value)}
            placeholder="请输入或搜索钢厂名称"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Field>

        <Field label="供货类别">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {["重废", "统废", "生铁", "重废/统废"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="申请说明">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Field>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            <X />
            取消
          </Button>
          <Button onClick={() => onSubmit(millName, category)} disabled={!millName.trim()}>
            <Send />
            提交申请
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
