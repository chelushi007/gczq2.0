"use client"

import { useState } from "react"
import { Search, RotateCcw, Gavel, Tag, FileSignature, CircleCheck, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { Modal } from "@/components/shared/modal"
import { KpiCard } from "./ops-ui"
import { opsProjects, type OpsProject } from "@/lib/steel-data"

const typeTone: Record<OpsProject["type"], "blue" | "amber" | "violet"> = {
  竞价: "blue",
  固定价: "amber",
  协议: "violet",
}
const typeIcon: Record<OpsProject["type"], typeof Gavel> = {
  竞价: Gavel,
  固定价: Tag,
  协议: FileSignature,
}

const tabs = ["全部", "待审核", "报名中", "竞价中", "待开标", "已成交", "已流标"]
const typeOptions = ["全部", "竞价", "固定价", "协议"]
const roleOptions = ["全部", "钢厂", "回收基地"]

export function OpsProjects() {
  const [tab, setTab] = useState("全部")
  const [type, setType] = useState("全部")
  const [role, setRole] = useState("全部")
  const [keyword, setKeyword] = useState("")
  const [detail, setDetail] = useState<OpsProject | null>(null)
  const [audit, setAudit] = useState<OpsProject | null>(null)
  const [handled, setHandled] = useState<Record<string, "已通过" | "已驳回">>({})

  const rows = opsProjects.filter((p) => {
    const status = handled[p.id] === "已通过" ? "报名中" : handled[p.id] === "已驳回" ? "已流标" : p.status
    if (tab !== "全部" && status !== tab) return false
    if (type !== "全部" && p.type !== type) return false
    if (role !== "全部" && p.initiatorRole !== role) return false
    if (keyword.trim() && !p.id.includes(keyword.trim()) && !p.name.includes(keyword.trim())) return false
    return true
  })

  const reset = () => {
    setType("全部")
    setRole("全部")
    setKeyword("")
  }

  const stats = {
    total: opsProjects.length,
    pending: opsProjects.filter((p) => p.status === "待审核").length,
    running: opsProjects.filter((p) => ["报名中", "竞价中", "待开标"].includes(p.status)).length,
    done: opsProjects.filter((p) => p.status === "已成交").length,
  }

  const displayStatus = (p: OpsProject) =>
    handled[p.id] === "已通过" ? "报名中" : handled[p.id] === "已驳回" ? "已流标" : p.status

  const columns: Column<OpsProject>[] = [
    { key: "id", header: "项目编号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    {
      key: "name",
      header: "项目名称",
      render: (r) => {
        const Icon = typeIcon[r.type]
        return (
          <span className="flex items-center gap-2">
            <Icon className="size-3.5 text-muted-foreground" />
            <span className="max-w-[220px] truncate">{r.name}</span>
          </span>
        )
      },
    },
    { key: "type", header: "类型", render: (r) => <StatusPill tone={typeTone[r.type]}>{r.type}</StatusPill> },
    {
      key: "initiator",
      header: "发起方",
      render: (r) => (
        <span>
          <span className="text-foreground">{r.initiator}</span>
          <span className="ml-1 text-xs text-muted-foreground">({r.initiatorRole})</span>
        </span>
      ),
    },
    { key: "category", header: "品类" },
    { key: "qty", header: "预估量", className: "tabular-nums" },
    { key: "budget", header: "预算", className: "tabular-nums text-muted-foreground" },
    {
      key: "signups",
      header: "报名家数",
      className: "tabular-nums",
      render: (r) => <span className="tabular-nums">{r.signups} 家</span>,
    },
    {
      key: "status",
      header: "状态",
      render: (r) => <StatusPill tone={statusTone(displayStatus(r))}>{displayStatus(r)}</StatusPill>,
    },
    { key: "createdAt", header: "创建时间", className: "text-muted-foreground tabular-nums" },
    {
      key: "op",
      header: "操作",
      render: (r) =>
        r.status === "待审核" && !handled[r.id] ? (
          <Button size="sm" onClick={() => setAudit(r)}>
            审核
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setDetail(r)}>
            详情
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="项目管理" desc="统一管理全平台竞价 / 固定价 / 协议采购项目，支持发布审核、跟踪与下架" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="项目总数" value={String(stats.total)} unit="个" tone="primary" />
        <KpiCard label="待审核" value={String(stats.pending)} unit="个" tone="amber" />
        <KpiCard label="进行中" value={String(stats.running)} unit="个" tone="green" />
        <KpiCard label="已成交" value={String(stats.done)} unit="个" tone="violet" />
      </div>

      {/* 筛选 */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="项目类型">
            <Select value={type} onChange={setType} options={typeOptions} />
          </Field>
          <Field label="发起方类型">
            <Select value={role} onChange={setRole} options={roleOptions} />
          </Field>
          <Field label="项目编号 / 名称">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground focus-within:border-primary">
              <Search className="size-4 shrink-0" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入关键词搜索"
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="size-3.5" />
            重置筛选
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar>
          {tabs.map((t) => (
            <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </FilterChip>
          ))}
        </FilterBar>
        <span className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{rows.length}</span> 个项目
        </span>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} stickyLastColumn />

      {/* 详情弹窗 */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? detail.name : ""}
        description={detail ? `${detail.id} · ${detail.type}项目` : ""}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setDetail(null)}>
            关闭
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Info k="项目编号" v={detail.id} />
              <Info k="项目类型" v={detail.type} />
              <Info k="项目状态" v={displayStatus(detail)} />
              <Info k="发起方" v={detail.initiator} />
              <Info k="发起方类型" v={detail.initiatorRole} />
              <Info k="品类" v={detail.category} />
              <Info k="预估量" v={detail.qty} />
              <Info k="预算" v={detail.budget} />
              <Info k="报名家数" v={`${detail.signups} 家`} />
              <Info k="创建时间" v={detail.createdAt} />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              说明：该项目由 {detail.initiator}（{detail.initiatorRole}）发起，运营可对项目进行发布审核、报名情况跟踪与合规下架。
              竞价类项目结标后自动生成成交订单进入订单管理模块。
            </div>
          </div>
        )}
      </Modal>

      {/* 审核弹窗 */}
      <Modal
        open={!!audit}
        onClose={() => setAudit(null)}
        title="项目发布审核"
        description={audit ? `${audit.id} · ${audit.name}` : ""}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (audit) setHandled((p) => ({ ...p, [audit.id]: "已驳回" }))
                setAudit(null)
              }}
            >
              <CircleX />
              驳回
            </Button>
            <Button
              onClick={() => {
                if (audit) setHandled((p) => ({ ...p, [audit.id]: "已通过" }))
                setAudit(null)
              }}
            >
              <CircleCheck />
              通过并发布
            </Button>
          </>
        }
      >
        {audit && (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">请核验项目信息合规性，通过后项目将进入报名阶段并对外展示。</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Info k="发起方" v={`${audit.initiator}（${audit.initiatorRole}）`} />
              <Info k="项目类型" v={audit.type} />
              <Info k="品类" v={audit.category} />
              <Info k="预估量" v={audit.qty} />
              <Info k="预算" v={audit.budget} />
              <Info k="创建时间" v={audit.createdAt} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{v}</div>
    </div>
  )
}
