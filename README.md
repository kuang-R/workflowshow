# Workflow Show

基于 VitePress + markmap 的岗位工作展示平台，以思维导图形式展示工作组成与流程，支持 Docker 容器化部署。

## 技术栈

- **VitePress** — 静态站点生成
- **markmap** — Markdown 列表渲染为可交互思维导图
- **Nginx** — 生产环境静态文件服务
- **Docker** — 容器化部署

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run docs:dev

# 构建
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## Docker 部署

```bash
# 构建并启动
docker compose up -d --build

# 更新内容后重启
docker compose restart
```

服务器上的 `docs/mindmaps/` 和 `docs/public/` 目录挂载进容器，容器启动时自动从这些文件重新构建站点，无需重新构建镜像。

## 目录结构

```
docs/
├── .vitepress/          # VitePress 配置与主题
│   ├── config.js
│   └── theme/           # 自定义主题
├── index.md             # 首页 — 工作总览思维导图
├── mindmaps/            # 思维导图内容（挂载为卷）
│   ├── frontend.md
│   ├── backend.md
│   ├── review.md
│   └── deploy.md
├── public/files/        # 可下载文件
└── downloads.md         # 文件下载页
```

## 思维导图编写

每个 `.md` 文件的 frontmatter 中指定 `layout: mindmap`，内容使用 Markdown 嵌套列表：

```markdown
---
layout: mindmap
---

# 中心节点
- [跳转链接](/mindmaps/other)
  - 子节点
    - 孙子节点
```

markmap 会将列表渲染为可缩放、可点击跳转的思维导图。

## 兼容性

支持 2020 年后发布的主流浏览器（Chrome 87+、Firefox 78+、Safari 14+、Edge 88+）。不支持 IE11。
