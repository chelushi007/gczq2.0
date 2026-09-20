"use client"

import { useState } from "react"
import { SlidersHorizontal, ToggleRight, Users, Tags, Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill } from "@/components/shared/status-pill"
import { DataTable, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import { SectionCard } from "./ops-ui"
import { cn } from "@/lib/utils"
import {
  opsTradeParams,
  opsRoles,
  opsCategories,
  opsToggles,
  type OpsParam,
  type OpsRole,
  type OpsToggle,
} from "@/lib/steel-data"

export function OpsConfig() {
  const [params, setParams] = useState<OpsParam[]>(opsTradeParams)
  const [toggles, setToggles] = useState<OpsToggle[]>(opsToggles)
  const [editing, setEditing] = useState<OpsParam | null>(null)
  const [draft, setDraft] = useState("")

  const openEdit = (p: OpsParam) => {
    setEditing(p)
    setDraft(p.value)
  }
  const saveEdit = () => {
    if (editing) setParams((prev) => prev.map((p) => (p.key === editing.key ? { ...p, value: draft } : p)))
    setEditing(null)
  }
  const flip = (key: string) => setToggles((prev) => prev.map((t) => (t.key === key ? { ...t, on: !t.on } : t)))

  const roleColumns: Column<OpsRole>[] = [
    { key: "name", header: "角色名称", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: "members", header: "成员数", className: "tabular-nums", render: (r) => `${r.members} 人` },
    { key: "scope", header: "权限范围", className: "text-muted-foreground" },
    {
      key: "status",
      header: "状态",
      render: (r) => <StatusPill tone={r.status === "启用" ? "green" : "gray"}>{r.status}</StatusPill>,
    },
    {
      key: "op",
      header: "操作",
      render: () => (
        <Button variant="ghost" size="sm">
          <Pencil className="size-3.5" />
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="系统配置" desc="平台运行参数、功能开关、角色权限与业务字典的统一维护" />

      {/* 交易参数 */}
      <SectionCard
        title="交易参数"
        desc="影响全平台计费与交易规则的核心参数"
        icon={<SlidersHorizontal className="size-4 text-primary" />}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {params.map((p) => (
            <div
              key={p.key}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{p.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                <p className="mt-2 text-lg font-semibold text-primary">{p.value}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                <Pencil className="size-3.5" />
                编辑
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 功能开关 */}
      <SectionCard
        title="功能开关"
        desc="按需启用或停用平台功能模块"
        icon={<ToggleRight className="size-4 text-primary" />}
      >
        <ul className="divide-y divide-border">
          {toggles.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <Switch on={t.on} onToggle={() => flip(t.key)} />
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 角色权限 */}
      <SectionCard
        title="角色与权限"
        desc="管理运营团队角色及模块访问范围"
        icon={<Users className="size-4 text-primary" />}
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            新建角色
          </Button>
        }
      >
        <DataTable columns={roleColumns} rows={opsRoles} rowKey={(r) => r.id} />
      </SectionCard>

      {/* 品类字典 */}
      <SectionCard
        title="品类字典"
        desc="平台交易品类及规格定义"
        icon={<Tags className="size-4 text-primary" />}
        action={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="size-4" />
            新增品类
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {opsCategories.map((c) => (
            <div key={c.code} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                    {c.code}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.spec}</p>
              </div>
              <StatusPill tone={c.status === "启用" ? "green" : "gray"}>{c.status}</StatusPill>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 编辑参数弹窗 */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="编辑交易参数"
        description={editing?.label}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              取消
            </Button>
            <Button onClick={saveEdit}>保存</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{editing.desc}</p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">参数值</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
