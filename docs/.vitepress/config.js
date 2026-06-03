import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from 'vitepress-plugin-mermaid'

// Vite plugin: fix regex syntax unsupported in Chrome 63
function compatPlugin() {
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
  function replaceNamedGroups(code) {
    var names = [], pat = /\(\?<(\w+)>/g, match
    while ((match = pat.exec(code)) !== null) {
      if (names.indexOf(match[1]) === -1) names.push(match[1])
    }
    if (names.length === 0) return code
    code = code.replace(/\(\?<(\w+)>/g, '(')
    names.forEach(function (name, i) {
      code = code.replace(new RegExp('\\\\k<' + name + '>', 'g'), '\\' + (i + 1))
    })
    return code
  }
  return {
    name: 'chrome63-regex-compat',
    transform(code, id) {
      if (uniRe.test(code)) code = code.replace(uniRe, replaceUnicode)
      if (/\(\?<\w+>/.test(code)) code = replaceNamedGroups(code)
      return { code: code, map: null }
    },
  }
}

// Custom Vite plugin: inject lazy Mermaid component into app
function lazyMermaidPlugin() {
  var RESOLVED_ID = '\0virtual:mermaid-config'
  var config = { securityLevel: 'loose', startOnLoad: false }
  return {
    name: 'lazy-mermaid',
    // Override the MermaidPlugin transform to use our lazy component
    transform(code, id) {
      if (!id.includes('vitepress/dist/client/app/index.js')) return
      code = `import Mermaid from '/.vitepress/theme/Mermaid.vue';\n` + code
      var lines = code.split('\n'), idx = lines.findIndex(function (l) { return l.includes('app.component') })
      if (idx > -1) lines.splice(idx, 0, '  app.component("Mermaid", Mermaid);')
      return { code: lines.join('\n'), map: null }
    },
    resolveId(id) { if (id === 'virtual:mermaid-config') return RESOLVED_ID },
    load(id) { if (id === RESOLVED_ID) return 'export default ' + JSON.stringify(config) },
  }
}

// markdown-it fence plugin for mermaid code blocks
function mermaidFencePlugin(md) {
  var orig = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    var token = tokens[idx]
    if (token.info.trim() !== 'mermaid') return orig(tokens, idx, options, env, self)
    return '<Suspense><template #default><Mermaid id="mermaid-' + idx + '" graph="' + encodeURIComponent(token.content) + '"></Mermaid></template><template #fallback>Loading...</template></Suspense>'
  }
}

export default defineConfig({
  title: 'Workflow Show',
  description: '岗位工作内容、流程与文件展示',
  base: '/workflowshow/',

  markdown: { config: function (md) { mermaidFencePlugin(md) } },

  vite: {
    plugins: [compatPlugin(), lazyMermaidPlugin()],
    build: {
      target: 'es2015',
      cssTarget: 'chrome61',
      chunkSizeWarningLimit: 800,
    },
    esbuild: { target: 'es2015' },
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文件下载', link: '/downloads' },
      { text: '关于', link: '/about' },
    ],
    search: { provider: 'local' },
    footer: {
      message: '作者：XXX | 联系：admin@example.com',
      copyright: 'Copyright © 2026',
    },
    author: { name: 'XXX', contact: 'admin@example.com' },
  },
})
