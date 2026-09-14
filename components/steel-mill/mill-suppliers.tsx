"use client"

import { useState } from "react"
import { Send, CheckCircle2, Ban, X, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import { coopBaseList, type CoopBase } from "@/lib/steel-data"

const tabs = ["全部", "合作中", "待审核", "已邀请", "已停用"]

export function MillSuppliers() {
  const [tab, setTab] = useState("全部")
  const [invite, setInvite] = useState(false)
  const rows = tab === "全部" ? coopBaseList : coopBaseList.filter((b) => b.status === tab)

  const columns: Column<CoopBase>[] = [
    { key: "name", header: "回收基地名称", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    {
      key: "cooperation",
      header: "合作等级",
      render: (r) =>
        r.cooperation === "协议基地" ? (
          <StatusPill tone="violet">协议基地</StatusPill>
        ) : (
          <span className="text-muted-foreground">普通基地</span>
        ),
    },
    { key: "scale", header: "基地规模", className: "text-muted-foreground" },
    { key: "contact", header: "联系人", className: "text-muted-foreground" },
    { key: "region", header: "所在地区" },
    { key: "supplyCategory", header: "供货类别" },
    { key: "totalQty", header: "累计供货", render: (r) => <span className="tabular-nums">{r.totalQty}</span> },
    { key: "joinedAt", header: "合作起始", className: "tabular-nums text-muted-foreground" },
    { key: "status", header: "状态", render: (r) => <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill> },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        r.status === "待审核" ? (
          <Button size="sm">
            <CheckCircle2 />
            审核
          </Button>
        ) : r.status === "已邀请" ? (
          <Button variant="ghost" size="sm">
            撤回邀请
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            {r.status === "已停用" ? <Ban /> : null}
            详情
          </Button>
        ),
    },
  ]

  const stats = [
    { label: "合作基地", value: coopBaseList.filter((b) => b.status === "合作中").length },
    { label: "待审核申请", value: coopBaseList.filter((b) => b.status === "待审核").length },
    { label: "协议基地", value: coopBaseList.filter((b) => b.cooperation === "协议基地").length },
    { label: "已邀请待回复", value: coopBaseList.filter((b) => b.status === "已邀请").length },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="基地管理"
        desc="管理合作回收基地，审核入驻申请，邀请优质回收基地建立协议合作"
        action={
          <Button onClick={() => setInvite(true)}>
            <Send />
            邀请回收基地
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

      <FilterBar>
        {tabs.map((t) => (
          <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </FilterChip>
        ))}
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />

      {invite && <InviteBaseModal onClose={() => setInvite(false)} />}
    </div>
  )
}

function InviteBaseModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState("")
  const [region, setRegion] = useState("")
  const [category, setCategory] = useState("重废")
  const [level, setLevel] = useState("协议基地")
  const [message, setMessage] = useState("诚邀贵基地成为我方长期协议合作回收基地，享优先派单与协议定价。")

  return (
    <Modal open onClose={onClose} size="lg" title="邀请回收基地">
      {sent ? (
        <div className="flex flex-col items-center px-2 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">邀请已发送</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            已向「{name || "该回收基地"}」发送合作邀约，对方将在其「基地管理」中收到邀请并可选择接受或拒绝。
          </p>
          <Button className="mt-6" onClick={onClose}>
            完成
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-4.5" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              向目标回收基地发送定向合作邀约。对方接受后将进入待审核入驻流程，审核通过即成为合作基地。
            </p>
          </div>

          <Field label="回收基地名称">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入或搜索回收基地名称"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="所在地区">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="如 江苏·苏州"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="意向供货类别">
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
          </div>

          <Field label="拟合作等级">
            <div className="flex gap-2">
              {["协议基地", "普通基地"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={
                    "flex-1 rounded-md border px-3 py-2 text-sm transition-colors " +
                    (level === l
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50")
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </Field>

          <Field label="邀请说明">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={onClose}>
              <X />
              取消
            </Button>
            <Button onClick={() => setSent(true)} disabled={!name.trim()}>
              <Send />
              发送邀请
            </Button>
          </div>
        </div>
      )}
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
