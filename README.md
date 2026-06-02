# Workflow Show

基于 VitePress + markmap 的岗位工作展示平台，以可交互思维导图形式展示工作组成与流程，支持 Docker 容器化部署。

## 技术栈

- **VitePress** — 静态站点生成
- **markmap** — Markdown 列表渲染为可缩放、可点击跳转的思维导图
- **Nginx** — 生产环境静态文件服务
- **Docker** — 容器化部署，支持运行时从服务器文件重建站点

## 快速开始

```bash
npm install

# 本地开发（热更新）
npm run docs:dev

# 构建生产版本
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## Docker 部署

容器启动时从挂载的内容文件重新构建站点，更新内容只需重启容器，无需重新构建镜像。

```bash
# 构建并启动
docker compose up -d --build

# 修改 content/ 下的文件后，重启即可生效
docker compose restart
```

镜像内包含 Node.js + Nginx，启动流程：`entrypoint.sh` → `npm run docs:build` → `cp dist → nginx html` → 启动 Nginx。

## 目录结构

```
docs/                                   # 应用代码（镜像内）
├── .vitepress/
│   ├── config.js
│   └── theme/                          # 自定义主题
│       ├── index.js
│       ├── polyfills.js                # 浏览器兼容 polyfills
│       ├── Layout.vue
│       ├── layouts/
│       │   └── MindMapLayout.vue
│       └── components/
│           └── MindMap.vue             # markmap 渲染组件
├── index.md            → ../content/index.md      (symlink)
├── downloads.md        → ../content/downloads.md  (symlink)
├── about.md            → ../content/about.md      (symlink)
├── mindmaps/           → ../content/mindmaps/     (symlink)
└── public/             → ../content/files/        (symlink)

content/                                # 用户内容（Docker 挂载点）
├── index.md                            # 首页思维导图
├── downloads.md                        # 文件下载页
├── about.md                            # 关于页面
├── mindmaps/                           # 思维导图内容
│   ├── frontend.md
│   ├── backend.md
│   ├── review.md
│   └── deploy.md
└── files/                              # 可下载文件
```

## 思维导图编写

每个 `.md` 文件使用 `layout: mindmap`，内容写在 `mindmap` frontmatter 字段中：

```markdown
---
layout: mindmap
breadcrumbs:
  - text: 工作总览
    link: /
  - text: 当前页面
mindmap: |
  # 中心节点

  ## 分类
  - [跳转链接](/mindmaps/other)
    - 子节点
      - 孙子节点
  - 普通节点
---
```

- `#` / `##` 定义层级标题
- `[文本](链接)` 生成可点击跳转的节点
- `breadcrumbs` 控制顶部面包屑导航
- 思维导图页面顶部同时展示 `themeConfig.nav` 配置的导航链接

## 页面类型

| 页面 | 布局 | 说明 |
|------|------|------|
| `index.md` | mindmap | 首页，工作总览思维导图 |
| `mindmaps/*.md` | mindmap | 各岗位/流程思维导图，支持交叉跳转 |
| `downloads.md` | 默认 | 文件下载页，展示下载表格 |
| `about.md` | 默认 | 关于页面，介绍项目与技术栈 |

## 配置

作者和联系信息在 `docs/.vitepress/config.js` 中修改：

```js
themeConfig: {
  footer: {
    message: '作者：XXX | 联系：admin@example.com',
  },
  author: {
    name: 'XXX',
    contact: 'admin@example.com',
  },
}
```

## 兼容性

构建目标 `es2015`，最低支持：

| Chrome | Firefox | Safari | Edge | iOS Safari | Android WebView |
|--------|---------|--------|------|------------|-----------------|
| ≥ 61 | ≥ 54 | ≥ 10 | ≥ 15 | ≥ 9 | ≥ 4.4 |

- CSS `gap` 降级为 `margin` 间距方案，兼容旧 Chromium（搜狗浏览器等）
- `ResizeObserver` 降级为 `window.resize` 事件
- `?.` 可选链 / 箭头函数已降级为 ES5 语法
- `.browserslistrc` 配置覆盖市场份额 0.2% 以上的所有浏览器
- 不支持 IE11（Vue 3 需要 `Proxy`）

### 旧浏览器 Polyfills（`polyfills.js`）

| API | 缺失版本 | 说明 |
|-----|---------|------|
| `globalThis` | Chrome < 71 | Vue/VitePress 运行时依赖 |
| `Promise.allSettled` | Chrome < 76 | Vue 异步组件 hydration |
| `Array.flatMap` | Chrome < 69 | VitePress 内部视图路由 |
| `String.trimEnd` | Chrome < 66 | markmap-lib 解析器 |
| `String.trimStart` | Chrome < 66 | markmap-lib 解析器 |
| `ResizeObserver` | Chrome < 64 | markmap-view 内部使用 |
| `:where()` CSS | Chrome < 88 | patch querySelector，自动剥离 |
| RegExp named groups | Chrome < 64 | 排除 markmap katex 插件 |
| Unicode prop escapes | Chrome < 64 | 排除 markmap hljs 插件 |
| SVG foreignObject 事件穿透 | Chrome 63 | 使用 `elementsFromPoint` 替代 `closest`，`href` 转 `data-href` 防双重历史记录 |
