// 中国行政区划三级数据（省 - 市 - 县/区），用于搜索地区级联下拉
// 原型数据：覆盖全部省级行政区，每省列举代表性地级市，每市列举代表性县/区

export type RegionNode = {
  name: string
  children?: RegionNode[]
}

export const NATIONWIDE = "全国"

export const regionTree: RegionNode[] = [
  {
    name: "北京",
    children: [
      { name: "北京城区", children: [{ name: "朝阳区" }, { name: "海淀区" }, { name: "丰台区" }, { name: "石景山区" }, { name: "通州区" }] },
      { name: "远郊区", children: [{ name: "顺义区" }, { name: "大兴区" }, { name: "昌平区" }, { name: "房山区" }] },
    ],
  },
  {
    name: "天津",
    children: [
      { name: "天津城区", children: [{ name: "和平区" }, { name: "南开区" }, { name: "河东区" }, { name: "东丽区" }] },
      { name: "滨海新区", children: [{ name: "塘沽" }, { name: "汉沽" }, { name: "大港" }] },
    ],
  },
  {
    name: "河北",
    children: [
      { name: "唐山市", children: [{ name: "丰南区" }, { name: "路北区" }, { name: "遵化市" }, { name: "迁安市" }] },
      { name: "邯郸市", children: [{ name: "永年区" }, { name: "丛台区" }, { name: "武安市" }] },
      { name: "石家庄市", children: [{ name: "长安区" }, { name: "藁城区" }, { name: "鹿泉区" }] },
      { name: "邢台市", children: [{ name: "襄都区" }, { name: "南和区" }] },
    ],
  },
  {
    name: "山西",
    children: [
      { name: "太原市", children: [{ name: "清徐县" }, { name: "小店区" }, { name: "尖草坪区" }] },
      { name: "临汾市", children: [{ name: "尧都区" }, { name: "侯马市" }] },
      { name: "运城市", children: [{ name: "盐湖区" }, { name: "河津市" }] },
    ],
  },
  {
    name: "内蒙古",
    children: [
      { name: "包头市", children: [{ name: "九原区" }, { name: "昆都仑区" }, { name: "青山区" }] },
      { name: "呼和浩特市", children: [{ name: "新城区" }, { name: "赛罕区" }] },
      { name: "鄂尔多斯市", children: [{ name: "东胜区" }, { name: "准格尔旗" }] },
    ],
  },
  {
    name: "辽宁",
    children: [
      { name: "本溪市", children: [{ name: "平山区" }, { name: "溪湖区" }] },
      { name: "鞍山市", children: [{ name: "铁东区" }, { name: "立山区" }, { name: "海城市" }] },
      { name: "沈阳市", children: [{ name: "和平区" }, { name: "铁西区" }, { name: "浑南区" }] },
      { name: "大连市", children: [{ name: "中山区" }, { name: "金州区" }] },
    ],
  },
  {
    name: "吉林",
    children: [
      { name: "通化市", children: [{ name: "二道江区" }, { name: "东昌区" }] },
      { name: "长春市", children: [{ name: "朝阳区" }, { name: "净月区" }] },
      { name: "吉林市", children: [{ name: "船营区" }, { name: "龙潭区" }] },
    ],
  },
  {
    name: "黑龙江",
    children: [
      { name: "齐齐哈尔市", children: [{ name: "富拉尔基区" }, { name: "龙沙区" }] },
      { name: "哈尔滨市", children: [{ name: "道里区" }, { name: "南岗区" }, { name: "松北区" }] },
      { name: "大庆市", children: [{ name: "萨尔图区" }, { name: "让胡路区" }] },
    ],
  },
  {
    name: "上海",
    children: [
      { name: "上海城区", children: [{ name: "宝山区" }, { name: "浦东新区" }, { name: "闵行区" }, { name: "嘉定区" }] },
      { name: "远郊区", children: [{ name: "松江区" }, { name: "青浦区" }, { name: "金山区" }] },
    ],
  },
  {
    name: "江苏",
    children: [
      { name: "无锡市", children: [{ name: "惠山区" }, { name: "锡山区" }, { name: "江阴市" }] },
      { name: "苏州市", children: [{ name: "吴中区" }, { name: "昆山市" }, { name: "张家港市" }] },
      { name: "南京市", children: [{ name: "江宁区" }, { name: "六合区" }] },
      { name: "徐州市", children: [{ name: "云龙区" }, { name: "邳州市" }] },
    ],
  },
  {
    name: "浙江",
    children: [
      { name: "宁波市", children: [{ name: "北仑区" }, { name: "镇海区" }, { name: "慈溪市" }] },
      { name: "杭州市", children: [{ name: "萧山区" }, { name: "余杭区" }, { name: "富阳区" }] },
      { name: "绍兴市", children: [{ name: "柯桥区" }, { name: "诸暨市" }] },
    ],
  },
  {
    name: "安徽",
    children: [
      { name: "马鞍山市", children: [{ name: "雨山区" }, { name: "花山区" }, { name: "当涂县" }] },
      { name: "合肥市", children: [{ name: "包河区" }, { name: "肥东县" }] },
      { name: "芜湖市", children: [{ name: "镜湖区" }, { name: "湾沚区" }] },
    ],
  },
  {
    name: "福建",
    children: [
      { name: "三明市", children: [{ name: "梅列区" }, { name: "三元区" }, { name: "沙县区" }] },
      { name: "福州市", children: [{ name: "仓山区" }, { name: "马尾区" }] },
      { name: "厦门市", children: [{ name: "湖里区" }, { name: "集美区" }] },
    ],
  },
  {
    name: "江西",
    children: [
      { name: "新余市", children: [{ name: "渝水区" }, { name: "分宜县" }] },
      { name: "南昌市", children: [{ name: "青山湖区" }, { name: "新建区" }] },
      { name: "萍乡市", children: [{ name: "安源区" }, { name: "湘东区" }] },
    ],
  },
  {
    name: "山东",
    children: [
      { name: "济南市", children: [{ name: "章丘区" }, { name: "莱芜区" }, { name: "历城区" }] },
      { name: "青岛市", children: [{ name: "黄岛区" }, { name: "即墨区" }] },
      { name: "淄博市", children: [{ name: "张店区" }, { name: "临淄区" }] },
      { name: "潍坊市", children: [{ name: "奎文区" }, { name: "寿光市" }] },
    ],
  },
  {
    name: "河南",
    children: [
      { name: "郑州市", children: [{ name: "中牟县" }, { name: "金水区" }, { name: "巩义市" }] },
      { name: "安阳市", children: [{ name: "殷都区" }, { name: "林州市" }] },
      { name: "洛阳市", children: [{ name: "涧西区" }, { name: "偃师区" }] },
    ],
  },
  {
    name: "湖北",
    children: [
      { name: "黄石市", children: [{ name: "下陆区" }, { name: "大冶市" }] },
      { name: "武汉市", children: [{ name: "青山区" }, { name: "汉阳区" }, { name: "江夏区" }] },
      { name: "鄂州市", children: [{ name: "鄂城区" }, { name: "华容区" }] },
    ],
  },
  {
    name: "湖南",
    children: [
      { name: "湘潭市", children: [{ name: "岳塘区" }, { name: "湘乡市" }] },
      { name: "长沙市", children: [{ name: "岳麓区" }, { name: "望城区" }] },
      { name: "株洲市", children: [{ name: "天元区" }, { name: "醴陵市" }] },
    ],
  },
  {
    name: "广东",
    children: [
      { name: "佛山市", children: [{ name: "南海区" }, { name: "顺德区" }, { name: "三水区" }] },
      { name: "韶关市", children: [{ name: "浈江区" }, { name: "武江区" }] },
      { name: "广州市", children: [{ name: "黄埔区" }, { name: "南沙区" }, { name: "增城区" }] },
      { name: "东莞市", children: [{ name: "长安镇" }, { name: "虎门镇" }] },
    ],
  },
  {
    name: "广西",
    children: [
      { name: "柳州市", children: [{ name: "柳北区" }, { name: "鱼峰区" }] },
      { name: "南宁市", children: [{ name: "武鸣区" }, { name: "西乡塘区" }] },
      { name: "防城港市", children: [{ name: "港口区" }, { name: "防城区" }] },
    ],
  },
  {
    name: "海南",
    children: [
      { name: "昌江县", children: [{ name: "石碌镇" }, { name: "叉河镇" }] },
      { name: "海口市", children: [{ name: "秀英区" }, { name: "龙华区" }] },
      { name: "儋州市", children: [{ name: "那大镇" }, { name: "洋浦经济开发区" }] },
    ],
  },
  {
    name: "重庆",
    children: [
      { name: "主城都市区", children: [{ name: "长寿区" }, { name: "渝北区" }, { name: "江北区" }, { name: "九龙坡区" }] },
      { name: "渝东北", children: [{ name: "万州区" }, { name: "开州区" }] },
    ],
  },
  {
    name: "四川",
    children: [
      { name: "成都市", children: [{ name: "青白江区" }, { name: "金牛区" }, { name: "龙泉驿区" }] },
      { name: "攀枝花市", children: [{ name: "东区" }, { name: "仁和区" }] },
      { name: "德阳市", children: [{ name: "旌阳区" }, { name: "广汉市" }] },
    ],
  },
  {
    name: "贵州",
    children: [
      { name: "六盘水市", children: [{ name: "钟山区" }, { name: "水城区" }] },
      { name: "贵阳市", children: [{ name: "白云区" }, { name: "观山湖区" }] },
      { name: "遵义市", children: [{ name: "红花岗区" }, { name: "仁怀市" }] },
    ],
  },
  {
    name: "云南",
    children: [
      { name: "昆明市", children: [{ name: "安宁市" }, { name: "五华区" }, { name: "呈贡区" }] },
      { name: "曲靖市", children: [{ name: "麒麟区" }, { name: "宣威市" }] },
      { name: "玉溪市", children: [{ name: "红塔区" }, { name: "江川区" }] },
    ],
  },
  {
    name: "西藏",
    children: [
      { name: "拉萨市", children: [{ name: "堆龙德庆区" }, { name: "城关区" }] },
      { name: "日喀则市", children: [{ name: "桑珠孜区" }] },
    ],
  },
  {
    name: "陕西",
    children: [
      { name: "渭南市", children: [{ name: "韩城市" }, { name: "临渭区" }] },
      { name: "西安市", children: [{ name: "阎良区" }, { name: "未央区" }] },
      { name: "宝鸡市", children: [{ name: "渭滨区" }, { name: "陈仓区" }] },
    ],
  },
  {
    name: "甘肃",
    children: [
      { name: "嘉峪关市", children: [{ name: "雄关区" }, { name: "镜铁区" }] },
      { name: "兰州市", children: [{ name: "西固区" }, { name: "红古区" }] },
      { name: "酒泉市", children: [{ name: "肃州区" }, { name: "玉门市" }] },
    ],
  },
  {
    name: "青海",
    children: [
      { name: "西宁市", children: [{ name: "城北区" }, { name: "城东区" }] },
      { name: "海东市", children: [{ name: "乐都区" }, { name: "民和县" }] },
    ],
  },
  {
    name: "宁夏",
    children: [
      { name: "银川市", children: [{ name: "西夏区" }, { name: "金凤区" }] },
      { name: "石嘴山市", children: [{ name: "大武口区" }, { name: "惠农区" }] },
    ],
  },
  {
    name: "新疆",
    children: [
      { name: "乌鲁木齐市", children: [{ name: "头屯河区" }, { name: "米东区" }, { name: "天山区" }] },
      { name: "昌吉州", children: [{ name: "昌吉市" }, { name: "阜康市" }] },
      { name: "巴音郭楞州", children: [{ name: "库尔勒市" }] },
    ],
  },
]
