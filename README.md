# Resume Maker

一个本地优先、无后端、无登录的简历生成器。简历保存在当前浏览器的 IndexedDB 中，支持实时 A4 预览、直接编辑、JSON 备份与浏览器打印 PDF。

## 功能

- 创建、复制、编辑和删除多份简历
- 基础信息、教育、实习/工作、项目、校园经历、技能和荣誉编辑
- Classic 和 Modern 两套模板，模板排版参数相互独立
- 照片导入与位置、缩放、旋转等调整
- 左右栏字号、行距、排版密度和主题色调整
- A4 多页实时预览，支持预览区直接编辑和常用键盘操作
- Dexie + IndexedDB 自动保存
- JSON 导入、单份导出和全部备份
- 基于 CSS Print 的可复制文字 PDF
- 桌面端和移动端编辑/预览模式

## 隐私

应用不会上传简历数据，也不包含分析、登录或云同步服务。简历和照片仅保存在当前浏览器。

JSON 备份可能包含完整个人信息和 Base64 照片，请将其当作私密文件保管，不要提交到公开仓库。

## 技术栈

Vite、React、TypeScript、Tailwind CSS、React Hook Form、Zod、Zustand、Dexie、react-to-print 和 lucide-react。

## 开发

需要 Node.js 20.19+ 或 22.12+。

### Windows 一键启动

拉取仓库后直接双击根目录的 `start-resume.cmd`。脚本会：

1. 检查 Node.js，缺失时通过 Windows Package Manager 安装 Node.js LTS。
2. 使用 `npm install` 按锁文件安装全部依赖，可安全重复运行。
3. 运行代码检查、生产构建和浏览器测试。
4. 启动本地生产预览并打开 `http://127.0.0.1:4173/`。

命令行也可以执行：

```powershell
.\start-resume.cmd
```

macOS 或 Linux：

```bash
chmod +x start-resume.sh
./start-resume.sh
```

已经安装 Node.js 时，也可使用：

```bash
npm run setup
npm run dev
```

### Docker 一键部署

已安装 Docker 的电脑或服务器，在仓库根目录执行：

```bash
docker compose up --build -d
```

访问 `http://127.0.0.1:8080/`。镜像会自行安装 Node.js 依赖、构建前端，并由 Nginx 提供静态服务。

```bash
npm install
npm run dev
```

默认开发地址为 `http://127.0.0.1:5173/`。

## 测试

```bash
npm test
```

该命令会依次执行静态检查、TypeScript/生产构建和 Playwright 浏览器验收。浏览器测试覆盖列表操作、键盘编辑、自动保存、多页预览、JSON 导入导出、移动端布局和打印 PDF。

## 部署

项目可部署到 GitHub Pages、Vercel、Netlify、Cloudflare Pages 或任意静态文件服务。仓库已包含 GitHub Pages 自动部署工作流。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkh-1-1%2Fresume)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kh-1-1/resume)

完整步骤、子路径配置、隐私检查和部署后验收见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 本机私有测试数据

仓库已忽略 `private/` 和 `*.local`。需要在开发环境恢复自己的本机备份时，可以：

1. 将 Resume Maker JSON 备份放在 `private/resume-import.json`。
2. 在 `.env.local` 中写入 `VITE_ENABLE_PRIVATE_RESUME_SEED=true`。
3. 重新启动开发服务器。

该备份只会由本地开发服务器读取，不会进入 `npm run build` 产物。

## 贡献

请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。提交问题或 PR 时，请勿附带真实简历、证件照、证书或 JSON 备份。

## 许可证

[MIT](./LICENSE)
