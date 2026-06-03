import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// Vite plugin: fix regex syntax unsupported in Chrome 63
function compatPlugin() {
  // --- Unicode property escapes (Chrome 64+) ---
  var base = {
    L: 'a-zA-Z',
    N: '0-9',
    P: '\\x21-\\x2F\\x3A-\\x40\\x7B-\\x7E',
    S: '\\x24\\x2B\\x3C-\\x3E\\x5E\\x60\\x7C\\x7E',
    Z: '\\x20',
  }
  var uniRe = /\\[pP]\{[^}]+\}/g
  function replaceUnicode(m) {
    var negated = m[1] === 'P'
    var cat = m.slice(3, -1)
    var r = base[cat] || base[cat[0]] || '\\x20-\\x7E'
    return negated ? '^' + r : r
  }

  // --- Named capture groups (Chrome 64+) ---
  // Replace (?<name>...) with ( and \k<name> with \N
  var nameRe = /\(\?<(\w+)>/g
  function replaceNamedGroups(code) {
    var names = []
    var match
    nameRe.lastIndex = 0
    var pat = /\(\?<(\w+)>/g
    while ((match = pat.exec(code)) !== null) {
      if (names.indexOf(match[1]) === -1) names.push(match[1])
    }
    if (names.length === 0) return code
    // Replace named groups with regular capturing groups
    code = code.replace(/\(\?<(\w+)>/g, '(')
    // Replace named backreferences with numeric
    names.forEach(function (name, i) {
      var refRe = new RegExp('\\\\k<' + name + '>', 'g')
      code = code.replace(refRe, '\\' + (i + 1))
    })
    return code
  }

  return {
    name: 'chrome63-regex-compat',
    transform(code, id) {
      var changed = false
      if (uniRe.test(code)) {
        code = code.replace(uniRe, replaceUnicode)
        changed = true
      }
      // Named groups: check if file contains (?<name> patterns
      if (/\(\?<\w+>/.test(code)) {
        code = replaceNamedGroups(code)
        changed = true
      }
      if (changed) console.log('[compat] fixed regex in:', id)
      return { code: code, map: null }
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
    plugins: [compatPlugin()],
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

    footer: {
      message: '作者：XXX | 联系：admin@example.com',
      copyright: 'Copyright © 2026',
    },

    author: {
      name: 'XXX',
      contact: 'admin@example.com',
    },
  },
}))
