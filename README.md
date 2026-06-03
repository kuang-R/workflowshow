# Workflow Show

基于 VitePress + markmap 的岗位工作展示平台，以可交互思维导图形式展示工作组成与流程，支持 Docker 容器化部署。

**演示站点：** [kuang-R.github.io/workflowshow](https://kuang-R.github.io/workflowshow/)

## 技术栈

- **VitePress** — 静态站点生成
- **markmap** — Markdown 列表渲染为可缩放、可点击跳转的思维导图
- **Mermaid** — 流程图、时序图等图表渲染
- **Nginx** — 生产环境静态文件服务
- **Docker** — 容器化部署，支持运行时从服务器文件重建站点

## 快速开始

```bash
npm install

# 构建生产版本
npm run docs:build

# 预览构建结果
npm run docs:preview
```

> 因兼容性处理需要构建阶段介入，不支持 `docs:dev` 热更新开发模式。

## Docker 部署

```bash
# 首次部署 — 构建镜像并启动
docker compose up -d --build

# 只改了内容（content/*.md）— 重启容器，自动重新构建站点
docker compose restart

# 改了代码（docs/.vitepress/ 等）— 需要重新构建镜像
docker compose up -d --build
```

镜像内包含 Node.js + Nginx，启动流程：`entrypoint.sh` 将 `content/` 拷贝到 `docs/` → `npm run docs:build` → `cp dist → nginx html` → 启动 Nginx。

## 目录结构

```
docs/                                   # 应用代码 + 默认内容
├── .vitepress/
│   ├── config.js
│   └── theme/
│       ├── index.js
│       ├── polyfills.js
│       ├── Layout.vue
│       ├── layouts/
│       │   └── MindMapLayout.vue
│       └── components/
│           └── MindMap.vue
├── index.md                            # 首页
├── downloads.md                        # 文件下载
├── about.md                            # 关于页面
├── mindmaps/                           # 思维导图内容
└── public/files/                       # 可下载文件

content/                                # 服务器内容（Docker 挂载点）
├── mindmaps/                           # → 启动时覆盖 docs/mindmaps
└── files/                              # → 启动时覆盖 docs/public
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

构建目标 `es2015`，仅在 Chrome 63 中通过测试。不支持 IE11。
