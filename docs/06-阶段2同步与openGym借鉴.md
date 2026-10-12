# 06 阶段 2 同步设计与 openGym 借鉴

## 1. 参考项目
- 项目：DuarteSantos8/openGym
- 性质：自托管健身与体重追踪器，AGPL v3。
- 我们只借鉴思路，不直接复制代码，避免 AGPL 许可影响本项目。

## 2. 值得借鉴并已部分采用
- 即开即用：首次打开自动创建匿名身份，无需注册。
- 离线优先：本地先读写，联网后同步。
- 不静默覆盖：同步前比较 updated_at，较新的数据才覆盖本地或上传。
- 同一代码库后续用 Capacitor 打包安卓 APK。
- AI 默认关闭，修改需用户确认，支持 OpenAI 兼容接口。
- 随时导出完整 JSON 备份。

## 3. 阶段 2 同步设计
- 本地主数据库：IndexedDB（Dexie）。
- 云端：Supabase Postgres，开启 RLS。
- 身份：Supabase 匿名登录，用户不感知。
- 每个任务本地字段：uuid、updated_at、deleted_at、synced_at。
- 同步顺序：先拉取云端数据合并到本地，再上传本地变更。
- 合并规则：
  - 云端 updated_at 比本地新时，用云端覆盖本地。
  - 本地 synced_at 为空或 updated_at 比 synced_at 新时，上传到云端。
  - 删除使用软删除和 deleted_at，避免墓碑丢失。
- 当前为“行级最后修改优先”；单人使用冲突概率低。后续可升级为字段级合并。

## 4. Supabase 配置步骤
1. 创建 Supabase 项目（可选区域）。
2. 在 SQL Editor 执行 `supabase/schema.sql`。
3. 在 Authentication > Sign In / Providers 中开启 Anonymous sign-ins。
4. 复制项目 URL 和 anon public key。
5. 在项目根目录创建 `.env`：
   ```
   VITE_SUPABASE_URL=你的项目URL
   VITE_SUPABASE_ANON_KEY=你的anon key
   ```
6. 重启 `npm run dev`，页面顶部同步状态应显示“同步中”然后“已同步”。

## 5. 阶段 2 验收清单
- 首次打开无登录页。
- 手机断网可创建、编辑、完成任务。
- 两台设备联网后数据互通。
- 重装应用后数据可恢复。
- 不同匿名身份的数据互相隔离。
- 删除任务不会重新出现。