import { Recycle, Truck, Cog, Factory, Users, type LucideIcon } from "lucide-react"
import type { WorkspaceKey } from "@/lib/steel-data"
import type { SupplierSub } from "@/components/workspace-nav"

const supplierSubConfig: Record<SupplierSub, { icon: LucideIcon; title: string; desc: string; points: string[] }> = {
  enterprise: {
    icon: Factory,
    title: "供应商 · 企业供应商",
    desc: "功能如回收基地（除基地能力）。",
    points: [
      "参与钢厂竞价 / 固定价 / 协议供货",
      "订单履约：合同签署、对账、货款收取、发货",
      "财务管理：费用支付与发票管理",
      "不含基地管理（合作基地邀约与申请）能力",
    ],
  },
  person: {
    icon: Users,
    title: "供应商 · 自然人",
    desc: "自然人供应商和销售方。",
    points: [
      "自然人身份向回收基地 / 钢厂供货与销售",
      "仅支持发布销售需求，不支持采购",
      "由回收基地 / 采购方进行反向开票",
      "年度开票额度受金税系统校验（不超过 500 万元）",
    ],
  },
}

const config: Record<
  string,
  { icon: LucideIcon; title: string; desc: string; points: string[] }
> = {
  "portal-steel": {
    icon: Factory,
    title: "门户 · 钢厂专区",
    desc: "钢厂专区属于门户前端展示内容，面向公众访客，暂不设计。",
    points: [
      "对外展示钢厂采购需求与专区介绍",
      "访客可浏览竞价 / 固定价 / 协议采购公告",
      "引导注册认证会员后进入工作台参与交易",
      "与「用户工作台 · 钢厂」的后台管理功能相互独立",
    ],
  },
  station: {
    icon: Recycle,
    title: "回收站工作台",
    desc: "回收站角色的工作台设计中，后续将参照钢厂结构展开。",
    points: [
      "向钢厂供货，申请成为钢厂合作供应商",
      "发布废钢出售需求：竞价 / 询价 / 固定价销售",
      "发布采购废钢需求，向上下游双向流转",
      "向自然人供应商反向开票",
    ],
  },
  supplier: {
    icon: Truck,
    title: "供应商工作台",
    desc: "供应商（企业 / 自然人）工作台设计中。",
    points: [
      "向回收站和钢厂供货",
      "发布采购与销售废钢需求",
      "自然人供应商仅支持发布销售需求，不支持采购",
      "自然人由回收站进行反向开票",
    ],
  },
  "ops-tbd": {
    icon: Cog,
    title: "运营工作台",
    desc: "运营工作台下级菜单待定，规划中。",
    points: ["角色与权限管理", "交易与合规监管", "数据看板与运营分析", "结算与开票管理"],
  },
}

export function PlaceholderWorkspace({
  workspace,
  supplierSub,
}: {
  workspace: WorkspaceKey
  supplierSub?: SupplierSub
}) {
  const c =
    workspace === "supplier" && supplierSub ? supplierSubConfig[supplierSub] : (config[workspace] ?? config["ops-tbd"])
  const Icon = c.icon
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">{c.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
        <ul className="mt-5 space-y-2 text-left">
          {c.points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
