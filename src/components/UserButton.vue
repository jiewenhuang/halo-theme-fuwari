<script lang="ts" setup>
import type { DetailedUser } from "@halo-dev/api-client";
import ky from "ky";
import { computed, onMounted, ref } from "vue";

const user = ref<DetailedUser | null>(null);
const isLoading = ref(true);

const isAnonymous = computed(() => {
  return user.value?.user.metadata.name === "anonymousUser";
});

const displayName = computed(() => {
  return (
    user.value?.user.spec.displayName ||
    user.value?.user.metadata.name ||
    "Account"
  );
});

const avatarSrc = computed(() => {
  return user.value?.user.spec.avatar || "";
});

const avatarLabel = computed(() => {
  if (isAnonymous.value) {
    return "?";
  }

  return displayName.value.charAt(0).toUpperCase();
});

onMounted(async () => {
  try {
    user.value = await ky
      .get<DetailedUser>(`/apis/api.console.halo.run/v1alpha1/users/-`)
      .json();
  } catch {
    user.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>
<template>
  <div
    v-if="isLoading"
    class="user-button-shell user-button-shell--loading"
    aria-busy="true"
    aria-live="polite"
  >
    <span
      class="user-button-avatar user-button-avatar--skeleton"
      aria-hidden="true"
    ></span>
    <span class="user-button-text-skeleton" aria-hidden="true"></span>
    <span class="sr-only">Loading user state</span>
  </div>
  <a
    href="/uc"
    v-else-if="user && !isAnonymous"
    class="user-button-shell"
    :title="displayName"
  >
    <span class="user-button-avatar" aria-hidden="true">
      <img
        v-if="avatarSrc"
        class="user-button-avatar__image"
        :src="avatarSrc"
        :alt="displayName"
      />
      <span v-else>{{ avatarLabel }}</span>
    </span>
    <span class="user-button-text">{{ displayName }}</span>
  </a>
  <a v-else class="user-button-shell user-button-shell--link" href="/login">
    <span class="user-button-avatar" aria-hidden="true">{{ avatarLabel }}</span>
    <span class="user-button-text">Login</span>
  </a>
</template>

<style scoped>
.user-button-shell {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 112px;
  height: 34px;
  padding: 0 0.7rem;
  border-radius: 8px;
  color: var(--ink-2);
  background: transparent;
}

.user-button-shell--link {
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.user-button-shell--link:hover {
  background: var(--bg-raised);
  color: var(--ink);
}

.user-button-shell--loading {
  pointer-events: none;
}

.user-button-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--bg-raised);
  color: var(--ink);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.user-button-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-button-avatar--skeleton,
.user-button-text-skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-raised) 0%,
    color-mix(in srgb, var(--bg-raised) 78%, var(--ink) 22%) 50%,
    var(--bg-raised) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}

.user-button-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
  line-height: 1;
}

.user-button-text-skeleton {
  display: block;
  width: 100%;
  height: 0.72rem;
  border-radius: 999px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
