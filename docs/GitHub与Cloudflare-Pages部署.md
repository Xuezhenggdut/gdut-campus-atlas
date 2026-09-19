# GitHub 与 Cloudflare Pages 部署

这个项目是 Vite 静态网页，源码可放在 GitHub，正式网页由 Cloudflare Pages 免费构建和托管，不占用 GitHub Pages。

## GitHub

本地仓库的默认分支为 `main`。生成目录、离线 GLB、研究资料、截图与交付压缩包已在 `.gitignore` 中排除；Cloudflare 会从源码重新生成 `dist/`。

## Cloudflare Pages

1. 登录 Cloudflare，进入 **Workers & Pages**，选择 **Create application → Pages → Import an existing Git repository**。
2. 连接 GitHub 并选择本项目仓库。
3. 使用以下构建设置：

   - Production branch：`main`
   - Framework preset：`Vite`
   - Build command：`npm run build`
   - Build output directory：`dist`
   - Root directory：留空
   - Node.js：22

4. 保存并部署。完成后会得到 `项目名.pages.dev` 地址；以后推送到 `main` 会自动重新构建。

项目使用相对资源路径，部署在 `pages.dev` 根路径或自定义域名均可。网页运行不依赖研究资料、离线 GLB 或本地 Node 服务。

## 本地发布前检查

```powershell
npm.cmd test
npm.cmd run build
```

Cloudflare Pages 单个静态文件上限为 25 MiB，因此不要把 `models/gdut-campus.glb` 复制进 `public/` 或 `dist/`。当前正式网页不包含该离线模型。
