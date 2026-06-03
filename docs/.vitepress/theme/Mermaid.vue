<template>
  <div ref="container" class="mermaid-container"></div>
</template>

<script setup>
import { onMounted, ref, toRaw } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const { frontmatter } = toRaw(page.value)
const mermaidPageTheme = frontmatter.mermaidTheme || ''

const props = defineProps({
  graph: { type: String, required: true },
  id: { type: String, required: true },
  class: { type: String, default: 'mermaid' },
})

const container = ref(null)

onMounted(async function () {
  try {
    // Lazily import mermaid only when actually needed
    var m = await import('mermaid')
    var mermaid = m.default
    var configMod = await import('virtual:mermaid-config')
    var settings = configMod.default || {}
    var config = Object.assign({}, { securityLevel: 'loose', startOnLoad: false }, settings)
    if (mermaidPageTheme) config.theme = mermaidPageTheme
    if (document.documentElement.classList.contains('dark')) config.theme = 'dark'
    mermaid.initialize(config)
    var result = await mermaid.render(props.id, decodeURIComponent(props.graph))
    if (container.value) {
      container.value.innerHTML = result.svg
    }
  } catch (e) {
    if (container.value) {
      container.value.innerHTML = '<pre style="color:red">Mermaid error: ' + (e.message || e) + '</pre>'
    }
  }
})
</script>
