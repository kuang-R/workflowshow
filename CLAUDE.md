这是一个静态网站框架，有如下的功能要求。
- 尽量保证网站的兼容性，编写代码时兼容性与框架保持一致
- 用于展示一个岗位的工作内容、流程、依据文件下载
- 用纯文本描述，支持图的描述方式，支持多页面跳转
- 框架支持Docker容器运行
- 编写代码时参考README

## 文件下载配置

可下载文件存放在 `content/files/`（Docker 部署）或 `docs/public/files/`（GitHub Pages 部署）。

下载页面 `downloads.md` 中使用相对路径引用：
```markdown
| [文件名](./files/example.pdf) | 文件说明 |
```

**Docker 部署更新流程：**
1. 将文件放入 `content/files/` 目录
2. 编辑 `content/downloads.md` 添加下载链接
3. 执行 `docker compose restart`（entrypoint 脚本会自动将文件同步到构建目录并重新构建站点）

**注意：** `content/` 和 `docs/` 中有两份内容副本。Docker 运行时使用 `content/`（通过 volume 挂载），GitHub Pages 使用 `docs/`。两个副本需保持一致。

`docker compose restart` 会完整重新执行 entrypoint（同步文件 → 构建 → 启动 nginx），文件不会丢失。

**路径映射：** entrypoint 将 `content/files/` 复制到 `docs/public/files/`（不是 `docs/public/` 根目录），VitePress 构建后文件位于 `/files/xxx.pdf`。这与下载链接 `./files/xxx.pdf` 和 nginx 对 `/files/` 路径的缓存配置一致。添加文件时只需放入 `content/files/` 目录，无需手动创建中间目录。
