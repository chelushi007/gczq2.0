"use client"

import { useState } from "react"
import {
  Home,
  Factory,
  Recycle,
  Truck,
  Settings2,
  Monitor,
  Users,
  Cog,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Wallet,
  Gavel,
  Tag,
  FileSignature,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { workspaceNav, stationTree, type StationTreeNode, type WorkspaceKey, type MillMenuKey } from "@/lib/steel-data"

const groupIcon: Record<string, LucideIcon> = {
  front: Monitor,
  user: Users,
  ops: Cog,
}

const leafIcon: Record<WorkspaceKey, LucideIcon> = {
  "portal-home": Home,
  "portal-steel": Factory,
  mill: Factory,
  station: Recycle,
  supplier: Truck,
  "ops-tbd": Settings2,
}

interface MillNode {
  key: MillMenuKey
  label: string
  icon: LucideIcon
}

const millMenu: { top: MillNode[]; purchase: MillNode[]; bottom: MillNode[] } = {
  top: [{ key: "overview", label: "总览", icon: LayoutDashboard }],
  purchase: [
    { key: "purchase-bidding", label: "竞价回收", icon: Gavel },
    { key: "purchase-fixed", label: "固定价回收", icon: Tag },
    { key: "purchase-agreement", label: "协议回收", icon: FileSignature },
  ],
  bottom: [
    { key: "orders", label: "订单管理", icon: ClipboardList },
    { key: "finance", label: "财务管理", icon: Wallet },
    { key: "suppliers", label: "基地管理", icon: Users },
  ],
}

export type SupplierSub = "enterprise" | "person"

// 用户工作台各子项的占位子菜单（供应商：企业供应商 / 自然人）
const leafSubMenu: Partial<Record<WorkspaceKey, { key: SupplierSub; label: string; icon: LucideIcon }[]>> = {
  supplier: [
    { key: "enterprise", label: "企业供应商", icon: Factory },
    { key: "person", label: "自然人", icon: Users },
  ],
}

export function WorkspaceNav({
  active,
  onSelect,
  millSection,
  onMillSectionChange,
  stationLeaf,
  onStationLeafChange,
  supplierSub,
  onSupplierSubChange,
}: {
  active: WorkspaceKey
  onSelect: (key: WorkspaceKey) => void
  millSection: MillMenuKey
  onMillSectionChange: (key: MillMenuKey) => void
  stationLeaf: string
  onStationLeafChange: (key: string) => void
  supplierSub: SupplierSub
  onSupplierSubChange: (key: SupplierSub) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(true)
  const [openLeaves, setOpenLeaves] = useState<Set<WorkspaceKey>>(new Set(["mill"]))
  // 回收站树形节点的展开状态（默认展开供应商 → 竞价管理）
  const [openStationNodes, setOpenStationNodes] = useState<Set<string>>(
    new Set(["station-supplier", "station-supplier-bidding"]),
  )

  function toggleLeaf(key: WorkspaceKey) {
    setOpenLeaves((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleStationNode(key: string) {
    setOpenStationNodes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // 递归渲染回收站树：有 children 的节点仅作可展开父级，叶子节点点击进入内容
  function StationTree({ nodes, depth }: { nodes: StationTreeNode[]; depth: number }) {
    return (
      <div className="space-y-0.5">
        {nodes.map((node) => {
          const hasChildren = !!node.children?.length
          const isOpen = openStationNodes.has(node.key)
          const isActive = active === "station" && stationLeaf === node.key && !hasChildren
          return (
            <div key={node.key}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleStationNode(node.key)
                  } else {
                    onSelect("station")
                    onStationLeafChange(node.key)
                  }
                }}
                title={node.label}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <span className="flex-1 text-left">{node.label}</span>
                {hasChildren && (
                  <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} />
                )}
              </button>
              {hasChildren && isOpen && (
                <div className="ml-2 mt-0.5 border-l border-sidebar-border pl-2">
                  <StationTree nodes={node.children!} depth={depth + 1} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  function MillBtn({ node }: { node: MillNode }) {
    const isActive = active === "mill" && millSection === node.key
    const Icon = node.icon
    return (
      <button
        onClick={() => {
          onSelect("mill")
          onMillSectionChange(node.key)
        }}
        title={node.label}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
          isActive
            ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">{node.label}</span>
      </button>
    )
  }

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* 顶部品牌 */}
      <div
        className={cn(
          "flex h-14 items-center gap-2 border-b border-sidebar-border px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Factory className="size-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">钢厂专区</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">工作台</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {workspaceNav.map((group) => {
          const GroupIcon = groupIcon[group.id]
          return (
            <div key={group.id} className="mb-4">
              {!collapsed && (
                <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                  {GroupIcon && <GroupIcon className="size-3.5" />}
                  {group.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.children.map((leaf) => {
                  const Icon = leafIcon[leaf.key]
                  const hasMillMenu = leaf.key === "mill"
                  const hasStationTree = leaf.key === "station"
                  const subMenu = leafSubMenu[leaf.key]
                  // 用户工作台下的钢厂/回收站/供应商仅作为可展开父级，不承载页面内容
                  const isParent = (hasMillMenu || hasStationTree || !!subMenu) && group.id === "user"
                  const expandable = isParent
                  // 父级本身永不高亮；是否有子级被选中由子菜单自行控制
                  const isActive = !isParent && active === leaf.key
                  const isOpen = openLeaves.has(leaf.key)
                  const showChildren = expandable && isOpen && !collapsed
                  return (
                    <li key={leaf.key}>
                      <div
                        className={cn(
                          "flex w-full items-center rounded-md text-sm transition-colors",
                          collapsed ? "justify-center" : "pr-1",
                          isActive
                            ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        )}
                      >
                        <button
                          onClick={() => {
                            if (isParent) {
                              if (collapsed) {
                                setCollapsed(false)
                                setOpenLeaves((prev) => new Set(prev).add(leaf.key))
                              } else {
                                toggleLeaf(leaf.key)
                              }
                            } else {
                              onSelect(leaf.key)
                            }
                          }}
                          title={leaf.label}
                          className={cn(
                            "flex flex-1 items-center gap-2.5 py-2",
                            collapsed ? "justify-center px-0" : "px-2.5",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70",
                            )}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{leaf.label}</span>
                              {leaf.desc && !expandable && (
                                <span
                                  className={cn(
                                    "text-[10px]",
                                    isActive ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/50",
                                  )}
                                >
                                  {leaf.desc}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                        {expandable && !collapsed && (
                          <button
                            onClick={() => toggleLeaf(leaf.key)}
                            title={isOpen ? "收起" : "展开"}
                            aria-label={isOpen ? "收起" : "展开"}
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded transition-colors",
                              isActive
                                ? "text-sidebar-primary-foreground/80 hover:bg-sidebar-primary-foreground/15"
                                : "text-sidebar-foreground/50 hover:bg-sidebar-accent",
                            )}
                          >
                            <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                          </button>
                        )}
                      </div>

                      {/* 钢厂：内联展开其工作台子菜单 */}
                      {showChildren && hasMillMenu && (
                        <div className="mb-1 ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                          {millMenu.top.map((n) => (
                            <MillBtn key={n.key} node={n} />
                          ))}

                          <div>
                            <button
                              onClick={() => setPurchaseOpen((v) => !v)}
                              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            >
                              <ShoppingCart className="size-3.5 shrink-0" />
                              <span className="flex-1 text-left">采购管理</span>
                              <ChevronDown
                                className={cn("size-3.5 transition-transform", purchaseOpen && "rotate-180")}
                              />
                            </button>
                            {purchaseOpen && (
                              <div className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
                                {millMenu.purchase.map((n) => (
                                  <MillBtn key={n.key} node={n} />
                                ))}
                              </div>
                            )}
                          </div>

                          {millMenu.bottom.map((n) => (
                            <MillBtn key={n.key} node={n} />
                          ))}
                        </div>
                      )}

                      {/* 回收站：内联展开多层树形菜单（供应商 / 回收商 / 销售方） */}
                      {showChildren && hasStationTree && (
                        <div className="mb-1 ml-4 mt-1 border-l border-sidebar-border pl-3">
                          <StationTree nodes={stationTree} depth={0} />
                        </div>
                      )}

                      {/* 供应商：内联展开占位子菜单 */}
                      {showChildren && subMenu && (
                        <div className="mb-1 ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                          {subMenu.map((n) => {
                            const NIcon = n.icon
                            const subActive = active === leaf.key && supplierSub === n.key
                            return (
                              <button
                                key={n.key}
                                onClick={() => {
                                  onSupplierSubChange(n.key)
                                  onSelect(leaf.key)
                                }}
                                title={n.label}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                                  subActive
                                    ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                )}
                              >
                                <NIcon className="size-3.5 shrink-0" />
                                <span className="flex-1 text-left">{n.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* 底部折叠按钮：整行、紧贴最底部、不突出边缘 */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "展开菜单" : "收起菜单"}
        aria-label={collapsed ? "展开菜单" : "收起菜单"}
        className={cn(
          "flex h-11 shrink-0 items-center gap-2 border-t border-sidebar-border text-[13px] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4 shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="size-4 shrink-0" />
            <span className="flex-1 text-left">收起菜单</span>
          </>
        )}
      </button>
    </aside>
  )
}
