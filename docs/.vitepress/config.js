import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Workflow Show',
  description: '岗位工作内容、流程与文件展示',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文件下载', link: '/downloads' },
    ],

    search: {
      provider: 'local',
    },
  },
})
