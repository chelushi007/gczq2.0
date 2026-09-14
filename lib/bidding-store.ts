"use client"

// 钢厂竞价数据与回收站（供应商）竞价数据的共享 store。
// 两份数据通过 id 关联，钢厂端「修改公告」后需要同步到回收站端视图。
// 使用模块级状态 + useSyncExternalStore，实现跨组件、跨工作台的实时同步。

import { useSyncExternalStore } from "react"
import {
  biddingList as initialBiddingList,
  supplierBidList as initialSupplierBidList,
  type BiddingItem,
  type SupplierBidItem,
} from "./steel-data"

// 可被「修改公告」编辑的字段
export interface NoticeEditable {
  title: string
  category: string
  region: string
  qty: string
  basePrice: string
  budget: string
  contact: string
  allowPerson: boolean
  signupStart: string
  signupEnd: string
  bidStart: string
  bidEnd: string
}

let millBids: BiddingItem[] = initialBiddingList.map((b) => ({ ...b }))
let supplierBids: SupplierBidItem[] = initialSupplierBidList.map((b) => ({ ...b }))

const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function getMillBids() {
  return millBids
}

export function getSupplierBids() {
  return supplierBids
}

// 报价（起拍价）在钢厂端字段名为 basePrice，同步到供应商端同名字段。
// 修改公告：按 id 更新钢厂竞价项，并把关联字段同步到回收站供应商竞价项。
export function updateNotice(id: string, patch: NoticeEditable) {
  millBids = millBids.map((b) =>
    b.id === id
      ? {
          ...b,
          title: patch.title,
          category: patch.category,
          region: patch.region,
          qty: patch.qty,
          basePrice: patch.basePrice,
          budget: patch.budget,
          contact: patch.contact,
          allowPerson: patch.allowPerson,
          signupStart: patch.signupStart,
          signupEnd: patch.signupEnd,
          bidStart: patch.bidStart,
          bidEnd: patch.bidEnd,
        }
      : b,
  )
  // 同步到回收站供应商竞价数据（共享 id 的记录）
  supplierBids = supplierBids.map((b) =>
    b.id === id
      ? {
          ...b,
          title: patch.title,
          category: patch.category,
          region: patch.region,
          qty: patch.qty,
          basePrice: patch.basePrice,
          signupEnd: patch.signupEnd,
          bidStart: patch.bidStart,
          bidEnd: patch.bidEnd,
        }
      : b,
  )
  emit()
}

export function useMillBids() {
  return useSyncExternalStore(
    subscribe,
    () => millBids,
    () => millBids,
  )
}

export function useSupplierBids() {
  return useSyncExternalStore(
    subscribe,
    () => supplierBids,
    () => supplierBids,
  )
}
