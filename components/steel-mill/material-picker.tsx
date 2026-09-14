"use client"

import { useMemo, useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/shared/modal"
import { scrapCategoryTree } from "@/lib/steel-data"

export interface PickedCategory {
  l1: string
  l2: string
  l3: string
  /** 完整分类路径，如 废钢类 / 重废类 / 优质重废 */
  path: string
}

export function MaterialPicker({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (picked: PickedCategory) => void
}) {
  const [l1Idx, setL1Idx] = useState(0)
  const [l2Idx, setL2Idx] = useState<number | null>(null)
  const [l3, setL3] = useState<string | null>(null)

  const l1 = scrapCategoryTree[l1Idx]
  const l2List = l1?.children ?? []
  const l3List = l2Idx != null ? l2List[l2Idx]?.children ?? [] : []

  const picked = useMemo<PickedCategory | null>(() => {
    if (l2Idx == null || !l3) return null
    return {
      l1: l1.name,
      l2: l2List[l2Idx].name,
      l3,
      path: `${l1.name} / ${l2List[l2Idx].name} / ${l3}`,
    }
  }, [l1, l2List, l2Idx, l3])

  const reset = () => {
    setL1Idx(0)
    setL2Idx(null)
    setL3(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleConfirm = () => {
    if (!picked) return
    onConfirm(picked)
    reset()
  }

  const colHeader = "border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground"
  const rowBase =
    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors"

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="选择废钢分类"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {picked ? (
              <>
                已选：<span className="font-medium text-foreground">{picked.path}</span>
              </>
            ) : (
              "请选择到三级分类"
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={!picked}>
              确定
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-md border border-border">
        {/* 一级分类 */}
        <div className="flex flex-col">
          <div className={colHeader}>一级分类</div>
          <div className="max-h-80 overflow-y-auto">
            {scrapCategoryTree.map((item, i) => {
              const active = i === l1Idx
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setL1Idx(i)
                    setL2Idx(null)
                    setL3(null)
                  }}
                  className={`${rowBase} ${active ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted/60"}`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className={`size-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground/50"}`} />
                </button>
              )
            })}
          </div>
        </div>

        {/* 二级分类 */}
        <div className="flex flex-col">
          <div className={colHeader}>二级分类</div>
          <div className="max-h-80 overflow-y-auto">
            {l2List.map((item, i) => {
              const active = i === l2Idx
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setL2Idx(i)
                    setL3(null)
                  }}
                  className={`${rowBase} ${active ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted/60"}`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className={`size-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground/50"}`} />
                </button>
              )
            })}
          </div>
        </div>

        {/* 三级分类 */}
        <div className="flex flex-col">
          <div className={colHeader}>三级分类</div>
          <div className="max-h-80 overflow-y-auto">
            {l2Idx == null ? (
              <p className="px-4 py-3 text-sm text-muted-foreground/70">请先选择二级分类</p>
            ) : (
              l3List.map((name) => {
                const active = name === l3
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setL3(name)}
                    className={`${rowBase} ${active ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted/60"}`}
                  >
                    <span>{name}</span>
                    {active && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
