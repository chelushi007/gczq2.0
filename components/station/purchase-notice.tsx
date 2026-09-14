"use client"

import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SupplierBidItem } from "@/lib/steel-data"

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={strong ? "text-sm font-semibold text-foreground" : "text-sm text-foreground"}>{value}</span>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

export function PurchaseNotice({ item }: { item: SupplierBidItem }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground text-balance">{item.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            公告编号 {item.id} · 发布单位 {item.buyer}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download />
          下载公告 PDF
        </Button>
      </div>

      {/* 基本信息 */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="采购单位" value={item.buyer} />
          <Field label="废钢类别" value={item.category} strong />
          <Field label="交货区域" value={item.region} />
          <Field label="采购数量" value={item.qty} />
          <Field label="起拍价" value={item.basePrice} strong />
          <Field label="竞价方式" value={item.bidMode} />
          <Field label="报名费" value={item.signupFee} />
          <Field label="投标保证金" value={item.deposit} />
          <Field label="报名截止" value={item.signupEnd} />
          <Field label="竞价开始" value={item.bidStart} />
          <Field label="竞价结束" value={item.bidEnd} />
        </div>
      </div>

      {/* 公告正文 */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <Block title="一、采购标的">
          <p>
            {item.buyer}拟通过盘古循环资源平台以{item.bidMode}方式竞价采购
            {item.category}
            共计 {item.qty}，起拍价 {item.basePrice}。标的物存放于 {item.region}，具体规格及验收标准以随附技术文件为准。
          </p>
        </Block>
        <Block title="二、报名要求">
          <p>
            1. 报名单位须为已在盘古循环资源平台注册并通过认证的会员单位；
            <br />
            2. 报名截止时间为 {item.signupEnd}，逾期不予受理；
            <br />
            3. 报名单位须在报名截止前缴纳报名费 {item.signupFee} 及投标保证金 {item.deposit}，缴费到账后方可参与竞价。
          </p>
        </Block>
        <Block title="三、竞价规则">
          <p>
            本次竞价采用{item.bidMode}，竞价时间为 {item.bidStart} 至 {item.bidEnd}。
            {item.bidMode === "减价竞价"
              ? "报价越低对采购方越有利，系统按报价由低到高排名，最终由采购方择标确定成交单位。"
              : "报价越高越有利，系统按报价由高到低排名，出价最高者优先中标。"}
            竞价结束前若有新报价，将按延时规则顺延竞价结束时间。
          </p>
        </Block>
        <Block title="四、联系方式">
          <p>
            如对本公告有异议或需咨询，请在报名截止前通过平台站内信联系采购单位 {item.buyer} 项目负责人，或拨打平台客服电话 400-888-0000。
          </p>
        </Block>
      </div>
    </div>
  )
}
