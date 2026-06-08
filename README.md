# Workflow Show

基于 VitePress + markmap 的岗位工作展示平台，以可交互思维导图形式呈现工作组成与流程，支持 Docker 容器化部署。

**演示站点：** [kuang-R.github.io/workflowshow](https://kuang-R.github.io/workflowshow/)

## 技术栈

- **VitePress** — 静态站点生成
- **markmap** — 将 Markdown 列表渲染为可缩放、可点击跳转的思维导图
- **Mermaid** — 流程图、时序图等图表渲染
- **Nginx** — 生产环境静态文件服务
- **Docker** — 容器化部署，支持运行时从挂载内容重建站点

## 快速开始

```bash
npm install

# 构建生产版本
npm run docs:build

# 预览构建结果
npm run docs:preview
```

> 因兼容性处理依赖构建阶段，不支持 `docs:dev` 热更新开发模式。

## Docker 部署

### docker-compose.yml

```yaml
services:
  workflowshow:
    build: .
    ports:
      - "80:80"
    volumes:
      # 单目录挂载 — 修改 content/ 下的文件后重启容器即可生效
      # 可选：不挂载时镜像自动使用内置默认内容
      - ./content:/app/content
```

### 常用命令

```bash
# 首次部署 — 构建镜像并启动
docker compose up -d --build

# 仅修改内容（*.md、site.json 等）— 重启容器，自动重新构建站点
docker compose restart

# 修改代码（docs/.vitepress/ 等）— 需要重新构建镜像
docker compose up -d --build

# 停止服务
docker compose down

# 查看日志
docker compose logs -f
```

### 自定义端口

如需改用其他端口（如 8080），修改 `docker-compose.yml` 中的 `ports` 映射：

```yaml
services:
  workflowshow:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./content:/app/content
```

### 生产环境示例

绑定指定 IP、设置重启策略、限制资源：

```yaml
services:
  workflowshow:
    build: .
    ports:
      - "127.0.0.1:80:80"
    volumes:
      - ./content:/app/content
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
```

镜像内置 Node.js + Nginx 以及默认站点内容。首次部署时无需准备 `content/` 目录，创建空目录挂载即可自动使用内置默认内容。启动流程：`entrypoint.sh` 检测挂载的 `content/` 是否有内容 → 有则使用挂载内容，无则使用内置默认 → `npx vitepress build docs --base /`（覆盖 GitHub Pages 路径为根路径）→ 将 `dist` 复制到 Nginx 静态目录 → 启动 Nginx。

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

content/                                # 服务器内容（Docker 挂载点，可选）
├── site.json                           # 站点配置（导航、作者等）
├── index.md                            # 首页
├── downloads.md                        # 文件下载
├── about.md                            # 关于页面
├── processes/                          # 子目录，页面会保留路径结构
│   └── cicd.md                         # → /processes/cicd
├── mindmaps/                           # 思维导图内容
└── files/                              # 可下载文件
                                        # 不挂载时镜像自动使用内置默认内容
```

## 思维导图编写

每个 `.md` 文件使用 `layout: mindmap`，思维导图内容写在 `mindmap` frontmatter 字段中：

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

通过 `content/site.json` 自定义站点导航、作者与页脚信息，修改后重启容器即生效：

```json
{
  "nav": [
    { "text": "首页", "link": "/" },
    { "text": "文件下载", "link": "/downloads" },
    { "text": "关于", "link": "/about" }
  ],
  "footer": {
    "message": "作者：XXX | 联系：admin@example.com",
    "copyright": "Copyright © 2026"
  },
  "author": {
    "name": "XXX",
    "contact": "admin@example.com"
  }
}
```

### 添加/删除页面

1. 创建或删除 `content/` 下的 `.md` 文件
2. 在 `site.json` 的 `nav` 数组中添加或移除对应链接
3. `docker compose restart` 重启容器（构建约 8 秒）

页面文件支持放在子目录中分类整理，目录结构即 URL 路径。例如 `content/processes/cicd.md` → `/processes/cicd`。

## 兼容性

构建目标 `es2015`，仅在 Chrome 63 中通过测试。不支持 IE11。
