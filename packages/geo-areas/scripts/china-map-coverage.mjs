import { format } from 'oxfmt'

/** Describe only maps actually requested; district endpoints are outside this download depth. */
export function describeChinaMaps(maps, requests, areaByCode) {
  return [...requests]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, request]) => {
      const map = maps.get(code)
      const area = areaByCode.get(code)
      const self = map.features.find((feature) => feature.properties.code === code)?.properties
      const features = map.features.filter(
        (feature) => feature.properties.code !== code && /^\d{6}$/.test(feature.properties.code),
      )
      const parentCode =
        code === '100000'
          ? null
          : String(self?.parent?.adcode ?? area?.parentCode ?? self?.acroutes?.at(-1) ?? '100000')
      return {
        code,
        names: code === '100000' ? { 'zh-CN': '中国', en: 'China' } : (area?.name ?? self?.names),
        level: code === '100000' ? 'country' : (area?.level ?? self?.level),
        parentCode,
        ...request,
        content: features.length > 0 ? 'children' : 'outline',
        hasChildBoundaries: features.length > 0,
        featureCount: map.features.length,
        featureLevels: [
          ...new Set(features.map((feature) => feature.properties.level).filter(Boolean)),
        ].sort(),
        childMapIds: features
          .map((feature) => feature.properties.code)
          .filter((id) => maps.has(id))
          .sort(),
      }
    })
}
export async function chinaMapCoverageMarkdown(records, depth) {
  const missing = records.filter((item) => item.fullEndpointStatus === 'not-found')
  const errors = records.filter((item) => item.fullEndpointStatus === 'error')
  const children = records.filter((item) => item.hasChildBoundaries)
  const markdown = `# 中国地图下钻覆盖\n\n本清单随数据更新自动生成；逐项机器可读信息位于发布包 manifest 的 \`coverage.chinaMaps\`。\n\n检查范围：全国、省级${depth === 'prefecture' ? '和市级' : ''}地图，共 ${records.length} 个地区。\n\n- ${children.length} 个地区提供下级边界集合。\n- ${missing.length} 个地区的 \`_full.json\` 返回 404，已成功获取本级 \`.json\`。\n- ${errors.length} 个地区的 \`_full.json\` 因非 404 错误失败后回退；不能据此认定没有下级边界。\n\n没有 \`_full.json\` 表示此数据源当前不提供该地区的下级边界，不表示该行政区域没有下级单位。区县仅作为市级地图中的要素提供，未请求区县地图接口；镇街地图不在当前下载范围。文字行政树、单独地图文件和下级边界集合是不同的覆盖范围。\`level\` 优先采用 Vant 行政树层级，无法对应时采用 DataV 本级要素的层级；它可能与地图要素的 DataV 层级不同。例如省直辖县级单位在行政树中为 district，在 DataV 地图中可能为 city。\n\n## 未提供下级边界接口的地区（404）\n\n| adcode | 地区 | 行政树层级 | 父级代码 | 本级轮廓 |\n| --- | --- | --- | --- | --- |\n${missing.map((item) => `| ${item.code} | ${item.names['zh-CN']} | ${item.level} | ${item.parentCode ?? '—'} | [JSON](${item.sourceUrl}) |`).join('\n')}\n\n## 临时错误后回退的地区\n\n${errors.length ? errors.map((item) => `- ${item.code} ${item.names['zh-CN']}：HTTP ${item.fullHttpStatus ?? '未知／网络错误'}，仅提供本级轮廓。`).join('\n') : '无。'}\n\n## 全部已请求地区\n\n| adcode | 地区 | 行政树层级 | 下级接口 | 地图内容 | 下级边界层级 | 可继续打开的子地图数 |\n| --- | --- | --- | --- | --- | --- | --- |\n${records.map((item) => `| ${item.code} | ${item.names['zh-CN']} | ${item.level} | ${item.fullEndpointStatus} | ${item.hasChildBoundaries ? '下级边界集合' : '本级轮廓'} | ${item.featureLevels.join(', ') || '—'} | ${item.childMapIds.length} |`).join('\n')}\n\n\`available\`：\`_full.json\` 成功；\`not-found\`：HTTP 404；\`error\`：其他请求或数据校验失败。404 与临时错误均保留原请求错误及回退结果，见本次 \`.cache/update-report.json\`。其中 \`checkedAt\` 记录检查时间，\`sources[].mode\` 标明网络获取或缓存；manifest 的时间表示数据版本，不表示最新检查时间。\n`
  const result = await format('CHINA_MAP_COVERAGE.md', markdown)
  if (result.errors.length) throw new Error(JSON.stringify(result.errors))
  return result.code
}
