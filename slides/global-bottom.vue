<template>
  <div class="slidev-progress" @click="$slidev.nav.next()">
    {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
  </div>
</template>

<script setup>
// No script needed; we rely on the reactive $slidev.nav object.
</script>

<style scoped>
.slidev-progress {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
}
</style>
