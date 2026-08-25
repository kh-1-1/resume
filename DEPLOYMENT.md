# 部署指南

Resume Maker 是纯前端 Vite 应用，生产构建输出在 `dist/`，可部署到任意静态站点托管平台。项目使用 Hash 路由，简历编辑地址形如 `/#/resume/<id>`，因此不需要 SPA 回退重写。

## 0. 拉取后的一键启动

### Windows

双击仓库根目录的 `start-resume.cmd`，或在 PowerShell 中执行：

```powershell
.\start-resume.cmd
```

脚本会检查 Node.js 版本。电脑尚未安装兼容版本时，会调用 `winget` 安装 Node.js LTS；随后使用仓库内的 `.npm-cache` 自动执行 `npm install`、完整测试、生产构建，并在 `http://127.0.0.1:4173/` 启动本地生产预览。该脚本可安全重复运行；CI 和 Docker 仍使用严格的 `npm ci`。

只安装、测试和构建，不启动服务：

```powershell
.\scripts\setup-and-run.ps1 -NoServe
```

跳过浏览器测试但仍完成依赖安装和生产构建：

```powershell
.\scripts\setup-and-run.ps1 -SkipTests -NoServe
```

### macOS / Linux

先安装 Node.js 22 LTS，然后执行：

```bash
chmod +x start-resume.sh
./start-resume.sh
```

### Docker / 服务器

服务器只需预先安装 Docker。拉取仓库后执行：

```bash
docker compose up --build -d
```

Docker 会在 Node.js 22 构建阶段运行 `npm ci` 和生产构建，再将 `dist/` 交给 Nginx。默认地址为 `http://服务器地址:8080/`。

常用维护命令：

```bash
docker compose logs -f
docker compose restart
docker compose down
git pull && docker compose up --build -d
```

`.dockerignore` 会排除 `private/`、本地环境文件、构建输出和个人资料目录，避免私有简历进入镜像上下文。

## 1. 部署前检查

在项目根目录执行：

```bash
npm ci
npm test
npm audit
```

成功标准：

- `npm test` 通过 lint、TypeScript/生产构建和 Playwright 浏览器测试。
- `npm audit` 显示 `0 vulnerabilities`。
- `dist/` 中不存在 `private-resume-import.json`。

本地检查生产版：

```bash
npm run build
npm run preview
```

打开终端显示的地址，测试新建简历、刷新保存、JSON 导入导出和打印 PDF。`vite preview` 只用于本地验收，不要将它当作生产服务器。

## 2. 创建安全的公开仓库

公开仓库的 `main` 已经是无个人数据历史的发布分支。维护者本机若仍保留带私有历史的 `master`，请继续只发布 `codex/open-source`，不要将私有分支推送到公开仓库。

1. 在 GitHub 新建一个空仓库，不要自动创建 README、`.gitignore` 或 License。
2. 在本地项目根目录添加远程地址：

```bash
git remote add origin https://github.com/<YOUR_NAME>/<REPOSITORY>.git
```

3. 将安全分支发布为远程 `main`：

```bash
git push -u origin codex/open-source:main
```

4. 在 GitHub 仓库页面确认默认分支为 `main`。

## 3. GitHub Pages（推荐）

仓库已包含 `.github/workflows/deploy-pages.yml`，每次推送远程 `main` 都会自动构建和部署。工作流会根据仓库名自动设置 Vite 子路径，无需手工改 `vite.config.ts`。

1. 推送 `codex/open-source` 到新仓库 `main`。
2. 进入 GitHub 仓库的 **Settings → Pages**。
3. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
4. 进入 **Actions** 页面，等待 `Deploy to GitHub Pages` 工作流变绿。
5. 在 **Settings → Pages** 或工作流的 `Deploy` 步骤中打开站点地址。

普通项目仓库地址通常为：

```txt
https://<YOUR_NAME>.github.io/<REPOSITORY>/
```

如果仓库名本身是 `<YOUR_NAME>.github.io`，站点会部署在根路径 `/`。

### 手动重新部署

进入 **Actions → Deploy to GitHub Pages → Run workflow**。也可以提交新代码并推送 `main`。

## 4. Vercel

### 从 Git 导入

1. 登录 Vercel，选择 **Add New → Project**。
2. 导入刚创建的公开 Git 仓库。
3. Framework Preset 选择 **Vite**。
4. Root Directory 保持 `./`。
5. Build Command 填写 `npm run build`。
6. Output Directory 填写 `dist`。
7. Node.js 版本选择 22。
8. 不要添加 `VITE_ENABLE_PRIVATE_RESUME_SEED`。
9. 点击 **Deploy**。

每次推送 `main` 后 Vercel 会自动更新生产站点；Pull Request 会生成独立预览地址。

### CLI 部署

```bash
npm install -g vercel
vercel
vercel --prod
```

首次执行会要求登录、选择团队并关联项目。`.vercel/` 是本地项目配置，不要提交。

## 5. Netlify

### 从 Git 导入

1. 登录 Netlify，选择 **Add new project → Import an existing project**。
2. 连接 GitHub 并选择公开仓库。
3. Production branch 选择 `main`。
4. Build command 填写 `npm run build`。
5. Publish directory 填写 `dist`。
6. Node.js 版本设为 22，或添加环境变量 `NODE_VERSION=22`。
7. 不要添加 `VITE_ENABLE_PRIVATE_RESUME_SEED`。
8. 点击 **Deploy**。

### CLI 部署

```bash
npm install -g netlify-cli
netlify init
netlify deploy
netlify deploy --prod
```

如果采用手动构建产物部署，在 Netlify 提示发布目录时选择 `dist`。

## 6. Cloudflare Pages

1. 登录 Cloudflare Dashboard，进入 **Workers & Pages**。
2. 选择 **Create application → Pages → Import an existing Git repository**。
3. 选择公开仓库和 `main` 生产分支。
4. Framework preset 选择 **React (Vite)**。
5. Build command 填写 `npm run build`。
6. Build output directory 填写 `dist`。
7. Node.js 版本设为 22。
8. 不要添加 `VITE_ENABLE_PRIVATE_RESUME_SEED`。
9. 保存并部署，站点默认地址为 `https://<PROJECT>.pages.dev/`。

## 7. 手动静态部署

适用于 Nginx、Apache、对象存储或任意支持静态文件的服务：

```bash
npm ci
npm run build
```

将 `dist/` 内部的所有文件上传到站点根目录。不要上传整个项目、`private/`、`node_modules/`、`.env.local` 或 JSON 备份。

如果必须部署到子路径（例如 `/resume/`），构建前设置：

```bash
VITE_BASE_PATH=/resume/ npm run build
```

Windows PowerShell：

```powershell
$env:VITE_BASE_PATH = "/resume/"
npm run build
Remove-Item Env:VITE_BASE_PATH
```

## 8. 数据与隐私说明

- 部署站点不包含你本机 IndexedDB 里的简历。
- 不同域名、不同浏览器和无痕模式拥有彼此独立的 IndexedDB。
- 部署后第一次打开会看到通用示例简历，不会自动出现本机私有简历。
- JSON 备份可能包含姓名、联系方式、教育经历和 Base64 照片，不要上传到 GitHub 或静态托管平台。
- 仅本地开发时可使用 `private/resume-import.json` 和 `.env.local`；这两项已被 Git 忽略且不会进入生产构建。

## 9. 部署后验收清单

1. 首页能创建和打开简历。
2. 刷新页面后数据仍在。
3. 预览区能切换 Classic/Modern 模板。
4. 直接编辑、Enter 换行和 `Ctrl+B` 可用。
5. JSON 导出后能在新浏览器导入。
6. 打印预览的 A4 页数与网页预览一致。
7. 浏览器控制台没有 404、JavaScript 错误或私有备份请求。

## 官方参考

- [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy)
- [GitHub Pages: Using custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vercel: Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Netlify: Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Cloudflare Pages: Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
