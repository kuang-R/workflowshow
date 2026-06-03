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

  // Exclude katex (named capture groups) and hljs (unicode property escapes)
  var transformer = new Transformer([
    pluginFrontmatter,
    pluginNpmUrl,
    pluginCheckbox,
    pluginSourceLines,
  ])
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

  // Chrome 63: prevent double history by removing native href from <a> tags
  // inside foreignObject, since preventDefault() may not work across namespaces.
  var allLinks = svg.querySelectorAll('a')
  for (var k = 0; k < allLinks.length; k++) {
    var lk = allLinks[k]
    var lkHref = lk.getAttribute('href') || lk.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    if (lkHref) {
      lk.setAttribute('data-href', lkHref)
      lk.removeAttribute('href')
      lk.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
    }
  }

  // Use mousemove for cursor (CSS may not apply in foreignObject)
  container.value.addEventListener('mousemove', function (e) {
    var els = document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : []
    var found = false
    for (var i = 0; i < els.length; i++) {
      if ((els[i].nodeName || '').toLowerCase() === 'a') { found = true; break }
    }
    container.value.style.cursor = found ? 'pointer' : ''
  })

  // Navigate on click — 外部链接新窗口，内部链接当前页跳转
  container.value.addEventListener('click', function (e) {
    var els = document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : []
    var anchor = null
    for (var i = 0; i < els.length; i++) {
      if ((els[i].nodeName || '').toLowerCase() === 'a') { anchor = els[i]; break }
    }
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
