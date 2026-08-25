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
