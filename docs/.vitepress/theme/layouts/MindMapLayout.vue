<template>
  <div class="mindmap-layout">
    <header class="mindmap-header">
      <a :href="withBase('/')" class="mindmap-title">{{ siteTitle }}</a>
      <div class="mindmap-breadcrumb">
        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <a v-if="crumb.link" :href="withBase(crumb.link)">{{ crumb.text }}</a>
          <span v-else>{{ crumb.text }}</span>
        </template>
      </div>
      <nav class="mindmap-nav">
        <a v-for="item in navItems" :key="item.link" :href="withBase(item.link)">
          {{ item.text }}
        </a>
      </nav>
    </header>
    <main class="mindmap-main">
      <MindMap :content="content" />
    </main>
    <footer class="mindmap-footer">
      <span>作者：{{ author.name }}</span>
      <span class="mindmap-footer-sep">|</span>
      <span>联系：{{ author.contact }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useData, withBase } from 'vitepress'

const MindMap = defineAsyncComponent(function () {
  return import('../components/MindMap.vue')
})

const { site, frontmatter, theme } = useData()

const siteTitle = computed(() => site.value.title)
const content = computed(() => frontmatter.value.mindmap || '')
const breadcrumbs = computed(() => frontmatter.value.breadcrumbs || [])
const author = computed(() => theme.value.author || { name: '', contact: '' })
const navItems = computed(() => theme.value.nav || [])
</script>

<style scoped>
.mindmap-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.mindmap-header {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  flex-shrink: 0;
}

.mindmap-title {
  font-weight: 700;
  font-size: 16px;
  color: var(--vp-c-brand);
  text-decoration: none;
  margin-right: 24px;
}

.mindmap-breadcrumb {
  display: flex;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-right: 24px;
}

.mindmap-breadcrumb a,
.mindmap-breadcrumb span {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.mindmap-breadcrumb a {
  text-decoration: none;
}

.mindmap-breadcrumb a:hover {
  color: var(--vp-c-brand);
}

.mindmap-breadcrumb > * + *::before {
  content: ' / ';
  margin: 0 8px;
  color: var(--vp-c-divider);
}

.mindmap-nav {
  display: flex;
  margin-left: auto;
}

.mindmap-nav a + a {
  margin-left: 16px;
}

.mindmap-nav a {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.mindmap-nav a:hover {
  color: var(--vp-c-brand);
}

.mindmap-main {
  flex: 1;
  min-height: 0;
}

.mindmap-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 24px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 12px;
  line-height: 1;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.mindmap-footer > * + * {
  margin-left: 8px;
}

.mindmap-footer-sep {
  color: var(--vp-c-divider);
}
</style>
