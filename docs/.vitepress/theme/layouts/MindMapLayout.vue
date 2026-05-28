<template>
  <div class="mindmap-layout">
    <header class="mindmap-header">
      <a href="/" class="mindmap-title">{{ siteTitle }}</a>
      <div class="mindmap-breadcrumb">
        <a v-for="(crumb, i) in breadcrumbs" :key="i" :href="crumb.link">
          {{ crumb.text }}
        </a>
      </div>
    </header>
    <main class="mindmap-main">
      <MindMap :content="content" />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import MindMap from '../components/MindMap.vue'

const { site, frontmatter } = useData()

const siteTitle = computed(() => site.value.title)
const content = computed(() => frontmatter.value.mindmap || '')
const breadcrumbs = computed(() => frontmatter.value.breadcrumbs || [])
</script>

<style>
.mindmap-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.mindmap-header {
  display: flex;
  align-items: center;
  gap: 24px;
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
}

.mindmap-breadcrumb {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.mindmap-breadcrumb a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.mindmap-breadcrumb a:hover {
  color: var(--vp-c-brand);
}

.mindmap-breadcrumb a + a::before {
  content: ' / ';
  color: var(--vp-c-divider);
}

.mindmap-main {
  flex: 1;
  min-height: 0;
}
</style>
