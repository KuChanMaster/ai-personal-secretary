# 我的 AI 个人秘书

一个低摩擦的个人执行系统：收任务 -> 今日行动 -> 提醒 -> 完成/延期 -> 晚间复盘 -> 次日计划。

## 当前进度

- 阶段 0：产品决策与设计冻结 ✅
- 阶段 1：可安装的离线 PWA 骨架 ✅（本地任务增删改查、今日/未来视图、离线缓存）

## 技术栈

- Vite + React + TypeScript
- Dexie（IndexedDB 本地离线数据库）
- 手写 Service Worker + Web App Manifest（PWA）

## 本地运行

```bash
npm install
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物在 `dist/` 目录，可直接部署到任意静态托管服务。

## 文档索引

- `docs/00-产品决策.md`
- `docs/01-数据模型.md`
- `docs/02-页面清单与草图.md`
- `docs/03-通知与提醒设计.md`
- `docs/04-开发路线与验收.md`
- `docs/05-风险与预算.md`

## 下一阶段

阶段 2：即开即用匿名登录 + Supabase 云端同步。