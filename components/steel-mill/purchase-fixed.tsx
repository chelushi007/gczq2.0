"use client"

import { useState } from "react"
import { Plus, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusPill, statusTone } from "@/components/shared/status-pill"
import { DataTable, FilterBar, FilterChip, type Column } from "@/components/shared/data-table"
import { fixedList, type FixedItem } from "@/lib/steel-data"
import { FixedManage } from "./fixed-manage"
import { FixedPublish } from "./fixed-publish"

const tabs = ["全部", "待审核", "挂单中", "部分成交", "已完成", "已下架"]

export function PurchaseFixed() {
  const [tab, setTab] = useState("全部")
  const [managing, setManaging] = useState<FixedItem | null>(null)
  const [publishing, setPublishing] = useState(false)

  if (publishing) {
    return <FixedPublish onBack={() => setPublishing(false)} />
  }
  if (managing) {
    return <FixedManage item={managing} onBack={() => setManaging(null)} />
  }

  const rows = tab === "全部" ? fixedList : fixedList.filter((b) => b.status === tab)

  const columns: Column<FixedItem>[] = [
    { key: "id", header: "挂单编号", render: (r) => <span className="font-medium text-foreground">{r.id}</span> },
    { key: "title", header: "需求名称" },
    { key: "category", header: "废钢类别", render: (r) => <StatusPill tone="gray">{r.category}</StatusPill> },
    { key: "region", header: "所在地区", className: "text-muted-foreground" },
    { key: "qty", header: "计划采购量" },
    { key: "price", header: "一口价", render: (r) => <span className="font-medium text-primary">{r.price}</span> },
    { key: "taken", header: "已成交量" },
    { key: "contact", header: "联系人", className: "text-muted-foreground" },
    { key: "publishTime", header: "发布时间", className: "text-muted-foreground tabular-nums" },
    { key: "validUntil", header: "有效期至", className: "text-muted-foreground tabular-nums" },
    { key: "status", header: "状态", render: (r) => <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill> },
    {
      key: "op",
      header: "操作",
      render: (r) => (
        <Button size="sm" className="h-8 gap-1 px-3" onClick={() => setManaging(r)}>
          <Settings2 className="size-3.5" />
          管理
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="固定价回收"
        desc="以固定单价挂出采购需求，供应商直接接单供货，不收取报名费与保证金"
        action={
          <Button onClick={() => setPublishing(true)}>
            <Plus />
            发布固定价需求
          </Button>
        }
      />

      <FilterBar>
        {tabs.map((t) => (
          <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </FilterChip>
        ))}
      </FilterBar>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
    </div>
  )
}
