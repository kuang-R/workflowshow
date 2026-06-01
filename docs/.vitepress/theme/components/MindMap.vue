<template>
  <div ref="container" class="mindmap-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vitepress'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'

const router = useRouter()
const props = defineProps({
  content: { type: String, required: true },
})

const container = ref(null)
let mm = null
let resizeObserver = null

function render() {
  if (!container.value) return
  container.value.innerHTML = ''

  const transformer = new Transformer()
  const { root } = transformer.transform(props.content)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('style', 'width: 100%; height: 100%; display: block;')
  container.value.appendChild(svg)

  mm = Markmap.create(svg, {
    autoFit: true,
    duration: 300,
    maxWidth: 320,
    paddingX: 24,
  }, root)

  svg.addEventListener('click', (e) => {
    const anchor = e.target.closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href')
    if (!href) return
    e.preventDefault()
    if (href.startsWith('/') || href.startsWith(location.origin)) {
      router.go(href)
    } else {
      window.open(href, '_blank')
    }
  })
}

onMounted(() => {
  render()
  if (container.value) {
    resizeObserver = new ResizeObserver(() => {
      mm?.fit()
    })
    resizeObserver.observe(container.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  mm?.destroy()
})

watch(() => props.content, () => {
  render()
})
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
