---
index: 2
title: 指南
---

## 按需加载与 ECharts 展示

```ts
import { setLocale } from '@idux/geo-areas/locale'
import { hasGeoJSON, loadGeoJSON } from '@idux/geo-areas/geojson'
import { registerMap } from 'echarts/core'

setLocale('zh-CN')
const id: string = 'CN-provinces'
if (hasGeoJSON(id)) {
  const map = await loadGeoJSON(id)
  registerMap('china', map)
}
```

使用 ECharts 前需自行安装，并按需注册对应图表、组件与渲染器。数据包仅提供数据，不包含图表实例。

### 按代码匹配业务数据

ECharts 默认按要素名称匹配。设置 `nameProperty: 'code'` 可避免语言切换影响数据关联：

```ts
const series = {
  type: 'map',
  map: 'china',
  nameProperty: 'code',
  data: [{ name: '370000', value: 100 }],
}
```

使用 `geo` 底图时也在 `geo` 上设置 `nameProperty: 'code'`，并让区域配置的 `name` 使用相同代码。需要显示地区名称时，从要素的 `properties.name` 建立代码到名称的映射。

### 实现下钻

点击区域后从要素取得代码，先检查目标地图是否存在，再加载并注册。使用路径栈记录当前地图与父级，返回上一级时恢复父级地图。

地图存在不等于包含下级边界。部分地图只有本级轮廓，应结合实际要素与覆盖信息决定是否继续下钻；站点示例的导航索引由构建脚本生成，不属于数据包 API。

中国行政区状态标记优先使用行政中心坐标（省级为省会／首府等驻地）。底图未携带坐标时，通过 `getChinaArea(adcode)` 查询；行政中心缺失后再使用几何中心，均缺失时才回退到轮廓包围盒中心。

### 加载与生命周期

为加载过程提供等待、失败与重试状态。快速切换地图或语言时，使用请求序号或过期标记，避免旧请求覆盖新结果。语言变化后重新加载，或调用 `localizeGeoJSON`，再重新注册地图。

容器尺寸变化时调用图表的 `resize()`；组件卸载时断开观察器并调用 `dispose()`。示例采用的状态数值与颜色为演示数据，由业务自行提供。

## 本页示例覆盖

- 异步加载、地图下钻、返回与状态标记。
- 从 `availableMaps` 选择地图，或输入动态 ID，通过 `hasGeoJSON` 查看是否存在；ID 区分大小写，可用 `us` 或未知代码体验缺失状态。
- 直接导入 `china.json`，对照原始双语属性与 `localizeGeoJSON` 副本；切换页面语言后重新本地化，不重新加载几何数据，也不改写原始 JSON。
- 查看随包 manifest 的生成时间、指纹、地图资产数与来源。`availableMaps` 额外包含 `china` 别名，因此条目数不等于 manifest 的源地图资产数。

检查地图 ID 与 JSON 本地化是独立操作：该示例始终以直接导入的中国省级 JSON 展示本地化，选择其他 ID 只改变可用性检查结果。直接导入会让该 JSON 随示例模块加载；业务需要按需加载时使用 `loadGeoJSON`。
