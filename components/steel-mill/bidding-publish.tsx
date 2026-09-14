"use client"

import { useRef, useState } from "react"
import { ArrowLeft, Plus, Trash2, Layers, Upload, FileText, Paperclip, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  purchaseMethods,
  bidModes,
  payMethods,
  materialConditions,
} from "@/lib/steel-data"
import { MaterialPicker, type PickedCategory } from "./material-picker"

interface MaterialRow {
  id: number
  category: string
  name: string
  spec: string
  unit: string
  brand: string
  qty: string
  condition: string
  detail: string
  manual?: boolean
}

interface AttachmentRow {
  id: number
  name: string
  size: string
  uploadedAt: string
}

let seq = 1
let fileSeq = 1

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`flex items-start gap-3 ${className}`}>
      <span className="mt-2 w-28 shrink-0 text-right text-sm text-muted-foreground">
        {required && <span className="text-destructive">* </span>}
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  )
}

const inputCls =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
const selectCls = inputCls + " appearance-none bg-[length:14px] bg-[right_0.75rem_center] bg-no-repeat"

export function BiddingPublish({ onBack }: { onBack: () => void }) {
  const [allowPerson, setAllowPerson] = useState(false)
  const [materials, setMaterials] = useState<MaterialRow[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [attachments, setAttachments] = useState<AttachmentRow[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerRowId, setPickerRowId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addMaterialFromPicker = (picked: PickedCategory) => {
    if (pickerRowId !== null) {
      updateMaterial(pickerRowId, { category: picked.l3 })
    } else {
      setMaterials((m) => [
        ...m,
        {
          id: seq++,
          category: picked.l3,
          name: "",
          spec: "",
          unit: "吨",
          brand: "",
          qty: "",
          condition: materialConditions[0],
          detail: "",
          manual: false,
        },
      ])
    }
    setPickerOpen(false)
    setPickerRowId(null)
  }

  const openPickerForRow = (id: number) => {
    setPickerRowId(id)
    setPickerOpen(true)
  }

  const onPickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const rows: AttachmentRow[] = Array.from(files).map((f) => ({
      id: fileSeq++,
      name: f.name,
      size: formatSize(f.size),
      uploadedAt: stamp,
    }))
    setAttachments((a) => [...a, ...rows])
  }

  const removeAttachment = (id: number) => {
    setAttachments((a) => a.filter((f) => f.id !== id))
  }

  const addMaterial = () => {
    setMaterials((m) => [
      ...m,
      {
        id: seq++,
        category: "",
        name: "",
        spec: "",
        unit: "吨",
        brand: "",
        qty: "",
        condition: materialConditions[0],
        detail: "",
        manual: true,
      },
    ])
  }

  const updateMaterial = (id: number, patch: Partial<MaterialRow>) => {
    setMaterials((m) => m.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const removeSelected = () => {
    setMaterials((m) => m.filter((row) => !selected.has(row.id)))
    setSelected(new Set())
  }

  const toggleRow = (id: number) => {
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          返回列表
        </Button>
        <div>
          <h2 className="text-base font-semibold text-foreground">发布竞价需求</h2>
          <p className="text-xs text-muted-foreground">填写采购基本信息、交易指南与物料清单，提交后进入审核发布流程</p>
        </div>
      </div>

      {/* 基本信息 */}
      <SectionCard title="基本信息">
        <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
          <Field label="公告标题" required>
            <input className={inputCls} placeholder="请输入公告标题" />
          </Field>
          <Field label="采购预算(元)" required>
            <input className={inputCls} inputMode="numeric" placeholder="请输入预算金额" />
          </Field>
          <Field label="采购单位" required>
            <input className={inputCls} placeholder="请输入采购单位名称" />
          </Field>
          <Field label="采购单位地址" required>
            <input className={inputCls} placeholder="请输入采购单位地址" />
          </Field>
          <Field label="采购方式" required>
            <div className="flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground">
              {purchaseMethods[0]}
            </div>
          </Field>
          <Field label="采购联系人" required>
            <input className={inputCls} placeholder="请输入联系人姓名" />
          </Field>
          <Field label="联系方式" required>
            <input className={inputCls} inputMode="tel" placeholder="请输入联系电话" />
          </Field>
          <Field label="是否允许自然人(个人)参与" required>
            <div className="flex h-10 items-center gap-6 text-sm">
              <button
                type="button"
                onClick={() => setAllowPerson(true)}
                className="flex items-center gap-2"
              >
                <span
                  className={`grid size-4 place-items-center rounded-full border ${allowPerson ? "border-primary" : "border-muted-foreground/50"}`}
                >
                  {allowPerson && <span className="size-2 rounded-full bg-primary" />}
                </span>
                是
              </button>
              <button
                type="button"
                onClick={() => setAllowPerson(false)}
                className="flex items-center gap-2"
              >
                <span
                  className={`grid size-4 place-items-center rounded-full border ${!allowPerson ? "border-primary" : "border-muted-foreground/50"}`}
                >
                  {!allowPerson && <span className="size-2 rounded-full bg-primary" />}
                </span>
                否
              </button>
            </div>
          </Field>
          <Field label="竞价人资格条件" required className="lg:col-span-2">
            <div className="space-y-2">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
                <p>1.注册并审核通过成为&quot;盘古循环资源&quot;认证会员;</p>
                <p>2.{allowPerson ? "允许" : "不允许"}以自然人（个人）身份参与报名;</p>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={1000}
                  className={inputCls.replace("h-10", "min-h-24") + " resize-y py-2.5"}
                  placeholder="请输入后续资格条件，沿用序号（如 3.）并以英文分号结尾"
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground/60">0 / 1000</span>
              </div>
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* 交易指南 */}
      <SectionCard title="交易指南">
        <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
          <Field label="报名开始时间" required>
            <input type="datetime-local" className={inputCls} />
          </Field>
          <Field label="报名截止时间" required>
            <input type="datetime-local" className={inputCls} />
          </Field>
          <Field label="投标保证金(元)" required>
            <input className={inputCls} inputMode="numeric" placeholder="请输入投标保证金" />
          </Field>
          <Field label="支付方式" required>
            <select className={selectCls} defaultValue="">
              <option value="" disabled>
                请选择支付方式
              </option>
              {payMethods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="保证金缴纳截止时间" required>
            <input type="datetime-local" className={inputCls} />
          </Field>
          <Field label="非中标保证金的退还" required>
            <input className={inputCls} maxLength={150} placeholder="请输入非中标保证金的退还" />
          </Field>
          <Field label="中标保证金的退还" required>
            <input className={inputCls} maxLength={150} placeholder="请输入中标保证金的退还" />
          </Field>
          <Field label="竞价方式" required>
            <select className={selectCls} defaultValue={bidModes[0]}>
              {bidModes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="竞价开始时间" required>
            <input type="datetime-local" className={inputCls} />
          </Field>
          <Field label="竞价结束时间" required>
            <input type="datetime-local" className={inputCls} />
          </Field>
          <Field label="延时竞价周期(秒)" required>
            <input className={inputCls} inputMode="numeric" placeholder="请输入延时竞价周期(秒)" />
          </Field>
          <Field label="竞价阶梯(元)" required>
            <input className={inputCls} inputMode="numeric" placeholder="请输入竞价阶梯(元)" />
          </Field>
          <Field label="起始价(元)" required>
            <input className={inputCls} inputMode="numeric" placeholder="请输入起始价(元)" />
          </Field>
        </div>
      </SectionCard>

      {/* 物料信息 */}
      <SectionCard title="物料信息">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <Layers />
            新增物料
          </Button>
          <Button variant="outline" size="sm" onClick={addMaterial}>
            <Plus />
            手动新增
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={removeSelected}
            disabled={selected.size === 0}
          >
            <Trash2 />
            删除
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
                <th className="w-14 px-3 py-2.5 text-center">序号</th>
                <th className="w-10 px-2 py-2.5 text-center">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-primary"
                    checked={materials.length > 0 && selected.size === materials.length}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(materials.map((m) => m.id)) : new Set())
                    }
                  />
                </th>
                <th className="px-3 py-2.5 text-left">物料分类</th>
                <th className="px-3 py-2.5 text-left">物料名称</th>
                <th className="px-3 py-2.5 text-left">规格型号</th>
                <th className="w-20 px-3 py-2.5 text-left">单位</th>
                <th className="px-3 py-2.5 text-left">品牌</th>
                <th className="w-24 px-3 py-2.5 text-left">数量</th>
                <th className="px-3 py-2.5 text-left">新旧程度</th>
                <th className="px-3 py-2.5 text-left">详细信息</th>
                <th className="w-16 px-3 py-2.5 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                materials.map((row, i) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-center text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        className="size-3.5 accent-primary"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {row.manual ? (
                        <button
                          type="button"
                          onClick={() => openPickerForRow(row.id)}
                          className={`flex h-8 w-full min-w-28 items-center justify-between gap-1 rounded border border-border bg-background px-2 text-left text-sm outline-none transition-colors hover:border-primary focus:border-primary ${row.category ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          <span className="truncate">{row.category || "请选择"}</span>
                          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      ) : (
                        <span className="inline-block min-w-28 whitespace-nowrap text-sm text-foreground">{row.category}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.name}
                        onChange={(e) => updateMaterial(row.id, { name: e.target.value })}
                        placeholder="请输入"
                        className="h-8 w-full min-w-28 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.spec}
                        onChange={(e) => updateMaterial(row.id, { spec: e.target.value })}
                        placeholder="请输入"
                        className="h-8 w-full min-w-24 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.unit}
                        onChange={(e) => updateMaterial(row.id, { unit: e.target.value })}
                        className="h-8 w-16 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.brand}
                        onChange={(e) => updateMaterial(row.id, { brand: e.target.value })}
                        placeholder="请输入"
                        className="h-8 w-full min-w-24 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.qty}
                        onChange={(e) => updateMaterial(row.id, { qty: e.target.value })}
                        inputMode="numeric"
                        placeholder="0"
                        className="h-8 w-20 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.condition}
                        onChange={(e) => updateMaterial(row.id, { condition: e.target.value })}
                        className="h-8 w-full min-w-24 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      >
                        {materialConditions.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.detail}
                        onChange={(e) => updateMaterial(row.id, { detail: e.target.value })}
                        placeholder="请输入"
                        className="h-8 w-full min-w-28 rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setMaterials((m) => m.filter((x) => x.id !== row.id))}
                        className="text-destructive hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 附件 */}
      <SectionCard title="附件">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            onPickFiles(e.target.files)
            e.target.value = ""
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">点击上传附件</span>
          <span className="text-xs text-muted-foreground">
            支持 PDF、Word、Excel、图片等格式，单个文件不超过 20MB
          </span>
        </button>

        {attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Paperclip className="size-3.5" />
              已上传 {attachments.length} 个附件
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {attachments.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.size} · 上传于 {f.uploadedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(f.id)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    删除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>

      {/* 底部操作条 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          <Button variant="outline">存草稿</Button>
          <Button onClick={onBack}>提交发布</Button>
        </div>
      </div>

      <MaterialPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onConfirm={addMaterialFromPicker} />
    </div>
  )
}
