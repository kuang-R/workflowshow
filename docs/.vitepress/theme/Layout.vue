<template>
  <MindMapLayout v-if="frontmatter.layout === 'mindmap'" />
  <DefaultTheme.Layout v-else />
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import MindMapLayout from './layouts/MindMapLayout.vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>
