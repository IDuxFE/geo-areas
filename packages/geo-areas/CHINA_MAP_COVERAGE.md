# 中国地图下钻覆盖

本清单随数据更新自动生成；逐项机器可读信息位于发布包 manifest 的 `coverage.chinaMaps`。

检查范围：全国、省级和市级地图，共 398 个地区。

- 363 个地区提供下级边界集合。
- 35 个地区的 `_full.json` 返回 404，已成功获取本级 `.json`。
- 0 个地区的 `_full.json` 因非 404 错误失败后回退；不能据此认定没有下级边界。

没有 `_full.json` 表示此数据源当前不提供该地区的下级边界，不表示该行政区域没有下级单位。区县仅作为市级地图中的要素提供，未请求区县地图接口；镇街地图不在当前下载范围。文字行政树、单独地图文件和下级边界集合是不同的覆盖范围。`level` 优先采用 Vant 行政树层级，无法对应时采用 DataV 本级要素的层级；它可能与地图要素的 DataV 层级不同。例如省直辖县级单位在行政树中为 district，在 DataV 地图中可能为 city。

## 未提供下级边界接口的地区（404）

| adcode | 地区               | 行政树层级 | 父级代码 | 本级轮廓                                                        |
| ------ | ------------------ | ---------- | -------- | --------------------------------------------------------------- |
| 419001 | 济源市             | district   | 410000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/419001.json) |
| 429004 | 仙桃市             | district   | 420000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/429004.json) |
| 429005 | 潜江市             | district   | 420000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/429005.json) |
| 429006 | 天门市             | district   | 420000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/429006.json) |
| 429021 | 神农架林区         | district   | 420000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/429021.json) |
| 441900 | 东莞市             | city       | 440000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/441900.json) |
| 442000 | 中山市             | city       | 440000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/442000.json) |
| 460400 | 儋州市             | city       | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/460400.json) |
| 469001 | 五指山市           | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469001.json) |
| 469002 | 琼海市             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469002.json) |
| 469005 | 文昌市             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469005.json) |
| 469006 | 万宁市             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469006.json) |
| 469007 | 东方市             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469007.json) |
| 469021 | 定安县             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469021.json) |
| 469022 | 屯昌县             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469022.json) |
| 469023 | 澄迈县             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469023.json) |
| 469024 | 临高县             | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469024.json) |
| 469025 | 白沙黎族自治县     | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469025.json) |
| 469026 | 昌江黎族自治县     | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469026.json) |
| 469027 | 乐东黎族自治县     | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469027.json) |
| 469028 | 陵水黎族自治县     | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469028.json) |
| 469029 | 保亭黎族苗族自治县 | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469029.json) |
| 469030 | 琼中黎族苗族自治县 | district   | 460000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/469030.json) |
| 620200 | 嘉峪关市           | city       | 620000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/620200.json) |
| 659001 | 石河子市           | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659001.json) |
| 659002 | 阿拉尔市           | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659002.json) |
| 659003 | 图木舒克市         | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659003.json) |
| 659004 | 五家渠市           | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659004.json) |
| 659005 | 北屯市             | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659005.json) |
| 659006 | 铁门关市           | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659006.json) |
| 659007 | 双河市             | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659007.json) |
| 659008 | 可克达拉市         | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659008.json) |
| 659009 | 昆玉市             | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659009.json) |
| 659010 | 胡杨河市           | district   | 650000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/659010.json) |
| 710000 | 台湾省             | province   | 100000   | [JSON](https://geo.datav.aliyun.com/areas_v3/bound/710000.json) |

## 临时错误后回退的地区

无。

## 全部已请求地区

| adcode | 地区                   | 行政树层级 | 下级接口  | 地图内容     | 下级边界层级 | 可继续打开的子地图数 |
| ------ | ---------------------- | ---------- | --------- | ------------ | ------------ | -------------------- |
| 100000 | 中国                   | country    | available | 下级边界集合 | province     | 34                   |
| 110000 | 北京市                 | province   | available | 下级边界集合 | district     | 0                    |
| 120000 | 天津市                 | province   | available | 下级边界集合 | district     | 0                    |
| 130000 | 河北省                 | province   | available | 下级边界集合 | city         | 11                   |
| 130100 | 石家庄市               | city       | available | 下级边界集合 | district     | 0                    |
| 130200 | 唐山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 130300 | 秦皇岛市               | city       | available | 下级边界集合 | district     | 0                    |
| 130400 | 邯郸市                 | city       | available | 下级边界集合 | district     | 0                    |
| 130500 | 邢台市                 | city       | available | 下级边界集合 | district     | 0                    |
| 130600 | 保定市                 | city       | available | 下级边界集合 | district     | 0                    |
| 130700 | 张家口市               | city       | available | 下级边界集合 | district     | 0                    |
| 130800 | 承德市                 | city       | available | 下级边界集合 | district     | 0                    |
| 130900 | 沧州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 131000 | 廊坊市                 | city       | available | 下级边界集合 | district     | 0                    |
| 131100 | 衡水市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140000 | 山西省                 | province   | available | 下级边界集合 | city         | 11                   |
| 140100 | 太原市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140200 | 大同市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140300 | 阳泉市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140400 | 长治市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140500 | 晋城市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140600 | 朔州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140700 | 晋中市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140800 | 运城市                 | city       | available | 下级边界集合 | district     | 0                    |
| 140900 | 忻州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 141000 | 临汾市                 | city       | available | 下级边界集合 | district     | 0                    |
| 141100 | 吕梁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 150000 | 内蒙古自治区           | province   | available | 下级边界集合 | city         | 12                   |
| 150100 | 呼和浩特市             | city       | available | 下级边界集合 | district     | 0                    |
| 150200 | 包头市                 | city       | available | 下级边界集合 | district     | 0                    |
| 150300 | 乌海市                 | city       | available | 下级边界集合 | district     | 0                    |
| 150400 | 赤峰市                 | city       | available | 下级边界集合 | district     | 0                    |
| 150500 | 通辽市                 | city       | available | 下级边界集合 | district     | 0                    |
| 150600 | 鄂尔多斯市             | city       | available | 下级边界集合 | district     | 0                    |
| 150700 | 呼伦贝尔市             | city       | available | 下级边界集合 | district     | 0                    |
| 150800 | 巴彦淖尔市             | city       | available | 下级边界集合 | district     | 0                    |
| 150900 | 乌兰察布市             | city       | available | 下级边界集合 | district     | 0                    |
| 152200 | 兴安盟                 | city       | available | 下级边界集合 | district     | 0                    |
| 152500 | 锡林郭勒盟             | city       | available | 下级边界集合 | district     | 0                    |
| 152900 | 阿拉善盟               | city       | available | 下级边界集合 | district     | 0                    |
| 210000 | 辽宁省                 | province   | available | 下级边界集合 | city         | 14                   |
| 210100 | 沈阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210200 | 大连市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210300 | 鞍山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210400 | 抚顺市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210500 | 本溪市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210600 | 丹东市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210700 | 锦州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210800 | 营口市                 | city       | available | 下级边界集合 | district     | 0                    |
| 210900 | 阜新市                 | city       | available | 下级边界集合 | district     | 0                    |
| 211000 | 辽阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 211100 | 盘锦市                 | city       | available | 下级边界集合 | district     | 0                    |
| 211200 | 铁岭市                 | city       | available | 下级边界集合 | district     | 0                    |
| 211300 | 朝阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 211400 | 葫芦岛市               | city       | available | 下级边界集合 | district     | 0                    |
| 220000 | 吉林省                 | province   | available | 下级边界集合 | city         | 9                    |
| 220100 | 长春市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220200 | 吉林市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220300 | 四平市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220400 | 辽源市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220500 | 通化市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220600 | 白山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220700 | 松原市                 | city       | available | 下级边界集合 | district     | 0                    |
| 220800 | 白城市                 | city       | available | 下级边界集合 | district     | 0                    |
| 222400 | 延边朝鲜族自治州       | city       | available | 下级边界集合 | district     | 0                    |
| 230000 | 黑龙江省               | province   | available | 下级边界集合 | city         | 13                   |
| 230100 | 哈尔滨市               | city       | available | 下级边界集合 | district     | 0                    |
| 230200 | 齐齐哈尔市             | city       | available | 下级边界集合 | district     | 0                    |
| 230300 | 鸡西市                 | city       | available | 下级边界集合 | district     | 0                    |
| 230400 | 鹤岗市                 | city       | available | 下级边界集合 | district     | 0                    |
| 230500 | 双鸭山市               | city       | available | 下级边界集合 | district     | 0                    |
| 230600 | 大庆市                 | city       | available | 下级边界集合 | district     | 0                    |
| 230700 | 伊春市                 | city       | available | 下级边界集合 | district     | 0                    |
| 230800 | 佳木斯市               | city       | available | 下级边界集合 | district     | 0                    |
| 230900 | 七台河市               | city       | available | 下级边界集合 | district     | 0                    |
| 231000 | 牡丹江市               | city       | available | 下级边界集合 | district     | 0                    |
| 231100 | 黑河市                 | city       | available | 下级边界集合 | district     | 0                    |
| 231200 | 绥化市                 | city       | available | 下级边界集合 | district     | 0                    |
| 232700 | 大兴安岭地区           | city       | available | 下级边界集合 | district     | 0                    |
| 310000 | 上海市                 | province   | available | 下级边界集合 | district     | 0                    |
| 320000 | 江苏省                 | province   | available | 下级边界集合 | city         | 13                   |
| 320100 | 南京市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320200 | 无锡市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320300 | 徐州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320400 | 常州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320500 | 苏州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320600 | 南通市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320700 | 连云港市               | city       | available | 下级边界集合 | district     | 0                    |
| 320800 | 淮安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 320900 | 盐城市                 | city       | available | 下级边界集合 | district     | 0                    |
| 321000 | 扬州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 321100 | 镇江市                 | city       | available | 下级边界集合 | district     | 0                    |
| 321200 | 泰州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 321300 | 宿迁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330000 | 浙江省                 | province   | available | 下级边界集合 | city         | 11                   |
| 330100 | 杭州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330200 | 宁波市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330300 | 温州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330400 | 嘉兴市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330500 | 湖州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330600 | 绍兴市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330700 | 金华市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330800 | 衢州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 330900 | 舟山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 331000 | 台州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 331100 | 丽水市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340000 | 安徽省                 | province   | available | 下级边界集合 | city         | 16                   |
| 340100 | 合肥市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340200 | 芜湖市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340300 | 蚌埠市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340400 | 淮南市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340500 | 马鞍山市               | city       | available | 下级边界集合 | district     | 0                    |
| 340600 | 淮北市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340700 | 铜陵市                 | city       | available | 下级边界集合 | district     | 0                    |
| 340800 | 安庆市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341000 | 黄山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341100 | 滁州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341200 | 阜阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341300 | 宿州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341500 | 六安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341600 | 亳州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341700 | 池州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 341800 | 宣城市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350000 | 福建省                 | province   | available | 下级边界集合 | city         | 9                    |
| 350100 | 福州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350200 | 厦门市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350300 | 莆田市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350400 | 三明市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350500 | 泉州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350600 | 漳州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350700 | 南平市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350800 | 龙岩市                 | city       | available | 下级边界集合 | district     | 0                    |
| 350900 | 宁德市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360000 | 江西省                 | province   | available | 下级边界集合 | city         | 11                   |
| 360100 | 南昌市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360200 | 景德镇市               | city       | available | 下级边界集合 | district     | 0                    |
| 360300 | 萍乡市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360400 | 九江市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360500 | 新余市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360600 | 鹰潭市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360700 | 赣州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360800 | 吉安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 360900 | 宜春市                 | city       | available | 下级边界集合 | district     | 0                    |
| 361000 | 抚州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 361100 | 上饶市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370000 | 山东省                 | province   | available | 下级边界集合 | city         | 16                   |
| 370100 | 济南市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370200 | 青岛市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370300 | 淄博市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370400 | 枣庄市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370500 | 东营市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370600 | 烟台市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370700 | 潍坊市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370800 | 济宁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 370900 | 泰安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371000 | 威海市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371100 | 日照市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371300 | 临沂市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371400 | 德州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371500 | 聊城市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371600 | 滨州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 371700 | 菏泽市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410000 | 河南省                 | province   | available | 下级边界集合 | city         | 18                   |
| 410100 | 郑州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410200 | 开封市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410300 | 洛阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410400 | 平顶山市               | city       | available | 下级边界集合 | district     | 0                    |
| 410500 | 安阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410600 | 鹤壁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410700 | 新乡市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410800 | 焦作市                 | city       | available | 下级边界集合 | district     | 0                    |
| 410900 | 濮阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411000 | 许昌市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411100 | 漯河市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411200 | 三门峡市               | city       | available | 下级边界集合 | district     | 0                    |
| 411300 | 南阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411400 | 商丘市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411500 | 信阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411600 | 周口市                 | city       | available | 下级边界集合 | district     | 0                    |
| 411700 | 驻马店市               | city       | available | 下级边界集合 | district     | 0                    |
| 419001 | 济源市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 420000 | 湖北省                 | province   | available | 下级边界集合 | city         | 17                   |
| 420100 | 武汉市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420200 | 黄石市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420300 | 十堰市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420500 | 宜昌市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420600 | 襄阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420700 | 鄂州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420800 | 荆门市                 | city       | available | 下级边界集合 | district     | 0                    |
| 420900 | 孝感市                 | city       | available | 下级边界集合 | district     | 0                    |
| 421000 | 荆州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 421100 | 黄冈市                 | city       | available | 下级边界集合 | district     | 0                    |
| 421200 | 咸宁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 421300 | 随州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 422800 | 恩施土家族苗族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 429004 | 仙桃市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 429005 | 潜江市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 429006 | 天门市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 429021 | 神农架林区             | district   | not-found | 本级轮廓     | —            | 0                    |
| 430000 | 湖南省                 | province   | available | 下级边界集合 | city         | 14                   |
| 430100 | 长沙市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430200 | 株洲市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430300 | 湘潭市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430400 | 衡阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430500 | 邵阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430600 | 岳阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430700 | 常德市                 | city       | available | 下级边界集合 | district     | 0                    |
| 430800 | 张家界市               | city       | available | 下级边界集合 | district     | 0                    |
| 430900 | 益阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 431000 | 郴州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 431100 | 永州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 431200 | 怀化市                 | city       | available | 下级边界集合 | district     | 0                    |
| 431300 | 娄底市                 | city       | available | 下级边界集合 | district     | 0                    |
| 433100 | 湘西土家族苗族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 440000 | 广东省                 | province   | available | 下级边界集合 | city         | 21                   |
| 440100 | 广州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440200 | 韶关市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440300 | 深圳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440400 | 珠海市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440500 | 汕头市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440600 | 佛山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440700 | 江门市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440800 | 湛江市                 | city       | available | 下级边界集合 | district     | 0                    |
| 440900 | 茂名市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441200 | 肇庆市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441300 | 惠州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441400 | 梅州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441500 | 汕尾市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441600 | 河源市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441700 | 阳江市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441800 | 清远市                 | city       | available | 下级边界集合 | district     | 0                    |
| 441900 | 东莞市                 | city       | not-found | 本级轮廓     | —            | 0                    |
| 442000 | 中山市                 | city       | not-found | 本级轮廓     | —            | 0                    |
| 445100 | 潮州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 445200 | 揭阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 445300 | 云浮市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450000 | 广西壮族自治区         | province   | available | 下级边界集合 | city         | 14                   |
| 450100 | 南宁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450200 | 柳州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450300 | 桂林市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450400 | 梧州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450500 | 北海市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450600 | 防城港市               | city       | available | 下级边界集合 | district     | 0                    |
| 450700 | 钦州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450800 | 贵港市                 | city       | available | 下级边界集合 | district     | 0                    |
| 450900 | 玉林市                 | city       | available | 下级边界集合 | district     | 0                    |
| 451000 | 百色市                 | city       | available | 下级边界集合 | district     | 0                    |
| 451100 | 贺州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 451200 | 河池市                 | city       | available | 下级边界集合 | district     | 0                    |
| 451300 | 来宾市                 | city       | available | 下级边界集合 | district     | 0                    |
| 451400 | 崇左市                 | city       | available | 下级边界集合 | district     | 0                    |
| 460000 | 海南省                 | province   | available | 下级边界集合 | city         | 19                   |
| 460100 | 海口市                 | city       | available | 下级边界集合 | district     | 0                    |
| 460200 | 三亚市                 | city       | available | 下级边界集合 | district     | 0                    |
| 460300 | 三沙市                 | city       | available | 下级边界集合 | district     | 0                    |
| 460400 | 儋州市                 | city       | not-found | 本级轮廓     | —            | 0                    |
| 469001 | 五指山市               | district   | not-found | 本级轮廓     | —            | 0                    |
| 469002 | 琼海市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469005 | 文昌市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469006 | 万宁市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469007 | 东方市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469021 | 定安县                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469022 | 屯昌县                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469023 | 澄迈县                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469024 | 临高县                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 469025 | 白沙黎族自治县         | district   | not-found | 本级轮廓     | —            | 0                    |
| 469026 | 昌江黎族自治县         | district   | not-found | 本级轮廓     | —            | 0                    |
| 469027 | 乐东黎族自治县         | district   | not-found | 本级轮廓     | —            | 0                    |
| 469028 | 陵水黎族自治县         | district   | not-found | 本级轮廓     | —            | 0                    |
| 469029 | 保亭黎族苗族自治县     | district   | not-found | 本级轮廓     | —            | 0                    |
| 469030 | 琼中黎族苗族自治县     | district   | not-found | 本级轮廓     | —            | 0                    |
| 500000 | 重庆市                 | province   | available | 下级边界集合 | district     | 0                    |
| 510000 | 四川省                 | province   | available | 下级边界集合 | city         | 21                   |
| 510100 | 成都市                 | city       | available | 下级边界集合 | district     | 0                    |
| 510300 | 自贡市                 | city       | available | 下级边界集合 | district     | 0                    |
| 510400 | 攀枝花市               | city       | available | 下级边界集合 | district     | 0                    |
| 510500 | 泸州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 510600 | 德阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 510700 | 绵阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 510800 | 广元市                 | city       | available | 下级边界集合 | district     | 0                    |
| 510900 | 遂宁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511000 | 内江市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511100 | 乐山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511300 | 南充市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511400 | 眉山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511500 | 宜宾市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511600 | 广安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511700 | 达州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511800 | 雅安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 511900 | 巴中市                 | city       | available | 下级边界集合 | district     | 0                    |
| 512000 | 资阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 513200 | 阿坝藏族羌族自治州     | city       | available | 下级边界集合 | district     | 0                    |
| 513300 | 甘孜藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 513400 | 凉山彝族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 520000 | 贵州省                 | province   | available | 下级边界集合 | city         | 9                    |
| 520100 | 贵阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 520200 | 六盘水市               | city       | available | 下级边界集合 | district     | 0                    |
| 520300 | 遵义市                 | city       | available | 下级边界集合 | district     | 0                    |
| 520400 | 安顺市                 | city       | available | 下级边界集合 | district     | 0                    |
| 520500 | 毕节市                 | city       | available | 下级边界集合 | district     | 0                    |
| 520600 | 铜仁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 522300 | 黔西南布依族苗族自治州 | city       | available | 下级边界集合 | district     | 0                    |
| 522600 | 黔东南苗族侗族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 522700 | 黔南布依族苗族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 530000 | 云南省                 | province   | available | 下级边界集合 | city         | 16                   |
| 530100 | 昆明市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530300 | 曲靖市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530400 | 玉溪市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530500 | 保山市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530600 | 昭通市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530700 | 丽江市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530800 | 普洱市                 | city       | available | 下级边界集合 | district     | 0                    |
| 530900 | 临沧市                 | city       | available | 下级边界集合 | district     | 0                    |
| 532300 | 楚雄彝族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 532500 | 红河哈尼族彝族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 532600 | 文山壮族苗族自治州     | city       | available | 下级边界集合 | district     | 0                    |
| 532800 | 西双版纳傣族自治州     | city       | available | 下级边界集合 | district     | 0                    |
| 532900 | 大理白族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 533100 | 德宏傣族景颇族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 533300 | 怒江傈僳族自治州       | city       | available | 下级边界集合 | district     | 0                    |
| 533400 | 迪庆藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 540000 | 西藏自治区             | province   | available | 下级边界集合 | city         | 7                    |
| 540100 | 拉萨市                 | city       | available | 下级边界集合 | district     | 0                    |
| 540200 | 日喀则市               | city       | available | 下级边界集合 | district     | 0                    |
| 540300 | 昌都市                 | city       | available | 下级边界集合 | district     | 0                    |
| 540400 | 林芝市                 | city       | available | 下级边界集合 | district     | 0                    |
| 540500 | 山南市                 | city       | available | 下级边界集合 | district     | 0                    |
| 540600 | 那曲市                 | city       | available | 下级边界集合 | district     | 0                    |
| 542500 | 阿里地区               | city       | available | 下级边界集合 | district     | 0                    |
| 610000 | 陕西省                 | province   | available | 下级边界集合 | city         | 10                   |
| 610100 | 西安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610200 | 铜川市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610300 | 宝鸡市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610400 | 咸阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610500 | 渭南市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610600 | 延安市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610700 | 汉中市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610800 | 榆林市                 | city       | available | 下级边界集合 | district     | 0                    |
| 610900 | 安康市                 | city       | available | 下级边界集合 | district     | 0                    |
| 611000 | 商洛市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620000 | 甘肃省                 | province   | available | 下级边界集合 | city         | 14                   |
| 620100 | 兰州市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620200 | 嘉峪关市               | city       | not-found | 本级轮廓     | —            | 0                    |
| 620300 | 金昌市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620400 | 白银市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620500 | 天水市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620600 | 武威市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620700 | 张掖市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620800 | 平凉市                 | city       | available | 下级边界集合 | district     | 0                    |
| 620900 | 酒泉市                 | city       | available | 下级边界集合 | district     | 0                    |
| 621000 | 庆阳市                 | city       | available | 下级边界集合 | district     | 0                    |
| 621100 | 定西市                 | city       | available | 下级边界集合 | district     | 0                    |
| 621200 | 陇南市                 | city       | available | 下级边界集合 | district     | 0                    |
| 622900 | 临夏回族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 623000 | 甘南藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 630000 | 青海省                 | province   | available | 下级边界集合 | city         | 8                    |
| 630100 | 西宁市                 | city       | available | 下级边界集合 | district     | 0                    |
| 630200 | 海东市                 | city       | available | 下级边界集合 | district     | 0                    |
| 632200 | 海北藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 632300 | 黄南藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 632500 | 海南藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 632600 | 果洛藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 632700 | 玉树藏族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 632800 | 海西蒙古族藏族自治州   | city       | available | 下级边界集合 | district     | 0                    |
| 640000 | 宁夏回族自治区         | province   | available | 下级边界集合 | city         | 5                    |
| 640100 | 银川市                 | city       | available | 下级边界集合 | district     | 0                    |
| 640200 | 石嘴山市               | city       | available | 下级边界集合 | district     | 0                    |
| 640300 | 吴忠市                 | city       | available | 下级边界集合 | district     | 0                    |
| 640400 | 固原市                 | city       | available | 下级边界集合 | district     | 0                    |
| 640500 | 中卫市                 | city       | available | 下级边界集合 | district     | 0                    |
| 650000 | 新疆维吾尔自治区       | province   | available | 下级边界集合 | city         | 24                   |
| 650100 | 乌鲁木齐市             | city       | available | 下级边界集合 | district     | 0                    |
| 650200 | 克拉玛依市             | city       | available | 下级边界集合 | district     | 0                    |
| 650400 | 吐鲁番市               | city       | available | 下级边界集合 | district     | 0                    |
| 650500 | 哈密市                 | city       | available | 下级边界集合 | district     | 0                    |
| 652300 | 昌吉回族自治州         | city       | available | 下级边界集合 | district     | 0                    |
| 652700 | 博尔塔拉蒙古自治州     | city       | available | 下级边界集合 | district     | 0                    |
| 652800 | 巴音郭楞蒙古自治州     | city       | available | 下级边界集合 | district     | 0                    |
| 652900 | 阿克苏地区             | city       | available | 下级边界集合 | district     | 0                    |
| 653000 | 克孜勒苏柯尔克孜自治州 | city       | available | 下级边界集合 | district     | 0                    |
| 653100 | 喀什地区               | city       | available | 下级边界集合 | district     | 0                    |
| 653200 | 和田地区               | city       | available | 下级边界集合 | district     | 0                    |
| 654000 | 伊犁哈萨克自治州       | city       | available | 下级边界集合 | district     | 0                    |
| 654200 | 塔城地区               | city       | available | 下级边界集合 | district     | 0                    |
| 654300 | 阿勒泰地区             | city       | available | 下级边界集合 | district     | 0                    |
| 659001 | 石河子市               | district   | not-found | 本级轮廓     | —            | 0                    |
| 659002 | 阿拉尔市               | district   | not-found | 本级轮廓     | —            | 0                    |
| 659003 | 图木舒克市             | district   | not-found | 本级轮廓     | —            | 0                    |
| 659004 | 五家渠市               | district   | not-found | 本级轮廓     | —            | 0                    |
| 659005 | 北屯市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 659006 | 铁门关市               | district   | not-found | 本级轮廓     | —            | 0                    |
| 659007 | 双河市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 659008 | 可克达拉市             | district   | not-found | 本级轮廓     | —            | 0                    |
| 659009 | 昆玉市                 | district   | not-found | 本级轮廓     | —            | 0                    |
| 659010 | 胡杨河市               | district   | not-found | 本级轮廓     | —            | 0                    |
| 710000 | 台湾省                 | province   | not-found | 本级轮廓     | —            | 0                    |
| 810000 | 香港特别行政区         | province   | available | 下级边界集合 | district     | 0                    |
| 820000 | 澳门特别行政区         | province   | available | 下级边界集合 | district     | 0                    |

`available`：`_full.json` 成功；`not-found`：HTTP 404；`error`：其他请求或数据校验失败。404 与临时错误均保留原请求错误及回退结果，见本次 `.cache/update-report.json`。其中 `checkedAt` 记录检查时间，`sources[].mode` 标明网络获取或缓存；manifest 的时间表示数据版本，不表示最新检查时间。
