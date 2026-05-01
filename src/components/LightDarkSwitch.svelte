<script lang="ts">
  import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "../constants/constants.ts";

  import {
    applyThemeToDocument,
    getStoredTheme,
    setTheme,
  } from "../utils/setting-utils.ts";
  import { onMount } from "svelte";
  import type { LIGHT_DARK_MODE } from "../types/config.ts";

  const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
  let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);
  type I18nWindow = Window & { i18nResources?: Record<string, string> };

  const t = (key: string, fallback: string): string => {
    const value = typeof window !== "undefined"
      ? (window as I18nWindow).i18nResources?.[key]
      : undefined;
    return value && !value.includes("#{") ? value : fallback;
  };

  onMount(() => {
    mode = getStoredTheme();
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
    const changeThemeWhenSchemeChanged: Parameters<
      typeof darkModePreference.addEventListener<"change">
    >[1] = (_e) => {
      applyThemeToDocument(mode);
    };
    darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
    return () => {
      darkModePreference.removeEventListener(
        "change",
        changeThemeWhenSchemeChanged,
      );
    };
  });

  function switchScheme(newMode: LIGHT_DARK_MODE) {
    mode = newMode;
    setTheme(newMode);
  }

  function toggleScheme() {
    let i = 0;
    for (; i < seq.length; i++) {
      if (seq[i] === mode) {
        break;
      }
    }
    switchScheme(seq[(i + 1) % seq.length]);
  }

  function showPanel() {
    const panel = document.querySelector("#light-dark-panel");
    panel.classList.remove("float-panel-closed");
  }

  function hidePanel() {
    const panel = document.querySelector("#light-dark-panel");
    panel.classList.add("float-panel-closed");
  }
</script>

<!-- z-50 make the panel higher than other float panels -->
<div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hidePanel}>
  <button aria-label={t("nav.lightDark", "Light/Dark Mode")} role="menuitem" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" onclick={toggleScheme} onmouseenter={showPanel}>
    <div class="absolute inset-0 flex items-center justify-center" class:opacity-0={mode !== LIGHT_MODE}>
<!--      <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>-->
      <div class="icon-[material-symbols--wb-sunny-outline-rounded] text-[1.25rem] leading-none"></div>
    </div>
    <div class="absolute inset-0 flex items-center justify-center" class:opacity-0={mode !== DARK_MODE}>
<!--      <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>-->
      <div class="icon-[material-symbols--dark-mode-outline-rounded] text-[1.25rem] leading-none"></div>
    </div>
    <div class="absolute inset-0 flex items-center justify-center" class:opacity-0={mode !== AUTO_MODE}>
<!--      <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>-->
      <div class="icon-[material-symbols--radio-button-partial-outline] text-[1.25rem] leading-none"></div>
    </div>
  </button>

  <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
    <div class="card-base float-panel p-2">
      <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
              class:current-theme-btn={mode === LIGHT_MODE}
              onclick={() => switchScheme(LIGHT_MODE)}
      >
<!--        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3"></Icon>-->
        <div class="icon-[material-symbols--wb-sunny-outline-rounded] text-[1.25rem] mr-3"></div>
        {t("theme.light", "亮色")}
      </button>
      <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
              class:current-theme-btn={mode === DARK_MODE}
              onclick={() => switchScheme(DARK_MODE)}
      >
<!--        <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3"></Icon>-->
        <div class="icon-[material-symbols--dark-mode-outline-rounded] text-[1.25rem] mr-3"></div>
        {t("theme.dark", "暗色")}
      </button>
      <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
              class:current-theme-btn={mode === AUTO_MODE}
              onclick={() => switchScheme(AUTO_MODE)}
      >
<!--        <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3"></Icon>-->
        <div class="icon-[material-symbols--radio-button-partial-outline] text-[1.25rem] mr-3"></div>
        {t("theme.system", "系统")}
      </button>
    </div>
  </div>
</div>
