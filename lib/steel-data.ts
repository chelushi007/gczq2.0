// 钢厂专区频道 - 静态原型数据

export type WorkspaceKey =
  | "portal-home"
  | "portal-steel"
  | "mill"
  | "station"
  | "supplier"
  | "ops-tbd"

export interface NavLeaf {
  key: WorkspaceKey
  label: string
  desc?: string
}

export interface NavGroup {
  id: string
  label: string
  children: NavLeaf[]
}

// 中间栏「钢厂专区」菜单：前台 / 用户工作台 / 运营工作台
export const workspaceNav: NavGroup[] = [
  {
    id: "portal",
    label: "门户",
    children: [
      { key: "portal-home", label: "首页", desc: "盘古循环资源" },
      { key: "portal-steel", label: "钢厂专区", desc: "专区频道" },
    ],
  },
  {
    id: "user",
    label: "用户工作台",
    children: [
      { key: "mill", label: "钢厂", desc: "采购方" },
      { key: "station", label: "回收基地", desc: "供货 / 采购" },
      { key: "supplier", label: "供应商", desc: "企业 / 自然人" },
    ],
  },
  {
    id: "ops",
    label: "运营工作台",
    children: [{ key: "ops-tbd", label: "待定", desc: "规划中" }],
  },
]

// 最左侧「钢厂专区设计稿」导航（原型索引）
export const designNav: { key: WorkspaceKey; label: string }[] = [
  { key: "portal-home", label: "门户 · 首页" },
  { key: "portal-steel", label: "门户 · 钢厂专区" },
  { key: "mill", label: "工作台 · 钢厂" },
  { key: "station", label: "工作台 · 回收基地" },
  { key: "supplier", label: "工作台 · 供应商" },
  { key: "ops-tbd", label: "运营工作台" },
]

// ---------- 钢厂工作台内部菜单 ----------
export type MillMenuKey =
  | "overview"
  | "purchase-bidding"
  | "purchase-fixed"
  | "purchase-agreement"
  | "orders"
  | "finance"
  | "suppliers"

// ---------- 回收站工作台树形菜单（可多层嵌套） ----------
export interface StationTreeNode {
  key: string
  label: string
  children?: StationTreeNode[]
}

// 回收站下级：供应商 / 回收商 / 销售方
// 其中「供应商」下含「竞价管理」，竞价管理展开含五个业务项
export const stationTree: StationTreeNode[] = [
  { key: "station-overview", label: "总览" },
  {
    key: "station-supplier",
    label: "供应商",
    children: [
      {
        key: "station-supplier-bidding",
        label: "竞价管理",
        children: [
          { key: "station-supplier-bidding-signup", label: "网上报名" },
          { key: "station-supplier-bidding-mine", label: "我的竞价" },
          { key: "station-supplier-bidding-fee", label: "缴纳报名费" },
          { key: "station-supplier-bidding-deposit", label: "缴纳保证金" },
          { key: "station-supplier-bidding-service", label: "缴纳服务费" },
        ],
      },
      {
        key: "station-supplier-fixed",
        label: "固定价管理",
        children: [
          { key: "station-supplier-fixed-quote", label: "网上报价" },
          { key: "station-supplier-fixed-mine", label: "我的报价" },
          { key: "station-supplier-fixed-service", label: "缴纳服务费" },
        ],
      },
      {
        key: "station-supplier-agreement",
        label: "协议回收",
        children: [{ key: "station-supplier-agreement-confirm", label: "协议单确认" }],
      },
      { key: "station-supplier-orders", label: "订单管理" },
      { key: "station-supplier-base", label: "基地管理" },
    ],
  },
  {
    key: "station-recycler",
    label: "回收商",
    children: [
      {
        key: "station-recycler-purchase",
        label: "采购管理",
        children: [
          { key: "station-recycler-purchase-bidding", label: "竞价回收" },
          { key: "station-recycler-purchase-fixed", label: "固定价回收" },
          { key: "station-recycler-purchase-agreement", label: "协议回收" },
        ],
      },
      { key: "station-recycler-orders", label: "订单管理" },
      {
        key: "station-recycler-finance",
        label: "财务管理",
        children: [
          { key: "station-recycler-finance-payment", label: "费用支付" },
          { key: "station-recycler-finance-reverse", label: "反向开票" },
        ],
      },
    ],
  },
  {
    key: "station-seller",
    label: "销售",
  },
]

// 回收站叶子节点 -> 面包屑路径（父级链），用于内容页标题与面包屑
export const stationLeafPath: Record<string, string[]> = {
  "station-overview": ["总览"],
  "station-supplier-bidding-signup": ["供应商", "竞价管理", "网上报名"],
  "station-supplier-bidding-mine": ["供应商", "竞价管理", "我的竞价"],
  "station-supplier-bidding-fee": ["供应商", "竞价管理", "缴纳报名费"],
  "station-supplier-bidding-deposit": ["供应商", "竞价管理", "缴纳保证金"],
  "station-supplier-bidding-service": ["供应商", "竞价管理", "缴纳服务费"],
  "station-supplier-fixed-quote": ["供应商", "固定价管理", "网上报价"],
  "station-supplier-fixed-mine": ["供应商", "固定价管理", "我的报价"],
  "station-supplier-fixed-service": ["供应商", "固定价管理", "缴纳服务费"],
  "station-supplier-agreement-confirm": ["供应商", "协议回收", "协议单确认"],
  "station-supplier-orders": ["供应商", "订单管理"],
  "station-supplier-base": ["供应商", "基地管理"],
  "station-recycler": ["回收商"],
  "station-recycler-purchase-bidding": ["回收商", "采购管理", "竞价回收"],
  "station-recycler-purchase-fixed": ["回收商", "采购管理", "固定价回收"],
  "station-recycler-purchase-agreement": ["回收商", "采购管理", "协议回收"],
  "station-recycler-orders": ["回收商", "订单管理"],
  "station-recycler-finance-payment": ["回收商", "财务管理", "费用支付"],
  "station-recycler-finance-reverse": ["回收商", "财务管理", "反向开票"],
  "station-seller": ["销售方"],
}

// ---------- 概览统计 ----------
export const overviewStats = [
  { label: "进行中采购需求", value: "18", unit: "单", trend: "+3", tone: "primary" },
  { label: "待处理报价", value: "42", unit: "条", trend: "+12", tone: "amber" },
  { label: "本月采购量", value: "6,820", unit: "吨", trend: "+8.4%", tone: "green" },
  { label: "合作供应商", value: "56", unit: "家", trend: "+2", tone: "violet" },
] as const

export const purchaseChannelStats = [
  { name: "竞价回收", count: 8, amount: "3,120 吨" },
  { name: "固定价回收", count: 6, amount: "2,050 吨" },
  { name: "协议回收", count: 4, amount: "1,650 吨" },
]

export const recentActivities = [
  { time: "10:24", text: "竞价单 JJ20260907-003 收到「华东再生」报价 ¥2,650/吨", type: "报价" },
  { time: "09:50", text: "固定价单 GD20260907-011 已被「城南回收站」接单", type: "接单" },
  { time: "09:12", text: "协议单 XY20260906-002 结算单待确认", type: "结算" },
  { time: "昨天", text: "新供应商「盛通金属」提交合作申请，待审核", type: "审核" },
  { time: "昨天", text: "订单 DD20260905-007 合同已双方签署", type: "合同" },
]

// ---------- 竞价回收 ----------
export interface BiddingItem {
  id: string
  title: string
  category: string
  region: string
  qty: string
  basePrice: string
  budget: string
  purchaseMethod: string
  contact: string
  allowPerson: boolean
  quotes: number
  topQuote: string
  publishTime: string
  signupStart: string
  signupEnd: string
  bidStart: string
  bidEnd: string
  deadline: string
  status: "待审核" | "进行中" | "待开标" | "已成交" | "已流标" | "已下架"
}

export const biddingList: BiddingItem[] = [
  { id: "JJ20260907-003", title: "重型废钢竞价采购公告", category: "重废", region: "江苏·苏州", qty: "500 吨", basePrice: "¥2,500/吨", budget: "¥1,250,000", purchaseMethod: "公开竞价", contact: "张工 138****2043", allowPerson: false, quotes: 6, topQuote: "¥2,650/吨", publishTime: "09-04 16:30", signupStart: "09-05 09:00", signupEnd: "09-07 17:00", bidStart: "09-08 09:00", bidEnd: "09-08 18:00", deadline: "09-08 18:00", status: "进行中" },
  { id: "JJ20260907-001", title: "冲花板料竞价采购公告", category: "统废", region: "上海·宝山", qty: "300 吨", basePrice: "¥2,380/吨", budget: "¥714,000", purchaseMethod: "公开竞价", contact: "李工 139****7781", allowPerson: false, quotes: 4, topQuote: "¥2,455/吨", publishTime: "09-04 14:10", signupStart: "09-05 09:00", signupEnd: "09-07 12:00", bidStart: "09-08 09:00", bidEnd: "09-08 12:00", deadline: "09-08 12:00", status: "进行中" },
  { id: "JJ20260906-008", title: "生铁边角料竞价公告", category: "生铁", region: "浙江·嘉兴", qty: "200 吨", basePrice: "¥2,900/吨", budget: "¥580,000", purchaseMethod: "公开竞价", contact: "赵工 137****5502", allowPerson: true, quotes: 3, topQuote: "—", publishTime: "09-03 10:20", signupStart: "09-04 09:00", signupEnd: "09-06 17:00", bidStart: "09-07 14:00", bidEnd: "09-07 20:00", deadline: "09-07 20:00", status: "待开标" },
  { id: "JJ20260905-004", title: "钢筋头竞价采购公告", category: "重废", region: "江苏·无锡", qty: "420 吨", basePrice: "¥2,450/吨", budget: "¥1,029,000", purchaseMethod: "公开竞价", contact: "陈工 136****1188", allowPerson: false, quotes: 9, topQuote: "¥2,620/吨", publishTime: "09-02 11:40", signupStart: "09-03 09:00", signupEnd: "09-05 12:00", bidStart: "09-06 09:00", bidEnd: "09-06 18:00", deadline: "09-06 18:00", status: "已成交" },
  { id: "JJ20260904-002", title: "马达铁竞价采购公告", category: "统废", region: "安徽·马鞍山", qty: "150 吨", basePrice: "¥2,300/吨", budget: "¥345,000", purchaseMethod: "公开竞价", contact: "王工 135****9920", allowPerson: true, quotes: 1, topQuote: "—", publishTime: "09-01 15:00", signupStart: "09-02 09:00", signupEnd: "09-04 12:00", bidStart: "09-05 09:00", bidEnd: "09-05 18:00", deadline: "09-05 18:00", status: "已流标" },
  { id: "JJ20260908-006", title: "废旧模具钢竞价采购公告", category: "重废", region: "江苏·苏州", qty: "260 吨", basePrice: "¥2,700/吨", budget: "¥702,000", purchaseMethod: "公开竞价", contact: "周工 138****4417", allowPerson: false, quotes: 0, topQuote: "—", publishTime: "09-08 10:15", signupStart: "09-09 09:00", signupEnd: "09-11 17:00", bidStart: "09-12 09:00", bidEnd: "09-12 18:00", deadline: "09-12 18:00", status: "待审核" },
  { id: "JJ20260903-005", title: "轻薄料竞价采购公告", category: "统废", region: "浙江·嘉兴", qty: "180 吨", basePrice: "¥2,260/吨", budget: "¥406,800", purchaseMethod: "公开竞价", contact: "孙工 139****2288", allowPerson: true, quotes: 2, topQuote: "—", publishTime: "09-02 09:40", signupStart: "09-03 09:00", signupEnd: "09-04 17:00", bidStart: "09-05 09:00", bidEnd: "09-05 18:00", deadline: "09-05 18:00", status: "已下架" },
]

// 竞价发布表单选项
export const purchaseMethods = ["公开竞价"]
export const bidModes = ["多轮次报价(减价竞价)", "一次性密封报价"]
export const payMethods = ["线上支付", "银行转账", "银行保函", "免收保证金"]
export const materialConditions = ["全新", "九成新", "八成新", "七成新及以下", "废旧"]
export const materialCategories = ["重废", "统废", "生铁", "废铁", "废钢筋", "其他"]

// 废钢三级分类树（新增物料弹窗使用）
export interface ScrapCategoryL1 {
  name: string
  children: { name: string; children: string[] }[]
}

export const scrapCategoryTree: ScrapCategoryL1[] = [
  {
    name: "废钢类",
    children: [
      { name: "重废类", children: ["优质重废", "重废"] },
      { name: "中轻废类", children: ["中重废", "中废", "剪切料", "轻废"] },
      { name: "颗粒/特殊成型料", children: ["钢筋切粒", "马蹄铁", "破碎废钢"] },
      { name: "打包料类", children: ["优质碳钢打包料", "三级打包料", "四级打包料"] },
      { name: "铁屑类", children: ["钢屑", "铁屑"] },
      { name: "大件毛料", children: ["优质重废毛料", "重废毛料", "中废毛料"] },
      { name: "型材/建筑毛料", children: ["架子管毛料"] },
      { name: "混杂毛料", children: ["剪切毛料", "统料毛料", "彩涂毛料"] },
      { name: "不锈钢系列", children: ["不锈钢304", "不锈钢316"] },
      { name: "其他合金钢", children: ["合金钢废钢"] },
    ],
  },
]

// ---------- 供应商视角：竞价管理 ----------
// 供应商是竞价的参与方：报名 → 缴报名费/保证金 → 报价竞价 → 中标 → 缴服务费/结算
export interface SupplierBidItem {
  id: string
  title: string
  buyer: string // 采购单位（钢厂）
  category: string
  region: string
  qty: string
  basePrice: string // 起拍价
  bidMode: string // 竞价方式
  signupEnd: string // 报名截止
  bidStart: string
  bidEnd: string
  signupFee: string // 报名费
  deposit: string // 保证金
  signupStatus: "未报名" | "报名待审" | "报名通过" | "报名驳回"
  feeStatus: "未缴" | "已缴" | "免缴"
  depositStatus: "未缴" | "已缴" | "已退还"
  myQuote: string // 我的最新报价
  myRank: string // 我的当前排名
  quotes: number // 参与家数
  result: "报名中" | "竞价中" | "已中标" | "未中标" | "待开标"
}

export const supplierBidList: SupplierBidItem[] = [
  { id: "JJ20260907-003", title: "重型废钢竞价采购公告", buyer: "华东特钢集团", category: "重废", region: "江苏·苏州", qty: "500 吨", basePrice: "¥2,500/吨", bidMode: "减价竞价", signupEnd: "09-07 17:00", bidStart: "09-08 09:00", bidEnd: "09-08 18:00", signupFee: "¥500", deposit: "¥50,000", signupStatus: "报名通过", feeStatus: "已缴", depositStatus: "已缴", myQuote: "¥2,480/吨", myRank: "第 1 名", quotes: 6, result: "竞价中" },
  { id: "JJ20260907-001", title: "冲花板料竞价采购公告", buyer: "宝武钢铁", category: "统废", region: "上海·宝山", qty: "300 吨", basePrice: "¥2,380/吨", bidMode: "减价竞价", signupEnd: "09-07 12:00", bidStart: "09-08 09:00", bidEnd: "09-08 12:00", signupFee: "¥500", deposit: "¥30,000", signupStatus: "报名通过", feeStatus: "已缴", depositStatus: "已缴", myQuote: "¥2,410/吨", myRank: "第 2 名", quotes: 4, result: "竞价中" },
  { id: "JJ20260905-004", title: "钢筋头竞价采购公告", buyer: "沙钢集团", category: "重废", region: "江苏·无锡", qty: "420 吨", basePrice: "¥2,450/吨", bidMode: "减价竞价", signupEnd: "09-05 12:00", bidStart: "09-06 09:00", bidEnd: "09-06 18:00", signupFee: "¥500", deposit: "¥42,000", signupStatus: "报名通过", feeStatus: "已缴", depositStatus: "已退还", myQuote: "¥2,510/吨", myRank: "第 1 名", quotes: 9, result: "已中标" },
  { id: "JJ20260904-009", title: "汽车压块竞价回收公告", buyer: "中天钢铁", category: "统废", region: "江苏·常州", qty: "350 吨", basePrice: "¥3,050/吨", bidMode: "减价竞价", signupEnd: "09-04 12:00", bidStart: "09-05 09:00", bidEnd: "09-05 18:00", signupFee: "¥500", deposit: "¥35,000", signupStatus: "报名通过", feeStatus: "已缴", depositStatus: "已退还", myQuote: "¥3,120/吨", myRank: "第 4 名", quotes: 7, result: "未中标" },
  { id: "JJ20260908-006", title: "废旧钢结构竞价公告", buyer: "永钢集团", category: "重废", region: "江苏·张家港", qty: "600 吨", basePrice: "¥2,420/吨", bidMode: "减价竞价", signupEnd: "09-09 17:00", bidStart: "09-10 09:00", bidEnd: "09-10 18:00", signupFee: "¥500", deposit: "¥60,000", signupStatus: "未报名", feeStatus: "未缴", depositStatus: "未缴", myQuote: "—", myRank: "—", quotes: 2, result: "报名中" },
]

export const supplierBidResultTone: Record<SupplierBidItem["result"], "primary" | "green" | "gray" | "amber"> = {
  报名中: "amber",
  竞价中: "primary",
  待开标: "gray",
  已中标: "green",
  未中标: "gray",
}

// ---------- 供应商视角：固定价管理 ----------
  // 固定价（一口价）由采购方设定，供应商按一口价在线报价（申报可供量）→ 采购方确认 → 成交送货 → 缴服务费结算
// 固定价不收报名费、不收保证金，仅在成交后缴纳平台服务费
export interface SupplierFixedItem {
  id: string // 固定价单号
  title: string
  buyer: string // 采购单位
  category: string
  region: string
  price: string // 一口价
  planQty: string // 计划采购量
  remainQty: string // 剩余可接量
  validUntil: string // 报价有效期
  myQty: string // 我的报价量（申报可供量）
  myAmount: string // 我的预计成交金额
  serviceFee: string // 服务费（成交后按量计）
  quoteStatus: "未报价" | "待确认" | "已成交" | "已拒绝"
  serviceStatus: "未缴" | "已缴" | "—"
}

export const supplierFixedList: SupplierFixedItem[] = [
  { id: "GD20260907-011", title: "统一价收重废", buyer: "南京盘古钢铁有限公司", category: "重废", region: "江苏·南京", price: "¥2,560/吨", planQty: "1,000 吨", remainQty: "680 吨", validUntil: "2026-09-15", myQty: "200 吨", myAmount: "¥512,000", serviceFee: "¥1,600", quoteStatus: "已成交", serviceStatus: "未缴" },
  { id: "GD20260907-005", title: "一口价收统废", buyer: "南京盘古钢铁有限公司", category: "统废", region: "江苏·苏州", price: "¥2,410/吨", planQty: "600 吨", remainQty: "600 吨", validUntil: "2026-09-12", myQty: "150 吨", myAmount: "¥361,500", serviceFee: "¥1,200", quoteStatus: "待确认", serviceStatus: "—" },
  { id: "GD20260906-009", title: "一口价收生铁", buyer: "华东特钢集团", category: "生铁", region: "安徽·马鞍山", price: "¥2,950/吨", planQty: "400 吨", remainQty: "0 吨", validUntil: "2026-09-10", myQty: "400 吨", myAmount: "¥1,180,000", serviceFee: "¥3,200", quoteStatus: "已成交", serviceStatus: "已缴" },
  { id: "GD20260905-002", title: "一口价收钢筋头", buyer: "沙钢集团", category: "重废", region: "江苏·无锡", price: "¥2,480/吨", planQty: "500 吨", remainQty: "0 吨", validUntil: "2026-09-08", myQty: "120 吨", myAmount: "¥297,600", serviceFee: "¥960", quoteStatus: "已拒绝", serviceStatus: "—" },
  { id: "GD20260908-013", title: "一口价收中重废", buyer: "南京盘古钢铁有限公司", category: "重废", region: "江苏·南京", price: "¥2,530/吨", planQty: "700 吨", remainQty: "700 吨", validUntil: "2026-09-18", myQty: "—", myAmount: "—", serviceFee: "—", quoteStatus: "未报价", serviceStatus: "—" },
  { id: "GD20260908-020", title: "一口价收轻薄料", buyer: "中天钢铁", category: "统废", region: "江苏·常州", price: "¥2,300/吨", planQty: "450 吨", remainQty: "450 吨", validUntil: "2026-09-20", myQty: "—", myAmount: "—", serviceFee: "—", quoteStatus: "未报价", serviceStatus: "—" },
]

export const supplierFixedTone: Record<SupplierFixedItem["quoteStatus"], "primary" | "green" | "gray" | "amber"> = {
  未报价: "gray",
  待确认: "amber",
  已成交: "green",
  已拒绝: "gray",
}

// ---------- 固定价回收 ----------
export interface FixedItem {
  id: string
  title: string
  category: string
  qty: string
  price: string
  taken: string
  validUntil: string
  region: string
  unit: string
  contact: string
  publishTime: string
  status: "待审核" | "挂单中" | "部分成交" | "已完成" | "已下架"
}

export const fixedList: FixedItem[] = [
  { id: "GD20260907-011", title: "统一价收重废", category: "重废", qty: "1,000 吨", price: "¥2,560/吨", taken: "320 吨", validUntil: "2026-09-15", region: "江苏 南京", unit: "南京盘古钢铁有限公司", contact: "王工 138****6621", publishTime: "2026-09-07 09:20", status: "部分成交" },
  { id: "GD20260907-005", title: "一口价收统废", category: "统废", qty: "600 吨", price: "¥2,410/吨", taken: "0 吨", validUntil: "2026-09-12", region: "江苏 苏州", unit: "南京盘古钢铁有限公司", contact: "李工 139****3308", publishTime: "2026-09-07 14:05", status: "挂单中" },
  { id: "GD20260906-009", title: "一口价收生铁", category: "生铁", qty: "400 吨", price: "¥2,950/吨", taken: "400 吨", validUntil: "2026-09-10", region: "安徽 马鞍山", unit: "南京盘古钢铁有限公司", contact: "王工 138****6621", publishTime: "2026-09-06 10:40", status: "已完成" },
  { id: "GD20260905-002", title: "一口价收钢筋头", category: "重废", qty: "500 吨", price: "¥2,480/吨", taken: "500 吨", validUntil: "2026-09-08", region: "江苏 无锡", unit: "南京盘古钢铁有限公司", contact: "赵工 137****9902", publishTime: "2026-09-05 16:15", status: "已完成" },
  { id: "GD20260904-007", title: "一口价收剪切料", category: "统废", qty: "800 吨", price: "¥2,430/吨", taken: "150 吨", validUntil: "2026-09-06", region: "江苏 常州", unit: "南京盘古钢铁有限公司", contact: "李工 139****3308", publishTime: "2026-09-04 11:30", status: "已下架" },
  { id: "GD20260908-013", title: "一口价收中重废", category: "重废", qty: "700 吨", price: "¥2,530/吨", taken: "0 吨", validUntil: "2026-09-18", region: "江苏 南京", unit: "南京盘古钢铁有限公司", contact: "周工 138****4417", publishTime: "2026-09-08 09:50", status: "待审核" },
]

// ---------- 协议回收 ----------
// 协议回收：采购方与供应商提前签署长期协议，采购方按协议发起采购指令单，
// 供应商在线确认接单即可，无需竞价或报价。
export interface AgreementOrder {
  orderId: string
  category: string
  qty: string
  price: string
  amount: string
  deliverBy: string
  sentAt: string
  status: "待供应商确认" | "供应商已确认" | "供应商已拒绝" | "已完成"
}

// 协议单指定的供应商及其确认情况
export interface AgreementSupplier {
  name: string
  contact: string
  confirm: "待确认" | "已确认" | "已拒绝"
  confirmedAt?: string
}

export interface AgreementItem {
  id: string
  title: string
  suppliers: AgreementSupplier[]
  category: string
  monthlyQty: string
  price: string
  period: string
  signedAt: string
  deliverBy: string
  status: "已发单" | "待确认" | "已确认" | "已下架"
  orders: AgreementOrder[]
}

export const agreementList: AgreementItem[] = [
  {
    id: "XY20260906-002",
    title: "重废统废长协采购单（9月）",
    suppliers: [
      { name: "城南再生资源回收站", contact: "王志强 138-0000-1122", confirm: "待确认" },
      { name: "环宇物资回收站", contact: "赵敏 137-0000-5566", confirm: "已确认", confirmedAt: "2026-09-06 15:20" },
    ],
    category: "重废 / 统废",
    monthlyQty: "≥ 800 吨/月",
    price: "随行就市 -2%",
    period: "2026-01 ~ 2026-12",
    signedAt: "2025-12-20",
    deliverBy: "2026-09-15",
    status: "待确认",
    orders: [
      { orderId: "XYD20260908-021", category: "重废", qty: "300 吨", price: "¥2,620/吨", amount: "¥786,000", deliverBy: "2026-09-15", sentAt: "2026-09-08 09:20", status: "待供应商确认" },
      { orderId: "XYD20260901-018", category: "统废", qty: "260 吨", price: "¥2,410/吨", amount: "¥626,600", deliverBy: "2026-09-06", sentAt: "2026-09-01 10:05", status: "供应商已确认" },
      { orderId: "XYD20260820-011", category: "重废", qty: "320 吨", price: "¥2,590/吨", amount: "¥828,800", deliverBy: "2026-08-26", sentAt: "2026-08-20 14:30", status: "已完成" },
    ],
  },
  {
    id: "XY20260901-004",
    title: "生铁固定价长协采购单",
    suppliers: [{ name: "盛通金属有限公司", contact: "李国栋 139-0000-3344", confirm: "已确认", confirmedAt: "2026-09-07 11:40" }],
    category: "生铁",
    monthlyQty: "≥ 300 吨/月",
    price: "固定 ¥2,900/吨",
    period: "2026-03 ~ 2027-02",
    signedAt: "2026-02-25",
    deliverBy: "2026-09-14",
    status: "已确认",
    orders: [
      { orderId: "XYD20260907-020", category: "生铁", qty: "300 吨", price: "¥2,900/吨", amount: "¥870,000", deliverBy: "2026-09-14", sentAt: "2026-09-07 11:15", status: "供应商已确认" },
      { orderId: "XYD20260903-016", category: "生铁", qty: "200 吨", price: "¥2,900/吨", amount: "¥580,000", deliverBy: "2026-09-05", sentAt: "2026-09-03 08:40", status: "供应商已拒绝" },
    ],
  },
  {
    id: "XY20260830-001",
    title: "统废多商协议采购单",
    suppliers: [
      { name: "环宇物资回收站", contact: "赵敏 137-0000-5566", confirm: "待确认" },
      { name: "城南再生资源回收站", contact: "王志强 138-0000-1122", confirm: "待确认" },
      { name: "利民废旧金属", contact: "孙伟 136-0000-7788", confirm: "待确认" },
    ],
    category: "统废",
    monthlyQty: "≥ 500 吨/月",
    price: "随行就市 -1.5%",
    period: "2026-09 ~ 2027-08",
    signedAt: "2026-08-28",
    deliverBy: "2026-09-20",
    status: "已发单",
    orders: [],
  },
  {
    id: "XY20251201-006",
    title: "重废固定价协议采购单",
    suppliers: [{ name: "利民废旧金属", contact: "孙伟 136-0000-7788", confirm: "已确认", confirmedAt: "2025-12-02 09:00" }],
    category: "重废",
    monthlyQty: "≥ 400 吨/月",
    price: "固定 ¥2,500/吨",
    period: "2025-01 ~ 2025-12",
    signedAt: "2024-12-18",
    deliverBy: "2025-11-26",
    status: "已下架",
    orders: [
      { orderId: "XYD20251120-009", category: "重废", qty: "400 吨", price: "¥2,500/吨", amount: "¥1,000,000", deliverBy: "2025-11-26", sentAt: "2025-11-20 16:00", status: "已完成" },
    ],
  },
]

// 协议回收可指定的候选供应商（新建协议单时选择一家或多家）
export const agreementSupplierPool = [
  { name: "城南再生资源回收站", contact: "王志强 138-0000-1122" },
  { name: "环宇物资回收站", contact: "赵敏 137-0000-5566" },
  { name: "盛通金属有限公司", contact: "李国栋 139-0000-3344" },
  { name: "利民废旧金属", contact: "孙伟 136-0000-7788" },
  { name: "鑫源钢铁物资", contact: "周涛 135-0000-9900" },
  { name: "宏达再生资源", contact: "吴强 134-0000-2211" },
]

// ---------- 订单管理（含结算与合同） ----------
export interface OrderItem {
  id: string
  supplier: string
  channel: "竞价" | "固定价" | "协议"
  category: string
  qty: string
  unitPrice: string
  // 协议成交按周期结算，无固定订单金额，amount 为 null
  amount: string | null
  region: string
  status: "履约中" | "履约结束"
  createdAt: string
  deliveryDate: string
  }
  
  export const orderList: OrderItem[] = [
  { id: "DD20260907-013", supplier: "华东再生资源", channel: "竞价", category: "重废", qty: "500 吨", unitPrice: "¥2,650/吨", amount: "¥1,325,000", region: "江苏·苏州", status: "履约中", createdAt: "2026-09-07", deliveryDate: "2026-09-15" },
  { id: "DD20260906-010", supplier: "城南再生资源回收站", channel: "协议", category: "统废", qty: "820 吨", unitPrice: "¥2,405/吨", amount: null, region: "江苏·苏州", status: "履约中", createdAt: "2026-09-06", deliveryDate: "2026-09-30" },
  { id: "DD20260905-007", supplier: "盛通金属有限公司", channel: "固定价", category: "生铁", qty: "400 吨", unitPrice: "¥2,950/吨", amount: "¥1,180,000", region: "上海·宝山", status: "履约结束", createdAt: "2026-09-05", deliveryDate: "2026-09-10" },
  { id: "DD20260904-005", supplier: "张建国（自然人）", channel: "固定价", category: "统废", qty: "35 吨", unitPrice: "¥2,410/吨", amount: "¥84,350", region: "江苏·无锡", status: "履约结束", createdAt: "2026-09-04", deliveryDate: "2026-09-08" },
  { id: "DD20260903-002", supplier: "环宇物资回收站", channel: "竞价", category: "重废", qty: "420 吨", unitPrice: "¥2,620/吨", amount: "¥1,100,400", region: "浙江·嘉兴", status: "履约中", createdAt: "2026-09-03", deliveryDate: "2026-09-12" },
  { id: "DD20260902-018", supplier: "城南再生资源回收站", channel: "协议", category: "重废", qty: "1,200 吨", unitPrice: "¥2,660/吨", amount: null, region: "江苏·苏州", status: "履约结束", createdAt: "2026-09-02", deliveryDate: "2026-09-25" },
  { id: "DD20260901-006", supplier: "盛通金属有限公司", channel: "竞价", category: "生铁", qty: "300 吨", unitPrice: "¥2,900/吨", amount: "¥870,000", region: "上海·宝山", status: "履约中", createdAt: "2026-09-01", deliveryDate: "2026-09-09" },
  ]

// ---------- 财务管理 · 费用支付（费用类型：货款） ----------
export interface PaymentBill {
  id: string
  feeType: "货款"
  orderId: string
  payee: string
  category: string
  qty: string
  amount: string
  period: string
  method: "线上支付" | "线下转账"
  status: "待支付" | "支付中" | "已支付"
  applyDate: string
  payDate: string | null
  invoiceStatus: "未开票" | "已开票" | "已收票"
}

export const paymentBills: PaymentBill[] = [
  { id: "FK20260907-013", feeType: "货款", orderId: "DD20260907-013", payee: "华东再生资源", category: "重废", qty: "500 吨", amount: "¥1,325,000", period: "一次性结清", method: "线上支付", status: "待支付", applyDate: "2026-09-08", payDate: null, invoiceStatus: "已开票" },
  { id: "FK20260906-010", feeType: "货款", orderId: "DD20260906-010", payee: "城南再生资源回收站", category: "统废", qty: "820 吨", amount: "¥1,972,100", period: "2026-09（按月）", method: "线下转账", status: "支付中", applyDate: "2026-09-07", payDate: null, invoiceStatus: "已开票" },
  { id: "FK20260905-007", feeType: "货款", orderId: "DD20260905-007", payee: "盛通金属有限公司", category: "生铁", qty: "400 吨", amount: "¥1,180,000", period: "一次性结清", method: "线上支付", status: "已支��", applyDate: "2026-09-05", payDate: "2026-09-06", invoiceStatus: "已收票" },
  { id: "FK20260904-005", feeType: "货款", orderId: "DD20260904-005", payee: "张建国（自然人）", category: "重废", qty: "35 吨", amount: "¥84,350", period: "一次性结清", method: "线上支付", status: "已支付", applyDate: "2026-09-04", payDate: "2026-09-05", invoiceStatus: "已收票" },
  { id: "FK20260903-002", feeType: "货款", orderId: "DD20260903-002", payee: "环宇物资回收站", category: "重废", qty: "420 吨", amount: "¥1,100,400", period: "一次性结清", method: "线下转账", status: "待支付", applyDate: "2026-09-03", payDate: null, invoiceStatus: "未开票" },
  { id: "FK20260902-018", feeType: "货款", orderId: "DD20260902-018", payee: "城南再生资源回收站", category: "重废", qty: "1,200 吨", amount: "¥3,192,000", period: "2026-09（按月）", method: "线下转账", status: "已支付", applyDate: "2026-09-02", payDate: "2026-09-03", invoiceStatus: "已收票" },
]

export interface InvoiceRecord {
  id: string
  billId: string
  title: string
  taxNo: string
  type: "增值税专用发票" | "增值税普通发票"
  amount: string
  taxRate: string
  issueDate: string
  status: "待开具" | "已开具" | "已认证"
}

export const invoiceRecords: InvoiceRecord[] = [
  { id: "FP20260907-013", billId: "FK20260907-013", title: "华东特钢集团有限公司", taxNo: "91320500MA1X****3K", type: "增值税专用发票", amount: "¥1,325,000", taxRate: "13%", issueDate: "2026-09-08", status: "已开具" },
  { id: "FP20260906-010", billId: "FK20260906-010", title: "华东特钢集团有限公司", taxNo: "91320500MA1X****3K", type: "增值税专用发票", amount: "¥1,972,100", taxRate: "13%", issueDate: "2026-09-07", status: "已开具" },
  { id: "FP20260905-007", billId: "FK20260905-007", title: "华东特钢集团有限公司", taxNo: "91320500MA1X****3K", type: "增值税专用发票", amount: "¥1,180,000", taxRate: "13%", issueDate: "2026-09-06", status: "已认证" },
  { id: "FP20260904-005", billId: "FK20260904-005", title: "华东特钢集团有限公司", taxNo: "91320500MA1X****3K", type: "增值税普通发票", amount: "¥84,350", taxRate: "3%", issueDate: "2026-09-05", status: "已认证" },
  { id: "FP20260902-018", billId: "FK20260902-018", title: "华东特钢集团有限公司", taxNo: "91320500MA1X****3K", type: "增值税专用发票", amount: "¥3,192,000", taxRate: "13%", issueDate: "2026-09-03", status: "已认证" },
]

// ---------- 财务管理 · 反向开票（采购方为自然人代开发票，需调用国家金税系统校验年度额度） ----------
// 自然人年度反向开票限额：500 万元
export const REVERSE_ANNUAL_LIMIT = 5_000_000

export interface ReverseInvoiceRecord {
  id: string
  orderId: string
  category: string
  qty: string
  amount: number
  taxRate: string
  issueDate: string
  status: "已开具" | "已作废"
}

export interface ReversePayee {
  id: string
  name: string
  idNo: string
  region: string
  bankAccount: string
  taxYear: string
  annualUsed: number
  records: ReverseInvoiceRecord[]
}

export const reversePayees: ReversePayee[] = [
  {
    id: "ZRR-001",
    name: "张建国",
    idNo: "3205**********0917",
    region: "江苏·无锡",
    bankAccount: "工商银行无锡分行 6222 **** **** 9920",
    taxYear: "2026",
    annualUsed: 843_500,
    records: [
      { id: "RP20260904-005", orderId: "DD20260904-005", category: "统废", qty: "35 吨", amount: 84_350, taxRate: "3%", issueDate: "2026-09-05", status: "已开具" },
      { id: "RP20260712-041", orderId: "DD20260712-041", category: "统废", qty: "120 吨", amount: 289_200, taxRate: "3%", issueDate: "2026-07-13", status: "已开具" },
      { id: "RP20260520-028", orderId: "DD20260520-028", category: "重废", qty: "180 吨", amount: 469_950, taxRate: "3%", issueDate: "2026-05-21", status: "已开具" },
    ],
  },
  {
    id: "ZRR-002",
    name: "李秀兰",
    idNo: "3202**********2043",
    region: "江苏·苏州",
    bankAccount: "农业银行苏州分行 6228 **** **** 5510",
    taxYear: "2026",
    annualUsed: 4_760_000,
    records: [
      { id: "RP20260815-033", orderId: "DD20260815-033", category: "重废", qty: "820 吨", amount: 2_140_000, taxRate: "3%", issueDate: "2026-08-16", status: "已开具" },
      { id: "RP20260630-019", orderId: "DD20260630-019", category: "重废", qty: "1,000 吨", amount: 2_620_000, taxRate: "3%", issueDate: "2026-07-01", status: "已开具" },
    ],
  },
  {
    id: "ZRR-003",
    name: "王志强",
    idNo: "3301**********1135",
    region: "浙江·嘉兴",
    bankAccount: "建设银行嘉兴分行 6217 **** **** 3382",
    taxYear: "2026",
    annualUsed: 0,
    records: [],
  },
  {
    id: "ZRR-004",
    name: "陈美华",
    idNo: "3204**********0628",
    region: "江苏·常州",
    bankAccount: "中国银行常州分行 6217 **** **** 7741",
    taxYear: "2026",
    annualUsed: 2_180_000,
    records: [
      { id: "RP20260710-024", orderId: "DD20260710-024", category: "统废", qty: "400 吨", amount: 964_000, taxRate: "3%", issueDate: "2026-07-11", status: "已开具" },
      { id: "RP20260408-012", orderId: "DD20260408-012", category: "统废", qty: "500 吨", amount: 1_216_000, taxRate: "3%", issueDate: "2026-04-09", status: "已开具" },
    ],
  },
]

// 反向开票以「与自然人的订单」为主体：每笔订单一行，体现订单信息 + 该自然人年度额度上下文
export interface ReverseOrder {
  id: string // 订单号
  payeeId: string // 关联自然人
  payeeName: string
  idNo: string
  region: string
  category: string
  qty: string
  unitPrice: string
  amount: number // 订单金额（可开票金额）
  deliveryDate: string
  settleStatus: "已结算" | "待结算"
  invoiceStatus: "待开票" | "已开票" | "已作废"
  invoiceNo: string | null // 已开票时的反向开票单号
  issueDate: string | null
}

export const reverseOrders: ReverseOrder[] = [
  { id: "DD20260904-005", payeeId: "ZRR-001", payeeName: "张建国", idNo: "3205**********0917", region: "江苏·无锡", category: "统废", qty: "35 吨", unitPrice: "¥2,410/吨", amount: 84_350, deliveryDate: "2026-09-08", settleStatus: "已结算", invoiceStatus: "已开票", invoiceNo: "RP20260904-005", issueDate: "2026-09-05" },
  { id: "DD20260918-031", payeeId: "ZRR-001", payeeName: "张建国", idNo: "3205**********0917", region: "江苏·无锡", category: "重废", qty: "60 吨", unitPrice: "¥2,650/吨", amount: 159_000, deliveryDate: "2026-09-22", settleStatus: "已结算", invoiceStatus: "待开票", invoiceNo: null, issueDate: null },
  { id: "DD20260920-047", payeeId: "ZRR-001", payeeName: "张建国", idNo: "3205**********0917", region: "江苏·无锡", category: "统废", qty: "48 吨", unitPrice: "¥2,415/吨", amount: 115_920, deliveryDate: "2026-09-24", settleStatus: "待结算", invoiceStatus: "待开票", invoiceNo: null, issueDate: null },
  { id: "DD20260815-033", payeeId: "ZRR-002", payeeName: "李秀兰", idNo: "3202**********2043", region: "江苏·苏州", category: "重废", qty: "820 吨", unitPrice: "¥2,610/吨", amount: 2_140_000, deliveryDate: "2026-08-18", settleStatus: "已结算", invoiceStatus: "已开票", invoiceNo: "RP20260815-033", issueDate: "2026-08-16" },
  { id: "DD20260922-052", payeeId: "ZRR-002", payeeName: "李秀兰", idNo: "3202**********2043", region: "江苏·苏州", category: "重废", qty: "150 吨", unitPrice: "¥2,640/吨", amount: 396_000, deliveryDate: "2026-09-26", settleStatus: "已结算", invoiceStatus: "待开票", invoiceNo: null, issueDate: null },
  { id: "DD20260910-020", payeeId: "ZRR-003", payeeName: "王志强", idNo: "3301**********1135", region: "浙江·嘉兴", category: "统废", qty: "90 吨", unitPrice: "¥2,405/吨", amount: 216_450, deliveryDate: "2026-09-14", settleStatus: "已结算", invoiceStatus: "待开票", invoiceNo: null, issueDate: null },
  { id: "DD20260710-024", payeeId: "ZRR-004", payeeName: "陈美华", idNo: "3204**********0628", region: "江苏·常州", category: "统废", qty: "400 吨", unitPrice: "¥2,410/吨", amount: 964_000, deliveryDate: "2026-07-14", settleStatus: "已结算", invoiceStatus: "已开票", invoiceNo: "RP20260710-024", issueDate: "2026-07-11" },
  { id: "DD20260925-061", payeeId: "ZRR-004", payeeName: "陈美华", idNo: "3204**********0628", region: "江苏·常州", category: "重废", qty: "220 吨", unitPrice: "¥2,655/吨", amount: 584_100, deliveryDate: "2026-09-28", settleStatus: "待结算", invoiceStatus: "待开票", invoiceNo: null, issueDate: null },
]

// ---------- 供应商管理 ----------
export interface SupplierItem {
  id: string
  name: string
  type: "回收基地" | "企业供应商" | "自然人"
  contact: string
  region: string
  supplyCategory: string
  totalQty: string
  status: "合作中" | "待审核" | "已停用"
  cooperation: "协议供应商" | "普通供应商"
}

export const supplierList: SupplierItem[] = [
  { id: "S001", name: "城南再生资源回收站", type: "回收基地", contact: "李经理 138****2043", region: "江苏·苏州", supplyCategory: "重废/统废", totalQty: "9,860 吨", status: "合作中", cooperation: "协议供应商" },
  { id: "S002", name: "盛通金属有限公司", type: "企业供应商", contact: "王总 139****7781", region: "上海·宝山", supplyCategory: "生铁", totalQty: "5,240 吨", status: "合作中", cooperation: "协议供应商" },
  { id: "S003", name: "环宇物资回收站", type: "回收基地", contact: "赵主管 137****5502", region: "浙江·嘉兴", supplyCategory: "统废", totalQty: "3,120 吨", status: "待审核", cooperation: "普通供应商" },
  { id: "S004", name: "张建国", type: "自然人", contact: "张建国 135****9920", region: "江苏·无锡", supplyCategory: "统废", totalQty: "620 吨", status: "合作中", cooperation: "普通供应商" },
  { id: "S005", name: "利民废旧金属", type: "企业供应商", contact: "陈经理 136****1188", region: "安徽·马鞍山", supplyCategory: "重废", totalQty: "2,050 吨", status: "已停用", cooperation: "普通供应商" },
]

// ---------- 基地管理（钢厂视角：仅回收基地）----------
export interface CoopBase {
  id: string
  name: string
  contact: string
  region: string
  supplyCategory: string
  scale: "大型基地" | "中型基地" | "小型基地"
  totalQty: string
  status: "合作中" | "待审核" | "已邀请" | "已停用"
  cooperation: "协议基地" | "普通基地"
  joinedAt: string
}

export const coopBaseList: CoopBase[] = [
  { id: "B001", name: "城南再生资源回收基地", contact: "李经理 138****2043", region: "江苏·苏州", supplyCategory: "重废/统废", scale: "大型基地", totalQty: "9,860 吨", status: "合作中", cooperation: "协议基地", joinedAt: "2024-03-12" },
  { id: "B002", name: "环宇物资回收基地", contact: "赵主管 137****5502", region: "浙江·嘉兴", supplyCategory: "统废", scale: "中型基地", totalQty: "3,120 吨", status: "待审核", cooperation: "普通基地", joinedAt: "—" },
  { id: "B003", name: "华东再生资源基地", contact: "刘经理 139****3320", region: "江苏·南京", supplyCategory: "重废", scale: "大型基地", totalQty: "6,540 吨", status: "合作中", cooperation: "协议基地", joinedAt: "2024-07-08" },
  { id: "B004", name: "宁波北仑金属回收基地", contact: "周主管 136****7781", region: "浙江·宁波", supplyCategory: "统废/生铁", scale: "中型基地", totalQty: "—", status: "已邀请", cooperation: "普通基地", joinedAt: "—" },
  { id: "B005", name: "皖南废旧物资回收基地", contact: "陈经理 135****1188", region: "安徽·马鞍山", supplyCategory: "重废", scale: "中型基地", totalQty: "2,050 吨", status: "已停用", cooperation: "普通基地", joinedAt: "2023-11-20" },
  { id: "B006", name: "苏北再生资源集散基地", contact: "孙经理 137****9902", region: "江苏·徐州", supplyCategory: "统废", scale: "大型基地", totalQty: "—", status: "已邀请", cooperation: "普通基地", joinedAt: "—" },
]

// ---------- 基地管理（回收基地视角）----------
// 钢厂发来的合作邀约
export interface MillInvite {
  id: string
  millName: string
  region: string
  category: string
  settlement: string
  message: string
  invitedAt: string
  status: "待回复" | "已接受" | "已拒绝"
}

export const millInviteList: MillInvite[] = [
  { id: "IV001", millName: "华东特钢集团", region: "江苏·苏州", category: "重废 / 统废", settlement: "月结 · 电子合同", message: "诚邀贵基地成为我方长期协议合作回收基地，享优先派单与协议定价。", invitedAt: "2026-09-08", status: "待回复" },
  { id: "IV002", millName: "江南钢铁股份", region: "江苏·南京", category: "生铁 / 重废", settlement: "货到结算", message: "我方拟拓展苏南废钢供应渠道，邀请贵基地建立固定价供货合作。", invitedAt: "2026-09-05", status: "待回复" },
  { id: "IV003", millName: "宝武再生资源", region: "上海·宝山", category: "统废", settlement: "协议月结", message: "邀请贵基地加入我方合作基地名录，参与月度竞价与协议回收。", invitedAt: "2026-08-28", status: "已接受" },
  { id: "IV004", millName: "沙钢集团", region: "江苏·张家港", category: "重废", settlement: "一票制月结", message: "邀请贵基地成为我方重废定点供应基地。", invitedAt: "2026-08-20", status: "已拒绝" },
]

// 回收基地主动提交的合作申请
export interface CoopApplication {
  id: string
  millName: string
  category: string
  appliedAt: string
  status: "审核中" | "已通过" | "已驳回"
  note: string
}

export const coopApplicationList: CoopApplication[] = [
  { id: "AP001", millName: "华东特钢集团", category: "重废 / 统废", appliedAt: "2026-09-02", status: "已通过", note: "已建立协议合作，等级：协议基地" },
  { id: "AP002", millName: "马钢股份", category: "统废", appliedAt: "2026-09-06", status: "审核中", note: "资质材料审核中，预计 3 个工作日反馈" },
  { id: "AP003", millName: "南钢联合", category: "生铁", appliedAt: "2026-08-30", status: "已驳回", note: "供货类别暂不匹配，建议补充重废品类后重新申请" },
]
