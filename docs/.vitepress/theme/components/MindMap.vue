<template>
  <div ref="container" class="mindmap-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Transformer } from 'markmap-lib'
import {
  pluginFrontmatter,
  pluginNpmUrl,
  pluginCheckbox,
  pluginSourceLines,
} from 'markmap-lib/plugins'
import { Markmap } from 'markmap-view'

const props = defineProps({
  content: { type: String, required: true },
})

const container = ref(null)
let mm = null
let resizeObserver = null

// --- resize ---

function observeResize() {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(function () { if (mm) mm.fit() })
    resizeObserver.observe(container.value)
  } else {
    window.addEventListener('resize', onWindowResize)
  }
}

function onWindowResize() { if (mm) mm.fit() }

function unobserveResize() {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  else { window.removeEventListener('resize', onWindowResize) }
}

// --- link helpers (Chrome 63 SVG foreignObject compat) ---

function findAnchorAt(e) {
  var els = document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : []
  for (var i = 0; i < els.length; i++) {
    if ((els[i].nodeName || '').toLowerCase() === 'a') return els[i]
  }
  return null
}

function stripNativeHrefs(svg) {
  var links = svg.querySelectorAll('a')
  for (var k = 0; k < links.length; k++) {
    var lk = links[k]
    var h = lk.getAttribute('href') || lk.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    if (h) {
      lk.setAttribute('data-href', h)
      lk.removeAttribute('href')
      lk.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
    }
  }
}

function setupClickNavigation(el) {
  el.addEventListener('mousemove', function (e) {
    el.style.cursor = findAnchorAt(e) ? 'pointer' : ''
  })

  el.addEventListener('click', function (e) {
    var anchor = findAnchorAt(e)
    if (!anchor) return
    var href = anchor.getAttribute('data-href')
    if (!href) return
    e.stopPropagation()
    if (/^https?:\/\//.test(href) && href.indexOf(location.hostname) === -1) {
      var tmp = document.createElement('a')
      tmp.href = href
      tmp.target = '_blank'
      tmp.rel = 'noopener'
      document.body.appendChild(tmp)
      tmp.click()
      document.body.removeChild(tmp)
    } else {
      location.href = href
    }
  })
}

// --- render ---

function render() {
  if (!container.value) return
  container.value.innerHTML = ''

  var transformer = new Transformer([
    pluginFrontmatter, pluginNpmUrl, pluginCheckbox, pluginSourceLines,
  ])
  var root = transformer.transform(props.content).root

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('style', 'width:100%;height:100%;display:block')
  container.value.appendChild(svg)

  mm = Markmap.create(svg, {
    autoFit: true,
    duration: 0,
    maxWidth: 320,
    paddingX: 24,
  }, root)

  stripNativeHrefs(svg)
  setupClickNavigation(container.value)
}

// --- lifecycle ---

onMounted(function () {
  render()
  if (container.value) observeResize()
})

onBeforeUnmount(function () {
  unobserveResize()
  if (mm) mm.destroy()
})

watch(function () { return props.content }, function () { render() })
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
