import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// Vite plugin: replace Unicode property escapes in regex literals (Chrome 64+)
// Mermaid + marked use /[\p{L}\p{N}]/u patterns that crash Chrome 63 at parse time
function unicodePropPlugin() {
  var base = {
    L: 'a-zA-Z',                     // Letter
    N: '0-9',                        // Number
    P: '\\x21-\\x2F\\x3A-\\x40\\x7B-\\x7E',  // Punctuation
    S: '\\x24\\x2B\\x3C-\\x3E\\x5E\\x60\\x7C\\x7E',  // Symbol
    Z: '\\x20',                      // Separator (space)
  }
  var re = /\\[pP]\{[^}]+\}/g
  function safeReplace(m) {
    // Extract category: \p{Lo} → L, \P{Sm} → S
    var negated = m[1] === 'P'
    var cat = m.slice(3, -1)
    var b = base[cat] || base[cat[0]]  // full match or first char
    if (!b) return '\\\\x20-\\\\x7E'    // unknown → broad ASCII printable
    if (negated) return '^' + b
    return b
  }
  return {
    name: 'unicode-prop-polyfill',
    transform(code, id) {
      if (!re.test(code)) return
      console.log('[unicode-prop] fixing:', id)
      return { code: code.replace(re, safeReplace) }
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
