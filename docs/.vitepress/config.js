import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Workflow Show',
  description: '岗位工作内容、流程与文件展示',
  base: '/workflowshow/',

  // 最大浏览器兼容性
  vite: {
    build: {
      target: 'es2015',
      cssTarget: 'chrome61',
      chunkSizeWarningLimit: 800,
    },
    esbuild: {
      target: 'es2015',
    },
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文件下载', link: '/downloads' },
    ],

    search: {
      provider: 'local',
    },

    // 默认页面底部展示
    footer: {
      message: '作者：XXX | 联系：admin@example.com',
      copyright: 'Copyright © 2026',
    },

    // 作者信息，供全局使用
    author: {
      name: 'XXX',
      contact: 'admin@example.com',
    },
  },
})
