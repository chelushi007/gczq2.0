import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  className?: string
  render?: (row: T) => React.ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  stickyLastColumn,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  stickyLastColumn?: boolean
}) {
  const lastIndex = columns.length - 1
  const isSticky = (index: number) => Boolean(stickyLastColumn) && index === lastIndex

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 font-medium whitespace-nowrap",
                    isSticky(i) &&
                      "sticky right-0 z-20 bg-muted shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)]",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="group border-b border-border/70 last:border-0 hover:bg-muted/40"
              >
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3 align-middle",
                      isSticky(i) &&
                        "sticky right-0 z-10 bg-card shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] group-hover:bg-muted/40",
                      c.className,
                    )}
                  >
                    {c.render ? c.render(row) : (row[c.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

export function FilterChip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}
