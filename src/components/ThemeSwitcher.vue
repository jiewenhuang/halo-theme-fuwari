<script lang="ts" setup>
import { ref, onMounted } from "vue";
import MingcuteMoonLine from "~icons/mingcute/moon-line";
import MingcuteSunLine from "~icons/mingcute/sun-line";

const isDark = ref(false);

onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark");
});

function toggle() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
}
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <!-- Moon: shown in light mode -->
    <MingcuteSunLine v-if="isDark" />
    <MingcuteMoonLine v-else />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.theme-toggle:hover {
  background: var(--bg-raised);
  color: var(--ink);
}
</style>
