# Geo Areas

- [@idux/geo-areas](packages/geo-areas/README.md) 提供双语行政区划、国际区号及 GeoJSON。
- [API 文档](API.md) 定义全部公开接口、参数、返回值和数据字段。
- [Playground](packages/playground/) 使用 Vue 3 和 iDux 组件演示数据包，支持地图下钻。

```sh
pnpm install --frozen-lockfile
pnpm playground
pnpm playground:build
pnpm check
```

运行 `pnpm update:data` 刷新数据。Playground 构建产物位于 `packages/playground/dist`。

## 打包与发布

根工作区与 Playground 均为私有包，仅发布 `packages/geo-areas` 中的 `@idux/geo-areas`。在仓库根目录运行：

```sh
pnpm check
pnpm --dir packages/geo-areas pack
```

发布包生成在 `packages/geo-areas/`，包含构建产物、数据包 README、许可证及数据来源说明。`prepack` 会自动执行构建、测试和消费者类型检查。

版本号只维护在 `packages/geo-areas/package.json`。修改版本并提交后，推送匹配的 `v<version>` 标签触发发布；CI 与发布工作流使用同一打包脚本，生成 `packages/geo-areas/release.tgz`。npm Trusted Publisher 配置及手动发布方式见[数据包发布说明](packages/geo-areas/README.md#发布)。

## 代码检查

- `pnpm lint` 使用 Oxlint 检查源码。
- `pnpm format` 使用 Oxfmt 格式化，`pnpm format:check` 检查格式。
- 安装依赖时 Husky 会启用提交钩子，提交前由 lint-staged 检查并格式化暂存文件。生成的数据、来源清单和第三方许可证保持原样。

项目代码采用 MIT 许可证。数据来源及第三方条款见 [数据包说明](packages/geo-areas/THIRD_PARTY_NOTICES.md)。

全球总览 `world` 使用 Apache ECharts 示例地图。中国省级地图可选择 DataV 的 `100000` 或 ECharts 3.8.5 的 `china`（`CN-provinces` 别名）。两版覆盖范围和下钻编码见[数据包 README](packages/geo-areas/README.md)。
