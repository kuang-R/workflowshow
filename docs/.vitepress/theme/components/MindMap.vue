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

function observeResize() {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(function () {
      if (mm) mm.fit()
    })
    resizeObserver.observe(container.value)
  } else {
    window.addEventListener('resize', onWindowResize)
  }
}

function onWindowResize() {
  if (mm) mm.fit()
}

function unobserveResize() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else {
    window.removeEventListener('resize', onWindowResize)
  }
}

function render() {
  if (!container.value) return
  container.value.innerHTML = ''

  var transformer = new Transformer()
  var root = transformer.transform(props.content).root

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('style', 'width: 100%; height: 100%; display: block;')
  container.value.appendChild(svg)

  mm = Markmap.create(svg, {
    autoFit: true,
    duration: 0,
    maxWidth: 320,
    paddingX: 24,
  }, root)

  svg.addEventListener('click', function (e) {
    var anchor = e.target.closest('a')
    if (!anchor) return
    var href = anchor.getAttribute('href')
    if (!href) return
    e.preventDefault()
    if (href.startsWith('/') || href.startsWith(location.origin)) {
      router.go(href)
    } else {
      window.open(href, '_blank')
    }
  })
}

onMounted(function () {
  render()
  if (container.value) {
    observeResize()
  }
})

onBeforeUnmount(function () {
  unobserveResize()
  if (mm) mm.destroy()
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
