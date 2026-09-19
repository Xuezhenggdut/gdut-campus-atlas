# GitHub 与 Cloudflare Pages 部署

这个项目是 Vite 静态网页，源码公开托管在 GitHub，正式网页使用 Cloudflare 最新的静态资源 Workers 部署方式（Cloudflare Pages 的后续方案），不占用 GitHub Pages。

## GitHub

公开仓库：https://github.com/Xuezhenggdut/gdut-campus-atlas

本地仓库的默认分支为 `main`。生成目录、离线 GLB、研究资料、截图与交付压缩包已在 `.gitignore` 中排除；Cloudflare 会从源码重新生成 `dist/`。

## Cloudflare 部署

线上地址：https://gdut-campus-atlas.gdut-campus-atlas.workers.dev

项目已配置 `@cloudflare/vite-plugin`、Wrangler 和 `wrangler.jsonc`。登录 Cloudflare 后执行：

```powershell
npm.cmd run deploy
```

该命令先执行 TypeScript 检查和 Vite 构建，再将 `dist/` 静态资源发布到 Cloudflare。`wrangler.jsonc` 将未知路径回退到单页应用入口。项目使用相对资源路径，网页运行不依赖研究资料、离线 GLB 或本地 Node 服务。

## 本地发布前检查

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run deploy
```

Cloudflare Pages 单个静态文件上限为 25 MiB，因此不要把 `models/gdut-campus.glb` 复制进 `public/` 或 `dist/`。当前正式网页不包含该离线模型。
