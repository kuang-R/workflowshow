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

# 修改 docs/mindmaps/ 下的文件后，重启即可生效
docker compose restart
```

镜像内包含 Node.js + Nginx，启动流程：`entrypoint.sh` → `npm run docs:build` → `cp dist → nginx html` → 启动 Nginx。

## 目录结构

```
docs/
├── .vitepress/
│   ├── config.js                      # 站点配置、导航、作者信息
│   └── theme/
│       ├── index.js                   # 主题入口
│       ├── Layout.vue                 # 布局分发（mindmap / 默认）
│       ├── layouts/
│       │   └── MindMapLayout.vue      # 思维导图全屏布局
│       └── components/
│           └── MindMap.vue            # markmap 渲染组件
├── index.md                           # 首页 — 工作总览思维导图
├── mindmaps/                          # 思维导图内容（Docker 挂载点）
│   ├── frontend.md
│   ├── backend.md
│   ├── review.md
│   └── deploy.md
├── public/files/                      # 可下载文件
└── downloads.md                       # 文件下载页（普通页面）
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

支持 2020 年后发布的主流浏览器（Chrome 87+、Firefox 78+、Safari 14+、Edge 88+）。不支持 IE11。
