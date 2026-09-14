export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string
  desc?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground text-balance">{title}</h2>
        {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  )
}
