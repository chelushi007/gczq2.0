"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Users,
  Megaphone,
  Gavel,
  Award,
  Trophy,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Medal,
  Building2,
  Phone,
  CalendarClock,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
  FilePenLine,
  AlertTriangle,
  Info,
  ArrowDownToLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill, statusTone, type StatusTone } from "@/components/shared/status-pill"
import { Modal } from "@/components/shared/modal"
import { type BiddingItem, materialCategories } from "@/lib/steel-data"
import { updateNotice, type NoticeEditable } from "@/lib/bidding-store"
import { cn } from "@/lib/utils"

// 是否已进入报名阶段（报名开始时间是否已到，用于判断采购公告能否修改）。
// 原型数据用 "MM-DD HH:mm" 文本，这里按当前竞价状态近似判断：
// 只有当项目处于"报名前"（本原型用 status 反推，进行中/待开标/成交/流标均视为已开始报名）时可改。
function hasSignupStarted(item: BiddingItem): boolean {
  // 已进入竞价或已结束的项目，报名一定已开始
  return item.status === "进行中" || item.status === "待开标" || item.status === "已成交" || item.status === "已流标"
}

type NodeState = "done" | "active" | "todo"

interface ManageAction {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  desc: string
}

interface ProcessNode {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  state: NodeState
  actions: ManageAction[]
}

const nodeStateMeta: Record<
  NodeState,
  { label: string; tone: "green" | "blue" | "gray"; Icon: React.ComponentType<{ className?: string }> }
> = {
  done: { label: "已完成", tone: "green", Icon: CheckCircle2 },
  active: { label: "进行中", tone: "blue", Icon: Clock },
  todo: { label: "待进行", tone: "gray", Icon: Circle },
}

function buildNodes(item: BiddingItem): ProcessNode[] {
  const isSettled = item.status === "已成交" || item.status === "已流标"
  const isBidPhase = item.status === "进行中" || item.status === "待开标"

  return [
    {
      id: "invite",
      title: "投标邀请",
      icon: Megaphone,
      state: "done",
      actions: [
        { key: "notice", label: "采购公告", icon: FileText, desc: "查看本次竞价的完整采购公告与标的说明" },
        { key: "signup", label: "报名查看", icon: Users, desc: "查看供应商报名情况并进行资格审核" },
        { key: "manageNotice", label: "管理公告", icon: FilePenLine, desc: "报名开始前可修改采购公告，或将公告下架" },
      ],
    },
    {
      id: "bid",
      title: "竞价",
      icon: Gavel,
      state: isSettled ? "done" : isBidPhase ? "active" : "todo",
      actions: [
        { key: "quotes", label: "查看报价", icon: Gavel, desc: "实时查看各供应商报价与排名" },
        { key: "modifyTime", label: "修改时间", icon: CalendarClock, desc: "延长竞价时间，提交运营端审核" },
      ],
    },
    {
      id: "award",
      title: "定标",
      icon: Award,
      state: isSettled ? "active" : "todo",
      actions: [
        { key: "select", label: "竞价择标", icon: ClipboardCheck, desc: "采购方从候选供应商中确定中标单位" },
        { key: "result", label: "中标结果公告", icon: Award, desc: "发布最终中标供应商与成交结果" },
      ],
    },
  ]
}

/* ---------------- 通用元素 ---------------- */

function SectionCard({
  title,
  extra,
  children,
}: {
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {extra}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">
        {required && <span className="mr-0.5 text-destructive">*</span>}
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"

/* 1. 采购公告（完整详情，对齐发布需求） */
function NoticeContent({ item }: { item: BiddingItem }) {
  const materialRows = [
    { no: 1, cat: item.category, name: `${item.category}废钢`, spec: "≤1m", unit: "吨", brand: "—", qty: item.qty, cond: "废旧" },
  ]
  return (
    <div className="space-y-4">
      <SectionCard
        title="基本信息"
        extra={
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Download className="size-3.5" />
            下载公告 PDF
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="公告标题" value={item.title} />
          <Field label="采购单位" value="盘古钢铁集团有限公司" />
          <Field label="采购单位地址" value={`${item.region}·盘古工业园区 1 号`} />
          <Field label="采购预算" value={item.budget} />
          <Field label="采购方式" value={item.purchaseMethod} />
          <Field label="采购联系人" value={item.contact} />
          <Field label="是否允许自然人参与" value={item.allowPerson ? "是" : "否"} />
          <Field label="发布时间" value={item.publishTime} />
          <Field label="报名截止" value={item.signupEnd} />
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-1.5 text-xs text-muted-foreground">竞价人资格条件</div>
          <ol className="space-y-1 text-sm leading-relaxed text-foreground">
            <li>1. 注册并审核通过成为"盘古循环资源"认证会员；</li>
            <li>2. {item.allowPerson ? "允许" : "不允许"}以自然人（个人）身份参与报名；</li>
            <li>3. 具备再生资源回收经营资质，近三年无重大违约及不良记录。</li>
          </ol>
        </div>
      </SectionCard>

      <SectionCard title="交易指南">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="报名开始时间" value={item.signupStart} />
          <Field label="报名截止时间" value={item.signupEnd} />
          <Field label="投标保证金 (元)" value="20,000" />
          <Field label="支付方式" value="线上支付" />
          <Field label="保证金缴纳截止" value={item.signupEnd} />
          <Field label="竞价方式" value="多轮次报价(减价竞价)" />
          <Field label="竞价开始时间" value={item.bidStart} />
          <Field label="竞价结束时间" value={item.bidEnd} />
          <Field label="延时竞价周期 (秒)" value="300" />
          <Field label="竞价阶梯 (元)" value="500" />
          <Field label="起始价 (元/吨)" value="3,000" />
          <Field label="中标保证金退还" value="签约后 5 个工作日内退还" />
        </div>
      </SectionCard>

      <SectionCard title="物料信息">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {["序号", "物料分类", "物料名称", "规格型号", "单位", "品牌", "数量", "新旧程度"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialRows.map((m) => (
                <tr key={m.no} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{m.no}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{m.cat}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{m.name}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.spec}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.unit}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.brand}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-foreground">{m.qty}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{m.cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

/* 2. 报名查看（序号 + 审核交互） */
interface SignupRow {
  id: string
  name: string
  contact: string
  phone: string
  time: string
  status: string
  license: string
  signupFee: "已缴" | "未缴"
  deposit: "已缴" | "未缴"
}
const initialSignupRows: SignupRow[] = [
  { id: "R1", name: "华东再生资源有限公司", contact: "王建国", phone: "138****6621", time: "2026-09-01 10:24", status: "审核通过", license: "苏A-资源-20210331", signupFee: "已缴", deposit: "已缴" },
  { id: "R2", name: "江苏鑫盛物资回收公司", contact: "李海涛", phone: "139****3308", time: "2026-09-01 14:12", status: "审核通过", license: "苏B-资源-20190812", signupFee: "已缴", deposit: "未缴" },
  { id: "R3", name: "浙江环晟金属科技", contact: "张伟", phone: "137****9902", time: "2026-09-02 09:33", status: "待审核", license: "浙C-资源-20220605", signupFee: "已缴", deposit: "未缴" },
  { id: "R4", name: "上海宝钢再生资源", contact: "陈明", phone: "136****1157", time: "2026-09-02 16:41", status: "待审核", license: "沪A-资源-20200118", signupFee: "未缴", deposit: "未缴" },
  { id: "R5", name: "安徽绿源废旧金属", contact: "刘芳", phone: "135****8820", time: "2026-09-03 08:05", status: "已驳回", license: "皖D-资源-20230920", signupFee: "未缴", deposit: "未缴" },
]
const signupTone: Record<string, StatusTone> = {
  审核通过: "green",
  待审核: "amber",
  已驳回: "red",
}

function SignupContent() {
  const [rows, setRows] = useState<SignupRow[]>(initialSignupRows)
  const [reviewing, setReviewing] = useState<SignupRow | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  function decide(result: "审核通过" | "已驳回") {
    if (!reviewing) return
    setRows((prev) => prev.map((r) => (r.id === reviewing.id ? { ...r, status: result } : r)))
    setReviewing(null)
    setRejectReason("")
  }

  return (
    <>
      <SectionCard title="报名供应商" extra={<span className="text-xs text-muted-foreground">共 {rows.length} 家报名</span>}>
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: "报名总数", value: rows.length, tone: "text-foreground" },
            { label: "审核通过", value: rows.filter((r) => r.status === "审核通过").length, tone: "text-emerald-600" },
            { label: "待审核", value: rows.filter((r) => r.status === "待审核").length, tone: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background px-4 py-3">
              <div className={cn("text-2xl font-semibold tabular-nums", s.tone)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">序号</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">供应商名称</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">联系人</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">联系方式</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">报名时间</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">报名费</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">保证金</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">审核状态</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{r.name}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{r.contact}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.phone}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.time}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusPill tone={r.signupFee === "已缴" ? "green" : "gray"}>{r.signupFee}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusPill tone={r.deposit === "已缴" ? "green" : "gray"}>{r.deposit}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusPill tone={signupTone[r.status]}>{r.status}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <button
                      onClick={() => {
                        setReviewing(r)
                        setRejectReason("")
                      }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {r.status === "待审核" ? "审核" : "查看"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title="报名资格审核"
        description={reviewing ? `${reviewing.name} · ${reviewing.contact}` : undefined}
        footer={
          reviewing?.status === "待审核" ? (
            <>
              <Button variant="outline" size="sm" className="h-9" onClick={() => decide("已驳回")}>
                驳回
              </Button>
              <Button size="sm" className="h-9" onClick={() => decide("审核通过")}>
                审核通过
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-9" onClick={() => setReviewing(null)}>
              关闭
            </Button>
          )
        }
      >
        {reviewing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="供应商名称" value={reviewing.name} />
              <Field label="报名时间" value={reviewing.time} />
              <Field label="联系人" value={reviewing.contact} />
              <Field label="联系方式" value={reviewing.phone} />
              <Field
                label="经营资质编号"
                value={
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    {reviewing.license}
                  </span>
                }
              />
              <Field label="当前状态" value={<StatusPill tone={signupTone[reviewing.status]}>{reviewing.status}</StatusPill>} />
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-2 text-xs font-medium text-foreground">报名材料</div>
              <div className="flex flex-wrap gap-2">
                {["营业执照.pdf", "经营许可证.pdf", "授权委托书.pdf"].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    <FileText className="size-3" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
            {reviewing.status === "待审核" && (
              <FormRow label="驳回理由（驳回时必填）">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="请输入驳回理由"
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </FormRow>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

/* 3. 修改公告（报名开始前可修改采购公告） */
function ModifyNoticeContent({ item }: { item: BiddingItem }) {
  // 是否已进入报名阶段：报名开始后不可修改
  const signupStarted = item.status !== "待发布" && hasSignupStarted(item)
  const editable = !signupStarted

  const [form, setForm] = useState<NoticeEditable>({
    title: item.title,
    category: item.category,
    region: item.region,
    qty: item.qty,
    basePrice: item.basePrice,
    budget: item.budget,
    contact: item.contact,
    allowPerson: item.allowPerson,
    signupStart: item.signupStart,
    signupEnd: item.signupEnd,
    bidStart: item.bidStart,
    bidEnd: item.bidEnd,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof NoticeEditable>(k: K, v: NoticeEditable[K]) {
    setForm((f) => ({ ...f, [k]: v }))
    setSaved(false)
  }

  function submit() {
    updateNotice(item.id, form)
    setConfirmOpen(false)
    setSaved(true)
  }

  return (
    <>
      {!editable && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>本竞价已进入报名/竞价阶段，采购公告不可再修改。如需变更请通过运营审核流程处理。</span>
        </div>
      )}
      {editable && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>报名开始前可修改采购公告。修改保存后将实时更新供应商端竞价信息。</span>
        </div>
      )}

      <SectionCard title="修改采购公告">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="公告标题" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </FormRow>
          <FormRow label="废钢类别" required>
            <select
              className={inputCls}
              disabled={!editable}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {materialCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FormRow>
          <FormRow label="区域范围" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
            />
          </FormRow>
          <FormRow label="采购数量" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.qty}
              onChange={(e) => set("qty", e.target.value)}
            />
          </FormRow>
          <FormRow label="起拍价" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
            />
          </FormRow>
          <FormRow label="采购预算" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
            />
          </FormRow>
          <FormRow label="采购联系人" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
            />
          </FormRow>
          <FormRow label="是否允许自然人参与">
            <div className="flex h-9 items-center gap-6">
              {[true, false].map((v) => (
                <label key={String(v)} className="inline-flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    disabled={!editable}
                    checked={form.allowPerson === v}
                    onChange={() => set("allowPerson", v)}
                  />
                  {v ? "是" : "否"}
                </label>
              ))}
            </div>
          </FormRow>
          <FormRow label="报名开始时间" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.signupStart}
              onChange={(e) => set("signupStart", e.target.value)}
            />
          </FormRow>
          <FormRow label="报名截止时间" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.signupEnd}
              onChange={(e) => set("signupEnd", e.target.value)}
            />
          </FormRow>
          <FormRow label="竞价开始时间" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.bidStart}
              onChange={(e) => set("bidStart", e.target.value)}
            />
          </FormRow>
          <FormRow label="竞价结束时间" required>
            <input
              className={inputCls}
              disabled={!editable}
              value={form.bidEnd}
              onChange={(e) => set("bidEnd", e.target.value)}
            />
          </FormRow>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
          {saved && (
            <span className="mr-auto inline-flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
                修改已保存
            </span>
          )}
          <Button size="sm" className="h-9" disabled={!editable} onClick={() => setConfirmOpen(true)}>
            保存修改
          </Button>
        </div>
      </SectionCard>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认修改采购公告"
        description="修改保存后将实时更新供应商端竞价信息，请确认修改内容无误。"
        footer={
          <>
            <Button variant="outline" size="sm" className="h-9" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button size="sm" className="h-9" onClick={submit}>
              确认保存
            </Button>
          </>
        }
      >
        <div className="space-y-1.5 text-sm text-foreground">
          <div>公告标题：{form.title}</div>
          <div>采购数量：{form.qty} · 起拍价：{form.basePrice}</div>
          <div>报名截止：{form.signupEnd} · 竞价时间：{form.bidStart} ~ {form.bidEnd}</div>
        </div>
      </Modal>
    </>
  )
}

/* 3b. 下架公告 */
function OffShelfContent({ item }: { item: BiddingItem }) {
  const alreadyOff = item.status === "已下架" || item.status === "已成交" || item.status === "已流标"
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [reason, setReason] = useState("")

  if (alreadyOff) {
    return (
      <SectionCard title="下架公告">
        <div className="flex items-start gap-2 rounded-md border border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>当前公告已为「{item.status}」状态，无需再次下架。</span>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="下架公告">
      {done ? (
        <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>公告已下架，停止报名与竞价。已缴纳的报名费、保证金将按规则退还。</span>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>下架后供应商将无法继续报名或竞价，操作不可撤销，请谨慎操作。</span>
          </div>
          <FormRow label="下架原因" required>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls.replace("h-9", "min-h-20") + " resize-y py-2"}
              placeholder="请输入下架原因，如采购计划调整、公告信息有误等"
            />
          </FormRow>
          <div className="mt-4">
            <Button variant="destructive" disabled={!reason.trim()} onClick={() => setConfirmOpen(true)}>
              <ArrowDownToLine className="size-4" />
              下架公告
            </Button>
          </div>
        </>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认下架公告"
        description="下架后本次竞价将终止，供应商无法继续参与。"
        footer={
          <>
            <Button variant="outline" size="sm" className="h-9" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-9"
              onClick={() => {
                setConfirmOpen(false)
                setDone(true)
              }}
            >
              确认下架
            </Button>
          </>
        }
      >
        <div className="space-y-1.5 text-sm text-foreground">
          <div>公告标题：{item.title}</div>
          <div>下架原因：{reason}</div>
        </div>
      </Modal>
    </SectionCard>
  )
}

/* 3. 管理公告（修改公告 / 下架公告 合并） */
function ManageNoticeContent({ item }: { item: BiddingItem }) {
  const [tab, setTab] = useState<"modify" | "off">("modify")
  const tabs = [
    { key: "modify" as const, label: "修改公告", icon: FilePenLine },
    { key: "off" as const, label: "下架公告", icon: ArrowDownToLine },
  ]
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-card text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>
      {tab === "modify" ? <ModifyNoticeContent item={item} /> : <OffShelfContent item={item} />}
    </div>
  )
}

/* 4. 查看报价 */
const quoteRows = [
  { rank: 1, name: "江苏鑫盛物资回收公司", price: "3,280", rounds: 6, time: "2026-09-04 15:58:12" },
  { rank: 2, name: "华东再生资源有限公司", price: "3,250", rounds: 5, time: "2026-09-04 15:57:40" },
  { rank: 3, name: "上海宝钢再生资源", price: "3,210", rounds: 5, time: "2026-09-04 15:55:03" },
  { rank: 4, name: "浙江环晟金属科技", price: "3,180", rounds: 4, time: "2026-09-04 15:50:22" },
]

function QuotesContent({ item }: { item: BiddingItem }) {
  const live = item.status === "进行中"
  return (
    <SectionCard
      title="实时报价"
      extra={
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            live ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground",
          )}
        >
          <span className={cn("size-1.5 rounded-full", live ? "animate-pulse bg-emerald-500" : "bg-muted-foreground")} />
          {live ? "竞价进行中" : "竞价已结束"}
        </span>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="起始价 (元/吨)" value="3,000" />
        <Field label="当前最高价 (元/吨)" value={<span className="text-primary">{quoteRows[0].price}</span>} />
        <Field label="竞价阶梯 (元)" value="500" />
        <Field label="参与家数" value={`${quoteRows.length} 家`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">排名</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">供应商</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">最新报价 (元/吨)</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">报价轮次</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">最后报价时间</th>
            </tr>
          </thead>
          <tbody>
            {quoteRows.map((r) => (
              <tr key={r.rank} className={cn("border-b border-border/60 last:border-0", r.rank === 1 && "bg-primary/5")}>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                      r.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{r.name}</td>
                <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums text-foreground">{r.price}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.rounds} 轮</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

/* 5. 修改时间（延长竞价，提交运营审核） */
function ModifyTimeContent({ item }: { item: BiddingItem }) {
  const [form, setForm] = useState({ newEnd: "", reason: "" })
  const [records, setRecords] = useState<{ id: string; from: string; to: string; reason: string; status: string; time: string }[]>([
    { id: "T1", from: item.bidEnd, to: "09-08 20:00", reason: "多家供应商申请延长报价窗口", status: "审核中", time: "2026-09-06 10:12" },
  ])

  function submit() {
    if (!form.newEnd.trim()) return
    setRecords((prev) => [
      {
        id: `T${Date.now()}`,
        from: item.bidEnd,
        to: form.newEnd,
        reason: form.reason || "—",
        status: "审核中",
        time: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
      },
      ...prev,
    ])
    setForm({ newEnd: "", reason: "" })
  }

  const recordTone: Record<string, StatusTone> = { 审核中: "amber", 已通过: "green", 已驳回: "red" }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        修改竞价时间将提交至运营端审核，审核通过后对全部供应商生效。竞价开始后仅支持延长竞价结束时间。
      </div>
      <SectionCard title="申请修改竞价时间">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="当前竞价开始时间" value={item.bidStart} />
          <Field label="当前竞价结束时间" value={item.bidEnd} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormRow label="延长后的竞价结束时间" required>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.newEnd}
              onChange={(e) => setForm((f) => ({ ...f, newEnd: e.target.value }))}
            />
          </FormRow>
          <FormRow label="申请原因" required>
            <input
              className={inputCls}
              placeholder="请输入延长竞价时间的原因"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </FormRow>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" className="h-9 gap-1" onClick={submit}>
            <CalendarClock className="size-4" />
            提交运营审核
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="修改申请记录">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">原结束时间</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">申请结束时间</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">申请原因</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">提交时间</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">审核状态</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.from}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums font-medium text-foreground">{r.to}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.reason}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">{r.time}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusPill tone={recordTone[r.status]}>{r.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

/* 6. 入围候选人公示 */
const shortlistRows = [
  { rank: 1, name: "江苏鑫盛物资回收公司", price: "3,280", score: 96.5, note: "第一候选人" },
  { rank: 2, name: "华东再生资源有限公司", price: "3,250", score: 93.2, note: "第二候选人" },
  { rank: 3, name: "上海宝钢再生资源", price: "3,210", score: 90.8, note: "第三候选人" },
]

function ShortlistContent() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        入围候选人公示期为 <span className="font-medium">3 个工作日</span>
        ，公示期内如有异议请通过平台提交。公示期满无异议后进入中标结果公告环节。
      </div>
      <SectionCard title="入围候选人名单" extra={<span className="text-xs text-muted-foreground">公示中 · 剩余 2 天</span>}>
        <div className="space-y-3">
          {shortlistRows.map((r) => (
            <div
              key={r.rank}
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg border p-4",
                r.rank === 1 ? "border-primary/40 bg-primary/5" : "border-border bg-background",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    r.rank === 1 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Medal className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    <StatusPill tone={r.rank === 1 ? "blue" : "gray"}>{r.note}</StatusPill>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">报价 {r.price} 元/吨</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold tabular-nums text-foreground">{r.score}</div>
                <div className="text-xs text-muted-foreground">综合得分</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

/* 7. 竞价择标（采购方择标） */
const candidateRows = [
  { rank: 1, name: "江苏鑫盛物资回收公司", price: "3,280", score: 96.5, amount: "2,624,000" },
  { rank: 2, name: "华东再生资源有限公司", price: "3,250", score: 93.2, amount: "2,600,000" },
  { rank: 3, name: "上海宝钢再生资源", price: "3,210", score: 90.8, amount: "2,568,000" },
]

function SelectContent() {
  const [picked, setPicked] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [reason, setReason] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const pickedRow = candidateRows.find((c) => c.name === picked)
  const nonTopPicked = picked && candidateRows[0].name !== picked
  const priceValues = candidateRows.map((c) => Number(c.price.replace(/,/g, "")))
  const maxPrice = Math.max(...priceValues)
  const minPrice = Math.min(...priceValues)

  return (
    <div className="space-y-4">
      {confirmed ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          已完成择标，中标单位为 <span className="font-semibold">{picked}</span>
          ，系统已生成中标结果，可前往「中标结果公告」发布。
        </div>
      ) : (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          请采购方在候选供应商中确定最终中标单位。本次采用减价竞价方式，报价越低对采购方越有利，采购方可自主选择任一候选供应商，无需填写择标理由。
        </div>
      )}

      <SectionCard title="候选供应商择标">
        <div className="space-y-3">
          {candidateRows.map((c) => {
            const active = picked === c.name
            return (
              <button
                key={c.name}
                disabled={confirmed}
                onClick={() => setPicked(c.name)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-primary/40",
                  confirmed && "cursor-default opacity-80",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      c.rank === 1 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.rank}
                  </span>
                  <div>
  <div className="flex items-center gap-2">
  <span className="text-sm font-semibold text-foreground">{c.name}</span>
  </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        报价 <span className="font-semibold text-foreground">{c.price}</span> 元/吨
                        {Number(c.price.replace(/,/g, "")) === minPrice && (
                          <StatusPill tone="green">最低价</StatusPill>
                        )}
                        {Number(c.price.replace(/,/g, "")) === maxPrice && (
                          <StatusPill tone="red">最高价</StatusPill>
                        )}
                      </span>
                      <span>· 综合得分 {c.score} · 成交金额 ¥{c.amount}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {active && <CheckCircle2 className="size-4" />}
                </span>
              </button>
            )
          })}
        </div>

        {picked && !confirmed && (
          <div className="mt-4">
            <FormRow label="择标说明（选填）">
              <textarea
                rows={3}
                placeholder="如有需要可补充择标说明，选填"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormRow>
          </div>
        )}

        {!confirmed && (
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              className="h-9 gap-1"
              disabled={!picked}
              onClick={() => setConfirmOpen(true)}
            >
              <ClipboardCheck className="size-4" />
              确认择标
            </Button>
          </div>
        )}
      </SectionCard>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认择标结果"
        description="确认后将锁定中标单位，操作不可撤销"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" className="h-9" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setConfirmed(true)
                setConfirmOpen(false)
              }}
            >
              确认中标
            </Button>
          </>
        }
      >
        {pickedRow && (
          <div className="space-y-3">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="text-xs text-muted-foreground">拟定中标单位</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{pickedRow.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                中标价 {pickedRow.price} 元/吨 · 成交金额 ¥{pickedRow.amount}
              </div>
            </div>
            {nonTopPicked && (
              <div className="text-sm text-muted-foreground">
                择标理由：<span className="text-foreground">{reason}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

/* 8. 中标结果公告 */
const noticeTemplates = [
  {
    id: "standard",
    name: "标准中标公告",
    desc: "适用于常规竞价采购，含中标单位、成交价、成交金额等完整信息",
  },
  {
    id: "brief",
    name: "简版中标公告",
    desc: "仅公示中标单位与成交结果，适用于快速公示场景",
  },
  {
    id: "detailed",
    name: "详版中标公告",
    desc: "含标的明细、评审说明与全部候选人排序，适用于监管留档",
  },
]

function ResultContent({ item }: { item: BiddingItem }) {
  const settled = item.status === "已成交"
  // decision: 待定 | published(已发布) | skipped(不发布)
  const [decision, setDecision] = useState<"pending" | "published" | "skipped">("pending")
  const [templateId, setTemplateId] = useState("standard")
  const [pubOpen, setPubOpen] = useState(false)
  const [skipOpen, setSkipOpen] = useState(false)

  if (!settled) {
    return (
      <SectionCard title="中标结果公告">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Award className="size-6" />
          </span>
          <div className="text-sm text-muted-foreground">当前竞价尚未完成定标，中标结果公告将在定标结束后发布。</div>
        </div>
      </SectionCard>
    )
  }

  const chosen = noticeTemplates.find((t) => t.id === templateId)

  return (
    <div className="space-y-4">
      {/* 定标结果摘要 */}
      <div className="overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Trophy className="size-6" />
          </span>
          <div>
            <div className="text-xs text-muted-foreground">中标供应商</div>
            <div className="text-xl font-semibold text-foreground">江苏鑫盛物资回收公司</div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="中标价格" value={<span className="text-primary">3,280 元/吨</span>} />
          <Field label="成交金额" value="¥ 2,624,000" />
          <Field label="定标时间" value="2026-09-05 10:00" />
        </div>
      </div>

      {/* 公告发布决策 */}
      <SectionCard title="公告发布">
        {decision === "pending" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <FileText className="mt-0.5 size-4 shrink-0" />
              <span>定标已完成。您可选择发布中标结果公告对外公示，或经内部审批后不对外发布公告。</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* 发布公告 */}
              <div className="flex flex-col rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Award className="size-4 text-primary" />
                  发布中标结果公告
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                  向平台内所有供应商公示中标单位与成交结果，可选择不同公告模版。
                </p>
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-muted-foreground">公告模版</label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="h-9 w-full rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                  >
                    {noticeTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{chosen?.desc}</p>
                </div>
                <Button className="mt-3" onClick={() => setPubOpen(true)}>
                  发布公告
                </Button>
              </div>
              {/* 不发布公告 */}
              <div className="flex flex-col rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="size-4 text-muted-foreground" />
                  不发布中标结果公告
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                  本次采购不对外公示中标结果，仅在平台内部留档。适用于涉密或定向采购场景，需说明原因。
                </p>
                <Button variant="outline" className="mt-3 bg-transparent" onClick={() => setSkipOpen(true)}>
                  选择不发布
                </Button>
              </div>
            </div>
          </div>
        )}

        {decision === "published" && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <Award className="mt-0.5 size-4 shrink-0" />
            <span>
              中标结果公告已发布（模版：{chosen?.name}），已对全平台供应商公示。中标单位信息见下方。
            </span>
          </div>
        )}

        {decision === "skipped" && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <FileText className="size-4" />
              本次采购已选择不发布中标结果公告，仅平台内部留档。
            </span>
            <Button variant="ghost" size="sm" onClick={() => setDecision("pending")}>
              重新选择
            </Button>
          </div>
        )}
      </SectionCard>

      {/* 中标单位信息 */}
      <SectionCard title="中标单位信息">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Building2 className="size-4 text-muted-foreground" />
            江苏鑫盛物资回收公司
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Users className="size-4 text-muted-foreground" />
            联系人：李海涛
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Phone className="size-4 text-muted-foreground" />
            139****3308
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="size-4 text-muted-foreground" />
            {item.region}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <FileText className="size-4 text-muted-foreground" />
            成交编号：{item.id}-CJ
          </div>
        </div>
      </SectionCard>

      {/* 发布确认弹窗 */}
      <Modal
        open={pubOpen}
        onClose={() => setPubOpen(false)}
        title="确认发布中标结果公告"
        footer={
          <>
            <Button variant="outline" className="bg-transparent" onClick={() => setPubOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setDecision("published")
                setPubOpen(false)
              }}
            >
              确认发布
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-foreground">
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">选用公告模版</div>
            <div className="mt-0.5 font-medium">{chosen?.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{chosen?.desc}</div>
          </div>
          <p className="text-muted-foreground">
            发布后，中标单位「江苏鑫盛物资回收公司」及成交结果将对平台内全部供应商公示，公示信息不可撤回。
          </p>
        </div>
      </Modal>

      {/* 不发布确认弹窗 */}
      <Modal
        open={skipOpen}
        onClose={() => setSkipOpen(false)}
        title="确认不发布中标结果公告"
        footer={
          <>
            <Button variant="outline" className="bg-transparent" onClick={() => setSkipOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setDecision("skipped")
                setSkipOpen(false)
              }}
            >
              确认不发布
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">本次采购将不对外公示中标结果，仅在平台内部留档。请填写不发布原因：</p>
          <textarea
            rows={3}
            placeholder="请输入不发布中标结果公告的原因（如涉密采购、定向采购等）"
            className="w-full rounded border border-border bg-background p-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </Modal>
    </div>
  )
}

const actionContent: Record<string, (item: BiddingItem) => React.ReactNode> = {
  notice: (item) => <NoticeContent item={item} />,
  signup: () => <SignupContent />,
  manageNotice: (item) => <ManageNoticeContent item={item} />,
  quotes: (item) => <QuotesContent item={item} />,
  modifyTime: (item) => <ModifyTimeContent item={item} />,
  shortlist: () => <ShortlistContent />,
  select: () => <SelectContent />,
  result: (item) => <ResultContent item={item} />,
}

/* ---------------- 主组件 ---------------- */

export function BiddingManage({ item, onBack }: { item: BiddingItem; onBack: () => void }) {
  const nodes = buildNodes(item)
  const [openNode, setOpenNode] = useState<string | null>(nodes.find((n) => n.state === "active")?.id ?? "invite")
  const [activeAction, setActiveAction] = useState<{ node: ProcessNode; action: ManageAction } | null>(null)

  return (
    <div className="space-y-5">
      {/* 返回 + 标题 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            返回竞价列表
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
            <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
          </div>
          <p className="text-sm text-muted-foreground">
            竞价单号 <span className="font-medium text-foreground">{item.id}</span> · {item.region} · {item.category} ·{" "}
            {item.qty}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg border border-border bg-card px-4 py-3 text-xs">
          <span className="text-muted-foreground">报名时间</span>
          <span className="tabular-nums text-foreground">
            {item.signupStart} ~ {item.signupEnd}
          </span>
          <span className="text-muted-foreground">竞价时间</span>
          <span className="tabular-nums text-foreground">
            {item.bidStart} ~ {item.bidEnd}
          </span>
        </div>
      </div>

      {/* 流程展示 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-1 text-sm font-medium text-foreground">项目流程</div>
        <p className="mb-5 text-xs text-muted-foreground">点击节点展开功能入口，再选择具体功能查看内容</p>
        <div className="flex items-center">
          {nodes.map((node, i) => {
            const meta = nodeStateMeta[node.state]
            const active = openNode === node.id
            return (
              <div key={node.id} className="flex flex-1 items-center">
                <button
                  onClick={() => setOpenNode(active ? null : node.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-md px-2 py-2 transition-colors",
                    active ? "bg-primary/5" : "hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full ring-2 transition-colors",
                      node.state === "done" && "bg-emerald-50 text-emerald-600 ring-emerald-200",
                      node.state === "active" && "bg-primary/10 text-primary ring-primary/30",
                      node.state === "todo" && "bg-muted text-muted-foreground ring-border",
                    )}
                  >
                    <node.icon className="size-5" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>
                      {node.title}
                    </span>
                    <ChevronDown
                      className={cn("size-3.5 text-muted-foreground transition-transform", active && "rotate-180")}
                    />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <meta.Icon
                      className={cn(
                        "size-3",
                        meta.tone === "green" && "text-emerald-600",
                        meta.tone === "blue" && "text-primary",
                        meta.tone === "gray" && "text-muted-foreground",
                      )}
                    />
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                  </span>
                </button>
                {i < nodes.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 w-8 shrink-0 rounded-full sm:w-16",
                      node.state === "done" ? "bg-emerald-300" : "bg-border",
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* 展开的功能入口 */}
        {openNode && (
          <div className="mt-5 border-t border-border pt-5">
            {nodes
              .filter((n) => n.id === openNode)
              .map((node) => (
                <div key={node.id}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <node.icon className="size-4 text-primary" />
                    {node.title} · 功能入口
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {node.actions.map((a) => {
                      const selected = activeAction?.action.key === a.key
                      return (
                        <button
                          key={a.key}
                          onClick={() => setActiveAction({ node, action: a })}
                          className={cn(
                            "group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                          )}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <a.icon className="size-5" />
                          </span>
                          <span className="space-y-0.5">
                            <span
                              className={cn(
                                "block text-sm font-medium",
                                selected ? "text-primary" : "text-foreground group-hover:text-primary",
                              )}
                            >
                              {a.label}
                            </span>
                            <span className="block text-xs leading-relaxed text-muted-foreground">{a.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 子模块内容 */}
      {activeAction && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{activeAction.node.title}</span>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <activeAction.action.icon className="size-4 text-primary" />
              {activeAction.action.label}
            </span>
          </div>
          {actionContent[activeAction.action.key]?.(item)}
        </div>
      )}
    </div>
  )
}
