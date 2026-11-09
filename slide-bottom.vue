<script setup>
import { useSlideContext } from '@slidev/client'

const { $page, $nav } = useSlideContext()
</script>

<template>
  <div class="footer" :class="{ 'footer--dark': $page === 1 }" aria-label="Slide number">
    {{ $page }} / {{ $nav.total }}
  </div>
</template>
