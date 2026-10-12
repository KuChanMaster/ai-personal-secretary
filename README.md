# 我的 AI 个人秘书

一个低摩擦的个人执行系统：收任务 -> 今日行动 -> 提醒 -> 完成/延期 -> 晚间复盘 -> 次日计划。

## 当前进度

- 阶段 0：产品决策与设计冻结 ✅
- 阶段 1：可安装的离线 PWA 骨架 ✅
- 阶段 2：即开即用匿名登录 + Supabase 云端同步 🚧（代码骨架完成，待配置 Supabase 后联调）

## 技术栈

- Vite + React + TypeScript
- Dexie（IndexedDB 本地离线数据库）
- Supabase（匿名登录 + Postgres + RLS）
- 手写 Service Worker + Web App Manifest（PWA）

## 本地运行

```bash
npm install
npm run dev
```

## 启用云端同步

1. 复制 `.env.example` 为 `.env`，填入 Supabase 项目信息。
2. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
3. 在 Supabase 后台开启 Anonymous sign-ins。
4. 详细步骤见 `docs/06-阶段2同步与openGym借鉴.md`。

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
- `docs/06-阶段2同步与openGym借鉴.md`

## 下一阶段

阶段 3：安卓通知与多邻国式提醒。