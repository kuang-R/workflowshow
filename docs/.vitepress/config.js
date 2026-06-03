import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// Vite plugin: replace Unicode property escapes in regex literals (Chrome 64+)
// Mermaid uses /[\\p{L}\\p{N}]/u patterns that crash Chrome 63 at parse time
function unicodePropPlugin() {
  // Replace \p{X} with equivalent ASCII range to avoid parse errors
  var map = {
    '\\\\p{L}': 'a-zA-Z',
    '\\\\p{N}': '0-9',
    '\\\\p{XID_Start}': 'a-zA-Z_',
    '\\\\p{XID_Continue}': 'a-zA-Z0-9_',
  }
  var keys = Object.keys(map)
  var re = new RegExp(keys.join('|'), 'g')
  return {
    name: 'unicode-prop-polyfill',
    transform(code, id) {
      if (!re.test(code)) return
      console.log('[unicode-prop] fixing:', id)
      return { code: code.replace(re, function (m) { return map[m] }) }
    },
  }
}

export default withMermaid(
  defineConfig({
  title: 'Workflow Show',
  description: '岗位工作内容、流程与文件展示',
  base: '/workflowshow/',

  // 最大浏览器兼容性
  vite: {
    plugins: [unicodePropPlugin()],
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
      { text: '关于', link: '/about' },
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
}))
