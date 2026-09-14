// 门户 · 钢厂专区频道 - 静态原型数据

export type DemandType = "purchase" | "sales"

/* ------------------------------------------------------------------ */
/* 废钢分类（二级分类）导航                                            */
/* ------------------------------------------------------------------ */
export const scrapCategories: { key: string; name: string; weight: number }[] = [
  { key: "all", name: "全部废钢", weight: 1 },
  { key: "heavy", name: "重型废钢", weight: 0.32 },
  { key: "medium", name: "中型废钢", weight: 0.22 },
  { key: "light", name: "轻薄料", weight: 0.15 },
  { key: "shear", name: "剪切料", weight: 0.12 },
  { key: "pig", name: "生铁铸铁", weight: 0.09 },
  { key: "alloy", name: "合金钢", weight: 0.06 },
  { key: "stainless", name: "不锈钢", weight: 0.05 },
  { key: "turning", name: "钢屑刨花", weight: 0.04 },
]

/* ------------------------------------------------------------------ */
/* 各省废钢采购 / 销售需求（全部废钢口径）                              */
/* ------------------------------------------------------------------ */
const demandBase: Record<string, { purchase: number; sales: number }> = {
  河北: { purchase: 186, sales: 124 },
  江苏: { purchase: 176, sales: 112 },
  山东: { purchase: 150, sales: 96 },
  辽宁: { purchase: 140, sales: 96 },
  广东: { purchase: 130, sales: 90 },
  山西: { purchase: 120, sales: 74 },
  河南: { purchase: 112, sales: 74 },
  湖北: { purchase: 104, sales: 70 },
  安徽: { purchase: 104, sales: 70 },
  浙江: { purchase: 96, sales: 64 },
  湖南: { purchase: 88, sales: 62 },
  福建: { purchase: 70, sales: 50 },
  四川: { purchase: 68, sales: 48 },
  内蒙古: { purchase: 66, sales: 42 },
  天津: { purchase: 58, sales: 38 },
  上海: { purchase: 54, sales: 38 },
  江西: { purchase: 52, sales: 36 },
  陕西: { purchase: 50, sales: 34 },
  云南: { purchase: 42, sales: 30 },
  广西: { purchase: 40, sales: 28 },
  重庆: { purchase: 40, sales: 26 },
  吉林: { purchase: 36, sales: 24 },
  黑龙江: { purchase: 34, sales: 24 },
  贵州: { purchase: 26, sales: 20 },
  甘肃: { purchase: 26, sales: 18 },
  新疆: { purchase: 24, sales: 16 },
  北京: { purchase: 22, sales: 16 },
  宁夏: { purchase: 14, sales: 10 },
  青海: { purchase: 12, sales: 8 },
  海南: { purchase: 9, sales: 7 },
  西藏: { purchase: 4, sales: 4 },
}

export type ProvinceDemand = { purchase: number; sales: number; total: number }

// 按分类计算各省需求（全部=基础值，其余=按权重缩放）
export function provinceDemand(catKey: string): Record<string, ProvinceDemand> {
  const cat = scrapCategories.find((c) => c.key === catKey) ?? scrapCategories[0]
  const out: Record<string, ProvinceDemand> = {}
  for (const [prov, v] of Object.entries(demandBase)) {
    const purchase = Math.round(v.purchase * cat.weight)
    const sales = Math.round(v.sales * cat.weight)
    out[prov] = { purchase, sales, total: purchase + sales }
  }
  return out
}

// 分类左侧导航显示的需求条数（采购+销售汇总）
export function categoryCount(catKey: string): number {
  const d = provinceDemand(catKey)
  return Object.values(d).reduce((s, v) => s + v.total, 0)
}

/* ------------------------------------------------------------------ */
/* 需求推荐（采购 / 销售）                                             */
/* ------------------------------------------------------------------ */
export type DemandReco = {
  id: string
  type: DemandType
  category: string // category key
  province: string
  title: string
  price: number
  unit: string
  status: "竞价中" | "固定价" | "询价中"
  spec: string
  place: string
}

export const demandRecos: DemandReco[] = [
  { id: "DR01", type: "purchase", category: "heavy", province: "河北", title: "唐山钢厂重型废钢长期回收 6mm 以上", price: 2650, unit: "元/吨", status: "竞价中", spec: "≥6mm 优质料", place: "河北·唐山" },
  { id: "DR02", type: "purchase", category: "shear", province: "江苏", title: "沙钢集团剪切料采购 1000 吨/月", price: 2720, unit: "元/吨", status: "竞价中", spec: "1.2m 剪切料", place: "江苏·张家港" },
  { id: "DR03", type: "purchase", category: "medium", province: "山东", title: "山钢中型废钢回收 含税到厂价", price: 2580, unit: "元/吨", status: "固定价", spec: "中废统料", place: "山东·莱芜" },
  { id: "DR04", type: "purchase", category: "light", province: "广东", title: "韶钢轻薄料采购 大量长期", price: 2380, unit: "元/吨", status: "询价中", spec: "轻薄料打包", place: "广东·韶关" },
  { id: "DR05", type: "purchase", category: "heavy", province: "辽宁", title: "本钢重废回收 月需 2000 吨", price: 2610, unit: "元/吨", status: "竞价中", spec: "重型统料", place: "辽宁·本溪" },
  { id: "DR06", type: "purchase", category: "pig", province: "山西", title: "太钢生铁铸铁采购 到厂结算", price: 2900, unit: "元/吨", status: "固定价", spec: "机件生铁", place: "山西·太原" },
  { id: "DR07", type: "purchase", category: "alloy", province: "湖北", title: "鄂钢合金钢边角料回收", price: 3450, unit: "元/吨", status: "询价中", spec: "低合金", place: "湖北·黄石" },
  { id: "DR08", type: "purchase", category: "medium", province: "河南", title: "安钢中废统料采购 就近提货", price: 2560, unit: "元/吨", status: "竞价中", spec: "中废混合", place: "河南·安阳" },
  { id: "DS01", type: "sales", category: "heavy", province: "河北", title: "现货重型废钢出售 800 吨 一级料", price: 2560, unit: "元/吨", status: "竞价中", spec: "≥6mm 一级", place: "河北·邯郸" },
  { id: "DS02", type: "sales", category: "light", province: "江苏", title: "轻薄料打包块出售 现货 500 吨", price: 2280, unit: "元/吨", status: "固定价", spec: "打包块", place: "江苏·无锡" },
  { id: "DS03", type: "sales", category: "shear", province: "山东", title: "剪切料现货出售 可验货", price: 2620, unit: "元/吨", status: "竞价中", spec: "1m 剪切", place: "山东·济南" },
  { id: "DS04", type: "sales", category: "stainless", province: "广东", title: "304 不锈钢废料出售 含镍", price: 8600, unit: "元/吨", status: "询价中", spec: "304 边角", place: "广东·佛山" },
  { id: "DS05", type: "sales", category: "turning", province: "浙江", title: "钢屑刨花压块出售 现货", price: 1980, unit: "元/吨", status: "固定价", spec: "压块屑", place: "浙江·宁波" },
  { id: "DS06", type: "sales", category: "medium", province: "辽宁", title: "中型废钢出售 港口现货", price: 2500, unit: "元/吨", status: "竞价中", spec: "中废统料", place: "辽宁·营口" },
  { id: "DS07", type: "sales", category: "pig", province: "湖南", title: "铸造生铁出售 500 吨", price: 2860, unit: "元/吨", status: "固定价", spec: "铸造生铁", place: "湖南·湘潭" },
  { id: "DS08", type: "sales", category: "heavy", province: "安徽", title: "马钢周边重废现货出售", price: 2540, unit: "元/吨", status: "询价中", spec: "重型统料", place: "安徽·马鞍山" },
]

/* ------------------------------------------------------------------ */
/* 回收商 / 回收网点分布                                               */
/* ------------------------------------------------------------------ */
export const networkBase: Record<string, number> = {
  河北: 86, 江苏: 78, 山东: 72, 广东: 64, 辽宁: 58, 河南: 52, 浙江: 48, 山西: 44,
  湖北: 40, 安徽: 38, 湖南: 34, 四川: 30, 福建: 28, 上海: 26, 天津: 24, 江西: 22,
  陕西: 20, 内蒙古: 18, 重庆: 17, 云南: 15, 广西: 14, 吉林: 13, 黑龙江: 12, 贵州: 10,
  甘肃: 8, 新疆: 7, 北京: 16, 宁夏: 5, 青海: 3, 海南: 4, 西藏: 2,
}

export function networkStats() {
  const total = Object.values(networkBase).reduce((s, v) => s + v, 0)
  const provinces = Object.keys(networkBase).length
  const top = Object.entries(networkBase)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([province, count]) => ({ province, count }))
  return {
    total,
    provinces,
    certified: 1268,
    monthlyAdd: 42,
    top,
  }
}

export type Recycler = {
  id: string
  name: string
  province: string
  level: "战略合作" | "金牌回收商" | "认证回收商"
  categories: string[]
  monthlyCap: string
  address: string
}

export const recyclers: Recycler[] = [
  { id: "RC01", name: "唐山鑫盛物资回收有限公司", province: "河北", level: "战略合作", categories: ["重型废钢", "剪切料"], monthlyCap: "2.4 万吨/月", address: "河北·唐山·丰南区" },
  { id: "RC02", name: "邯郸绿环再生资源公司", province: "河北", level: "金牌回收商", categories: ["中型废钢", "打包块"], monthlyCap: "1.2 万吨/月", address: "河北·邯郸·永年区" },
  { id: "RC03", name: "张家港永钢废旧金属回收", province: "江苏", level: "战略合作", categories: ["剪切料", "重型废钢"], monthlyCap: "3.0 万吨/月", address: "江苏·张家港·锦丰镇" },
  { id: "RC04", name: "无锡锡钢再生资源公司", province: "江苏", level: "认证回收商", categories: ["轻薄料", "钢屑刨花"], monthlyCap: "8000 吨/月", address: "江苏·无锡·惠山区" },
  { id: "RC05", name: "济南泉城金属回收公司", province: "山东", level: "金牌回收商", categories: ["中型废钢", "生铁铸铁"], monthlyCap: "1.5 万吨/月", address: "山东·济南·章丘区" },
  { id: "RC06", name: "莱芜鲁中废钢回收基地", province: "山东", level: "战略合作", categories: ["重型废钢", "合金钢"], monthlyCap: "2.0 万吨/月", address: "山东·济南·莱芜区" },
  { id: "RC07", name: "佛山南海不锈钢回收公司", province: "广东", level: "金牌回收商", categories: ["不锈钢", "合金钢"], monthlyCap: "6000 吨/月", address: "广东·佛山·南海区" },
  { id: "RC08", name: "韶关粤北再生资源公司", province: "广东", level: "认证回收商", categories: ["轻薄料", "中型废钢"], monthlyCap: "9000 吨/月", address: "广东·韶关·浈江区" },
  { id: "RC09", name: "本溪辽东金属回收公司", province: "辽宁", level: "战略合作", categories: ["重型废钢", "剪切料"], monthlyCap: "1.8 万吨/月", address: "辽宁·本溪·平山区" },
  { id: "RC10", name: "营口港湾废钢回收公司", province: "辽宁", level: "认证回收商", categories: ["中型废钢", "打包块"], monthlyCap: "1.0 万吨/月", address: "辽宁·营口·鲅鱼圈" },
  { id: "RC11", name: "太原晋钢再生资源公司", province: "山西", level: "金牌回收商", categories: ["生铁铸铁", "重型废钢"], monthlyCap: "1.3 万吨/月", address: "山西·太原·清徐县" },
  { id: "RC12", name: "黄石鄂东金属回收公司", province: "湖北", level: "认证回收商", categories: ["合金钢", "中型废钢"], monthlyCap: "7000 吨/月", address: "湖北·黄石·下陆区" },
  { id: "RC13", name: "宁波甬城钢屑回收公司", province: "浙江", level: "金牌回收商", categories: ["钢屑刨花", "轻薄料"], monthlyCap: "8500 吨/月", address: "浙江·宁波·北仑区" },
  { id: "RC14", name: "郑州中原废钢回收基地", province: "河南", level: "战略合作", categories: ["重型废钢", "中型废钢"], monthlyCap: "1.6 万吨/月", address: "河南·郑州·中牟县" },
]

/* ------------------------------------------------------------------ */
/* 竞价大厅 / 废钢采购 / 废钢销售 统一挂牌                              */
/* ------------------------------------------------------------------ */
export type Channel = "竞价回收" | "固定价回收" | "竞价销售" | "固定价销售"

export type Listing = {
  id: string
  title: string
  category: string
  catKey: string
  channel: Channel
  price: number
  unit: string
  quantity: string
  spec: string
  region: string
  status: "竞价中" | "报名中" | "固定价" | "即将开始"
  bids?: number
  endsIn?: string
  company: string
}

export const listings: Listing[] = [
  // —— 竞价回收（8）——
  { id: "B2601", title: "唐山地区重型废钢竞价回收", category: "重型废钢", catKey: "heavy", channel: "竞价回收", price: 2650, unit: "元/吨", quantity: "1500 吨", spec: "≥6mm 一级料", region: "河北·唐山", status: "竞价中", bids: 18, endsIn: "02:14:30", company: "华东钢铁厂" },
  { id: "B2602", title: "沙钢集团剪切料月度竞价", category: "剪切料", catKey: "shear", channel: "竞价回收", price: 2720, unit: "元/吨", quantity: "3000 吨", spec: "1.2m 剪切", region: "江苏·张家港", status: "竞价中", bids: 25, endsIn: "01:02:48", company: "沙钢集团" },
  { id: "B2603", title: "山钢中型废钢竞价回收", category: "中型废钢", catKey: "medium", channel: "竞价回收", price: 2580, unit: "元/吨", quantity: "2000 吨", spec: "中废统料", region: "山东·莱芜", status: "报名中", bids: 0, endsIn: "1 天后开始", company: "山东钢铁" },
  { id: "B2604", title: "本钢重废季度竞价回收", category: "重型废钢", catKey: "heavy", channel: "竞价回收", price: 2610, unit: "元/吨", quantity: "5000 吨", spec: "重型统料", region: "辽宁·本溪", status: "竞价中", bids: 12, endsIn: "05:30:10", company: "本钢集团" },
  { id: "B2605", title: "韶钢轻薄料竞价回收", category: "轻薄料", catKey: "light", channel: "竞价回收", price: 2380, unit: "元/吨", quantity: "800 吨", spec: "轻薄打包", region: "广东·韶关", status: "竞价中", bids: 7, endsIn: "04:18:00", company: "宝武韶钢" },
  { id: "B2606", title: "太钢生铁铸铁竞价回收", category: "生铁铸铁", catKey: "pig", channel: "竞价回收", price: 2900, unit: "元/吨", quantity: "1200 吨", spec: "机件生铁", region: "山西·太原", status: "竞价中", bids: 11, endsIn: "06:02:40", company: "太钢集团" },
  { id: "B2607", title: "鄂钢合金钢边角竞价回收", category: "合金钢", catKey: "alloy", channel: "竞价回收", price: 3450, unit: "元/吨", quantity: "500 吨", spec: "低合金", region: "湖北·黄石", status: "报名中", bids: 0, endsIn: "2 天后开始", company: "鄂城钢铁" },
  { id: "B2608", title: "莱芜不锈钢废料竞价回收", category: "不锈钢", catKey: "stainless", channel: "竞价回收", price: 8300, unit: "元/吨", quantity: "200 吨", spec: "304 统料", region: "山东·济南", status: "竞价中", bids: 15, endsIn: "01:40:12", company: "山东钢铁" },

  // —— 固定价回收（8）——
  { id: "F2611", title: "韶钢轻薄料固定价回收", category: "轻薄料", catKey: "light", channel: "固定价回收", price: 2380, unit: "元/吨", quantity: "800 吨", spec: "轻薄打包", region: "广东·韶关", status: "固定价", company: "宝武韶钢" },
  { id: "F2612", title: "太钢生铁铸铁固定价回收", category: "生铁铸铁", catKey: "pig", channel: "固定价回收", price: 2900, unit: "元/吨", quantity: "1200 吨", spec: "机件生铁", region: "山西·太原", status: "固定价", company: "太钢集团" },
  { id: "F2613", title: "安钢中废统料固定价回收", category: "中型废钢", catKey: "medium", channel: "固定价回收", price: 2560, unit: "元/吨", quantity: "1000 吨", spec: "中废混合", region: "河南·安阳", status: "固定价", company: "安阳钢铁" },
  { id: "F2614", title: "唐山重废统料固定价回收", category: "重型废钢", catKey: "heavy", channel: "固定价回收", price: 2620, unit: "元/吨", quantity: "1800 吨", spec: "重型统料", region: "河北·唐山", status: "固定价", company: "华东钢铁厂" },
  { id: "F2615", title: "无锡钢屑刨花固定价回收", category: "钢屑刨花", catKey: "turning", channel: "固定价回收", price: 1980, unit: "元/吨", quantity: "600 吨", spec: "压块屑", region: "江苏·无锡", status: "固定价", company: "锡钢再生" },
  { id: "F2616", title: "济南中型废钢固定价回收", category: "中型废钢", catKey: "medium", channel: "固定价回收", price: 2540, unit: "元/吨", quantity: "1500 吨", spec: "中废统料", region: "山东·济南", status: "固定价", company: "山东钢铁" },
  { id: "F2617", title: "邯郸剪切料固定价回收", category: "剪切料", catKey: "shear", channel: "固定价回收", price: 2700, unit: "元/吨", quantity: "1000 吨", spec: "1m 剪切", region: "河北·邯郸", status: "固定价", company: "河钢邯钢" },
  { id: "F2618", title: "黄石合金钢固定价回收", category: "合金钢", catKey: "alloy", channel: "固定价回收", price: 3420, unit: "元/吨", quantity: "400 吨", spec: "低合金", region: "湖北·黄石", status: "固定价", company: "鄂城钢铁" },

  // —— 竞价销售（8）——
  { id: "S2621", title: "华东钢铁厂钢渣副产品竞价销售", category: "钢渣", catKey: "heavy", channel: "竞价销售", price: 320, unit: "元/吨", quantity: "8000 吨", spec: "转炉钢渣", region: "江苏·南京", status: "竞价中", bids: 9, endsIn: "03:45:00", company: "华东钢铁厂" },
  { id: "S2622", title: "含铁氧化皮竞价销售", category: "氧化铁皮", catKey: "heavy", channel: "竞价销售", price: 780, unit: "元/吨", quantity: "1500 吨", spec: "轧钢氧化皮", region: "河北·唐山", status: "竞价中", bids: 14, endsIn: "00:52:20", company: "华东钢铁厂" },
  { id: "S2623", title: "废旧钢结构件竞价销售", category: "重型废钢", catKey: "heavy", channel: "竞价销售", price: 2480, unit: "元/吨", quantity: "600 吨", spec: "拆解结构件", region: "山东·青岛", status: "报名中", bids: 0, endsIn: "2 天后开始", company: "青岛特钢" },
  { id: "S2624", title: "报废产线设备金属竞价销售", category: "中型废钢", catKey: "medium", channel: "竞价销售", price: 2450, unit: "元/吨", quantity: "400 吨", spec: "报废设备", region: "湖北·武汉", status: "竞价中", bids: 6, endsIn: "05:12:00", company: "武钢集团" },
  { id: "S2625", title: "拆解重废现货竞价销售", category: "重型废钢", catKey: "heavy", channel: "竞价销售", price: 2540, unit: "元/吨", quantity: "900 吨", spec: "拆解重废", region: "安徽·马鞍山", status: "竞价中", bids: 10, endsIn: "02:36:44", company: "马钢集团" },
  { id: "S2626", title: "304 不锈钢边角料竞价销售", category: "不锈钢", catKey: "stainless", channel: "竞价销售", price: 8600, unit: "元/吨", quantity: "120 吨", spec: "304 边角", region: "广东·佛山", status: "竞价中", bids: 21, endsIn: "01:18:30", company: "广东联钢" },
  { id: "S2627", title: "钢屑压块竞价销售", category: "钢屑刨花", catKey: "turning", channel: "竞价销售", price: 1980, unit: "元/吨", quantity: "300 吨", spec: "压块屑", region: "浙江·宁波", status: "报名中", bids: 0, endsIn: "1 天后开始", company: "宁波钢铁" },
  { id: "S2628", title: "轻薄打包块竞价销售", category: "轻薄料", catKey: "light", channel: "竞价销售", price: 2280, unit: "元/吨", quantity: "500 吨", spec: "打包块", region: "江苏·无锡", status: "竞价中", bids: 8, endsIn: "04:05:15", company: "锡钢再生" },

  // —— 固定价销售（4）——
  { id: "G2631", title: "报废设备金属固定价销售", category: "中型废钢", catKey: "medium", channel: "固定价销售", price: 2450, unit: "元/吨", quantity: "400 吨", spec: "报废设备", region: "湖北·武汉", status: "固定价", company: "武钢集团" },
  { id: "G2632", title: "不锈钢边角料固定价销售", category: "不锈钢", catKey: "stainless", channel: "固定价销售", price: 8600, unit: "元/吨", quantity: "120 吨", spec: "304 边角", region: "广东·佛山", status: "固定价", company: "广东联钢" },
  { id: "G2633", title: "钢屑压块固定价销售", category: "钢屑刨花", catKey: "turning", channel: "固定价销售", price: 1980, unit: "元/吨", quantity: "300 吨", spec: "压块屑", region: "浙江·宁波", status: "固定价", company: "宁波钢铁" },
  { id: "G2634", title: "铸造生铁固定价销售", category: "生铁铸铁", catKey: "pig", channel: "固定价销售", price: 2860, unit: "元/吨", quantity: "500 吨", spec: "铸造生铁", region: "湖南·湘潭", status: "固定价", company: "华菱湘钢" },
]

export function listingsByChannel(channel: Channel): Listing[] {
  return listings.filter((l) => l.channel === channel)
}

/* 按品类映射到废钢实拍图 */
export function scrapImage(category: string): string {
  if (category.includes("不锈钢")) return "/images/scrap-stainless.png"
  if (category.includes("剪切")) return "/images/scrap-shear.png"
  if (category.includes("钢渣") || category.includes("氧化")) return "/images/scrap-slag.png"
  if (category.includes("屑") || category.includes("轻薄")) return "/images/scrap-wire.png"
  if (category.includes("重型") || category.includes("生铁")) return "/images/scrap-heavy.png"
  return "/images/scrap-heavy.png"
}

/* 竞价大厅：起始价 / 竞价阶梯 / 最新报价 */
export const BID_STEP = 50
export function latestBid(l: Listing): number | null {
  if (l.status !== "竞价中" || !l.bids) return null
  return l.price + l.bids * BID_STEP
}

/* ------------------------------------------------------------------ */
/* 成交公告                                                            */
/* ------------------------------------------------------------------ */
export const zoneDeals: { id: string; title: string; category: string; weight: string; price: string; date: string; region: string }[] = [
  { id: "CJ0903", title: "唐山重型废钢竞价回收成交", category: "重型废钢", weight: "1500 吨", price: "2650 元/吨", date: "2026-09-09", region: "河北·唐山" },
  { id: "CJ0902", title: "沙钢剪切料月度竞价成交", category: "剪切料", weight: "3000 吨", price: "2720 元/吨", date: "2026-09-08", region: "江苏·张家港" },
  { id: "CJ0901", title: "华东钢铁厂钢渣竞价销售成交", category: "钢渣", weight: "8000 吨", price: "320 元/吨", date: "2026-09-07", region: "江苏·南京" },
  { id: "CJ0830", title: "本钢重废季度竞价成交", category: "重型废钢", weight: "5000 吨", price: "2610 元/吨", date: "2026-09-06", region: "辽宁·本溪" },
  { id: "CJ0829", title: "太钢生铁铸铁回收成交", category: "生铁铸铁", weight: "1200 吨", price: "2900 元/吨", date: "2026-09-05", region: "山西·太原" },
  { id: "CJ0828", title: "佛山不锈钢边角料销售成交", category: "不锈钢", weight: "120 吨", price: "8600 元/吨", date: "2026-09-04", region: "广东·佛山" },
]

/* ------------------------------------------------------------------ */
/* 资讯服务（废钢 / 钢铁行业）                                          */
/* ------------------------------------------------------------------ */
export const zoneNews: { id: string; title: string; tag: string; date: string; summary: string; featured?: boolean }[] = [
  { id: "N01", title: "2026 年 9 月废钢价格指数持续走强，重废均价站上 2600 元", tag: "价格行情", date: "2026-09-10", summary: "受钢厂补库需求带动，本周全国废钢价格环比上涨 1.8%，华东华北领涨。", featured: true },
  { id: "N02", title: "工信部发布《废钢铁加工行业准入条件》修订征求意见稿", tag: "政策法规", date: "2026-09-09", summary: "拟提高加工企业环保与规模门槛，推动废钢回收行业规范化集约化发展。" },
  { id: "N03", title: "短流程炼钢占比提升，2026 上半年电炉钢产量同比增 12%", tag: "行业动态", date: "2026-09-08", summary: "双碳目标下电炉短流程加速推进，废钢作为主要原料需求稳步增长。" },
  { id: "N04", title: "钢铁行业绿色低碳转型：废钢比每提高 1% 可减碳约 1.6%", tag: "绿色低碳", date: "2026-09-06", summary: "行业研究显示提升废钢比是钢铁减碳最直接有效的路径之一。" },
  { id: "N05", title: "多地出台再生资源回收体系建设支持政策", tag: "政策法规", date: "2026-09-05", summary: "地方财政对规范化回收网点给予补贴，鼓励建设区域性废钢集散中心。" },
  { id: "N06", title: "废钢加工设备智能化升级，破碎料品质与效率双提升", tag: "技术装备", date: "2026-09-03", summary: "新一代重型破碎线与智能分选设备加快在龙头回收企业落地应用。" },
]

/* ------------------------------------------------------------------ */
/* 特色服务                                                            */
/* ------------------------------------------------------------------ */
export const featuredServices: { key: string; title: string; desc: string; icon: string }[] = [
  { key: "reverse", title: "反向开票", desc: "面向自然人回收，金税合规、年度额度校验", icon: "receipt" },
  { key: "logistics", title: "智慧物流", desc: "过磅、运输、轨迹全程可视，就近调度", icon: "truck" },
  { key: "quality", title: "验质检斤", desc: "第三方验质、在线扣杂、争议复核", icon: "scale" },
  { key: "finance", title: "供应链金融", desc: "货款垫资、账期融资，加速资金周转", icon: "wallet" },
  { key: "settle", title: "阳光结算", desc: "线上对账、电子合同、资金存管", icon: "shield" },
  { key: "carbon", title: "碳资产核算", desc: "废钢利用减碳量核算与碳资产管理", icon: "leaf" },
]

/* ------------------------------------------------------------------ */
/* 合作企业                                                            */
/* ------------------------------------------------------------------ */
export const partnerCompanies: string[] = [
  "宝武钢铁集团",
  "河钢集团",
  "沙钢集团",
  "鞍钢集团",
  "首钢集团",
  "山东钢铁",
  "华菱钢铁",
  "本钢集团",
  "太钢集团",
  "南钢股份",
  "中天钢铁",
  "建龙集团",
]
