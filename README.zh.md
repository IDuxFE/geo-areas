# Geo Areas

[English](README.md) | 简体中文

[![CI](https://github.com/IDuxFE/geo-areas/actions/workflows/ci.yml/badge.svg)](https://github.com/IDuxFE/geo-areas/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IDuxFE/geo-areas/actions/workflows/codeql.yml/badge.svg)](https://github.com/IDuxFE/geo-areas/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/IDuxFE/geo-areas/branch/main/graph/badge.svg)](https://codecov.io/gh/IDuxFE/geo-areas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FIDuxFE%2Fgeo-areas.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FIDuxFE%2Fgeo-areas?ref=badge_shield)

面向 TypeScript 的地理数据：国家／地区、国际电话呼叫码、行政区划及可用于 ECharts 的 GeoJSON，提供自动数据更新和交互式地图 Playground。

- [@idux/geo-areas](packages/geo-areas/README.zh.md)：ESM 数据包，含 TypeScript 类型声明和按需加载的地图。
- [API 文档](API.zh.md)：公开接口、参数、返回值和数据字段。
- [Playground](https://iduxfe.github.io/geo-areas/)：使用 Vue 3 和 iDux 组件演示地图下钻（[源码](packages/playground/)）。`main` 的 CI 通过后自动部署。

## 本地开发

需要 Node.js 22+ 和 pnpm 11.8.0。项目尚在开发，未发布 npm 包，可先通过工作区试用。

```sh
pnpm install --frozen-lockfile
pnpm playground
pnpm playground:build
pnpm check
pnpm test:coverage
```

运行 `pnpm update:data` 从公开上游刷新数据。Playground 构建产物位于 `packages/playground/dist`。

`pnpm lint` 使用 Oxlint 检查源码；`pnpm format` 使用 Oxfmt 格式化，`pnpm format:check` 检查格式。Husky 和 lint-staged 在提交前检查暂存文件。生成数据、来源清单和第三方许可证快照保留原始格式。

## 打包与变更说明

根工作区和 Playground 均为私有包，仅发布 `packages/geo-areas` 中的数据包。

```sh
pnpm changeset                    # 为后续发布记录数据包变更
pnpm check
pnpm --dir packages/geo-areas pack
```

打包产物包含运行时数据、文档、许可证和来源说明。`prepack` 自动执行构建、测试及消费者类型检查。CI 还会构建 Playground 并上传预览包，不发布 npm。

Changesets 可以持续累积；准备发布时，维护者在独立分支运行 `pnpm version:packages`，更新 `packages/geo-areas/package.json` 和 [CHANGELOG](packages/geo-areas/CHANGELOG.md)，再提交发布 PR。该命令不发包。目前 npm 发布已禁用，启用前请阅读[维护者配置](.github/MAINTAINERS.md)。

## 数据与许可证

项目代码采用 MIT 许可证。第三方数据适用各自条款，见[来源说明](packages/geo-areas/THIRD_PARTY_NOTICES.md)，其中记录了尚待确认的再分发条件。自动依赖扫描不能替代地图数据再分发授权确认。

全球总览使用 Apache ECharts 示例地图。中国省级地图可选择 DataV `100000` 或 ECharts 3.8.5 `china`（`CN-provinces` 别名）。覆盖范围和下钻编码见[数据包说明](packages/geo-areas/README.zh.md)。

## 参与贡献

Fork 仓库后创建分支，向 `IDuxFE/geo-areas:main` 提交 PR。`main` 禁止直接修改，合并前须通过 CI 并解决评审讨论；维护者使用 rebase 合并。

检查命令和 Changesets 用法见 [CONTRIBUTING.md](CONTRIBUTING.md)，漏洞报告方式见 [SECURITY.md](SECURITY.md)。
