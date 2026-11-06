# 数独 · Sudoku 🧩

> 现代化、极简、专注的沉浸式数独网页应用。基于 [TN1ck/super-sudoku](https://github.com/TN1ck/super-sudoku) 深度重构，专为 [heyhuyu.com](https://heyhuyu.com) 打造。

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-22c55e.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v7-646cff.svg)](https://vitejs.dev/)

🎮 **在线体验**：[https://heyhuyu.com/sudoku/](https://heyhuyu.com/sudoku/)

---

## ✨ 核心亮点

### 🎨 现代极简设计与交互哲学
- **绝对居中焦点布局**：抛弃冗余的边栏与繁杂装饰，以棋盘为第一视觉中心，沉浸专注解题心流。
- **悬浮智能气泡选择器**：告别页面常驻占地的笨重键盘！点选任意单元格即刻唤出极简 3x3 悬浮窗口，支持一键填数、模式切换与快速擦除。边界处自适应防溢出，随选随填。
- **温润纸质基调与暗色模式**：默认采用 `heyhuyu.com` 标志性的温润暖纸底色（`#faf8ef`），搭配深黑与青绿点缀，同时原生支持护眼暗黑模式一键切换。
- **专属现代矢量图标**：全套定制的高清数独几何图标，覆盖 Favicon、Apple Touch Icon 及各大平台应用图标。

### 🧠 智能辅助与进阶笔记系统
- **动态笔记推导**：支持一键展示自动生成的候选数笔记，亦可手动记录自由批注。
- **实时冲突高亮**：精准标注同行、同列、九宫格内的数值冲突与错误输入，助你理清复杂局面。
- **数字频次统计**：可选开启数字出现频次指示器，已填满（9个）的数字视觉淡化，一目了然。
- **智能提示引擎**：卡关时按快捷键 `H` 或点击提示，即时解析当前推荐填入的正确数字。

### 📚 海量题库与自定义创作
- **3000+ 精选题库**：涵盖 5 个难度阶梯（简单、中等、困难、专家、魔鬼），循序渐进。
- **自定义题库创建**：支持录入自己的数独谜题，内置基于约束满足问题（CSP）与回溯法的求解验证引擎，保存前自动校验唯一解。
- **一键分享对局**：随时生成专属分享链接，好友打开即可复现同一局棋谱与进度。

### 📱 跨端自适应 & PWA 支持
- **响应式排版**：从手机、平板到桌面大屏均有精心调优的触控与尺寸缩放。
- **离线 PWA 支持**：可添加至手机主屏幕或桌面作为独立客户端离线运行。
- **零外部 CDN 依赖**：移除 Google Fonts 等易受网络波动的外部资源，采用系统原生平滑字体阶梯（PingFang SC / Inter），国内访问秒级加载。
- **全方位多语言（i18n）**：原生适配中文（默认），并支持 English、Español、Français、Deutsch、Italiano、Português 自由切换。

---

## ⌨️ 快捷键指南

桌面端提供完备的全键盘操作体验，脱离鼠标也能行云流水：

| 按键 / 组合键 | 功能说明 |
|:---|:---|
| **方向键 `↑` `↓` `←` `→`** | 在数独棋盘网格中自由移动焦点 |
| **数字键 `1` - `9`** | 填入数字（或在笔记模式下添加/取消对应候选数） |
| **退格键 `Backspace`** | 擦除当前选中格的数字或笔记 |
| **`N` 键** | 快速切换【填数模式】与【笔记模式】 |
| **`H` 键** | 获取当前选中格的智能提示 |
| **`Esc` 键** | 暂停 / 继续当前对局 |
| **`Ctrl / Cmd + Z`** | 撤销（Undo）上一步操作 |
| **`Ctrl / Cmd + Y`** | 重做（Redo）操作 |
| **`Ctrl / Cmd + C`** | 复制当前单元格的候选数笔记 |
| **`Ctrl / Cmd + V`** | 将已复制的笔记粘贴至当前单元格 |

---

## 🛠️ 本地开发与构建

### 环境要求
- **Node.js** >= 20
- **npm** >= 10

### 快速开始

```bash
# 1. 克隆代码仓库
git clone https://github.com/huy8000/sudoku.git
cd sudoku

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器
npm start
```

启动后可在浏览器访问：[http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
# 编译并打包生产资源（输出至 dist 目录）
npm run build

# 本地预览生产构建产物
npm run preview
```

### 自动化测试与校验

项目配备了严格的自动化测试套件与 TypeScript 类型检查：

```bash
# 运行 Vitest 单元测试
npm test

# 执行 TypeScript 类型检查
npm run typecheck

# 运行 Playwright E2E 端到端自动化测试
npm run test:e2e
```

---

## 🐳 Docker 部署

应用开箱即用支持容器化部署：

```bash
# 1. 构建 Docker 镜像
docker build -t heyhuyu-sudoku:latest .

# 2. 运行容器（将主机 8080 端口映射到容器内 80 端口）
docker run -d -p 8080:80 --name sudoku-app heyhuyu-sudoku:latest
```

访问 `http://localhost:8080` 即可开始游戏。

---

## 🧩 技术栈与架构

- **前端框架**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**：[Vite 7](https://vitejs.dev/) + [@vite-pwa](https://vite-pwa-org.netlify.app/)
- **样式方案**：[Tailwind CSS v4](https://tailwindcss.com/)
- **路由管理**：[@tanstack/react-router](https://tanstack.com/router)
- **国际化**：[i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)
- **核心算法**：AC-3 弧相容算法约束传播 + 回溯搜索算法（Web Worker 独立线程校验）
- **测试框架**：[Vitest](https://vitest.dev/)（单元测试） + [Playwright](https://playwright.dev/)（跨浏览器 E2E 自动化）

---

## 📄 开源许可

本项目遵循 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢与灵感

- 原项目 [TN1ck/super-sudoku](https://github.com/TN1ck/super-sudoku) 及作者 Tom Nick。
- 题目评级与生成理论参考论文：《*Rating and Generating Sudoku Puzzles Based On Constraint Satisfaction Problems*》。
- [heyhuyu.com](https://heyhuyu.com) 暖心游戏工坊。
