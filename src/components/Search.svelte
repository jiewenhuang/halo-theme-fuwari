<script lang="ts">
  import { onMount } from "svelte";
  import type { Hit, SearchResult } from "../types/searchResult";

  let keywordDesktop = $state("");
  let keywordMobile = $state("");
  let result = $state<Hit[]>([]);
  let isSearching = $state(false);
  let initialized = $state(false);
  let desktopTimer: number | undefined;
  let mobileTimer: number | undefined;
  let searchId = 0;

  type I18nWindow = Window & { i18nResources?: Record<string, string> };

  const t = (key: string, fallback: string): string => {
    const value = typeof window !== "undefined"
      ? (window as I18nWindow).i18nResources?.[key]
      : undefined;
    return value && !value.includes("#{") ? value : fallback;
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const renderHighlighted = (value?: string) =>
    escapeHtml(value || "")
      .replaceAll("&lt;mark&gt;", "<mark>")
      .replaceAll("&lt;/mark&gt;", "</mark>");

  const excerptOf = (hit: Hit) => renderHighlighted(hit.description || hit.content || "");

  const togglePanel = () => {
    const panel = document.getElementById("search-panel");
    panel?.classList.toggle("float-panel-closed");
  };

  const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
    const panel = document.getElementById("search-panel");
    if (!panel || !isDesktop) return;

    if (show) {
      panel.classList.remove("float-panel-closed");
    } else {
      panel.classList.add("float-panel-closed");
    }
  };

  const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
    const normalizedKeyword = keyword.trim();
    const currentSearchId = ++searchId;

    if (!normalizedKeyword) {
      result = [];
      setPanelVisibility(false, isDesktop);
      return;
    }

    isSearching = true;

    try {
      const response = await fetch("/apis/api.halo.run/v1alpha1/indices/-/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: normalizedKeyword,
          highlightPreTag: "<mark>",
          highlightPostTag: "</mark>",
          limit: 20,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }

      const data = (await response.json()) as SearchResult;
      if (currentSearchId !== searchId) return;
      result = data.hits || [];
      setPanelVisibility(result.length > 0, isDesktop);
    } catch (error) {
      console.error("Search error:", error);
      if (currentSearchId !== searchId) return;
      result = [];
      setPanelVisibility(false, isDesktop);
    } finally {
      if (currentSearchId === searchId) {
        isSearching = false;
      }
    }
  };

  const scheduleSearch = (keyword: string, isDesktop: boolean) => {
    const timer = isDesktop ? desktopTimer : mobileTimer;
    if (timer) {
      window.clearTimeout(timer);
    }

    const nextTimer = window.setTimeout(() => {
      search(keyword, isDesktop);
    }, 250);

    if (isDesktop) {
      desktopTimer = nextTimer;
    } else {
      mobileTimer = nextTimer;
    }
  };

  onMount(() => {
    initialized = true;
    return () => {
      if (desktopTimer) window.clearTimeout(desktopTimer);
      if (mobileTimer) window.clearTimeout(mobileTimer);
    };
  });

  $effect(() => {
    if (initialized) {
      scheduleSearch(keywordDesktop, true);
    }
  });

  $effect(() => {
    if (initialized) {
      scheduleSearch(keywordMobile, false);
    }
  });
</script>

<!-- search bar for desktop view -->
<div
  id="search-bar"
  class="mr-2 hidden h-11 items-center rounded-lg bg-black/[0.04] transition-all hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10 lg:flex"
>
  <span class="icon-[material-symbols--search] pointer-events-none absolute ml-3 text-[1.25rem] text-black/30 transition dark:text-white/30"></span>
  <input
    placeholder={t("search.placeholder", "搜索")}
    bind:value={keywordDesktop}
    onfocus={() => search(keywordDesktop, true)}
    class="h-full w-40 bg-transparent pl-10 text-sm text-black/50 outline-0 transition-all active:w-60 focus:w-60 dark:text-white/50"
  />
</div>

<!-- toggle btn for phone/tablet view -->
<button
  onclick={togglePanel}
  aria-label={t("search.panel", "Search Panel")}
  id="search-switch"
  class="btn-plain scale-animation h-11 w-11 rounded-lg active:scale-90 lg:!hidden"
  type="button"
>
  <span class="icon-[material-symbols--search] text-[1.25rem]"></span>
</button>

<!-- search panel -->
<div
  id="search-panel"
  class="float-panel search-panel float-panel-closed absolute left-4 right-4 top-20 rounded-2xl p-2 shadow-2xl md:left-[unset] md:w-[30rem]"
>
  <!-- search bar inside panel for phone/tablet -->
  <div
    id="search-bar-inside"
    class="relative flex h-11 items-center rounded-xl bg-black/[0.04] transition-all hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10 lg:hidden"
  >
    <span class="icon-[material-symbols--search] pointer-events-none absolute ml-3 text-[1.25rem] text-black/30 transition dark:text-white/30"></span>
    <input
      placeholder={t("search.placeholder", "搜索")}
      bind:value={keywordMobile}
      class="absolute inset-0 bg-transparent pl-10 text-sm text-black/50 outline-0 focus:w-60 dark:text-white/50"
    />
  </div>

  {#if isSearching}
    <div class="px-3 py-3 text-sm text-30">{t("search.loading", "搜索中...")}</div>
  {:else if (keywordDesktop || keywordMobile) && result.length === 0}
    <div class="px-3 py-3 text-sm text-30">{t("search.noResults", "没有搜索结果")}</div>
  {/if}

  <!-- search results -->
  {#each result as item}
    <a
      href={item.permalink}
      class="group block rounded-xl px-3 py-2 text-lg transition first-of-type:mt-2 hover:bg-(--btn-plain-bg-hover) active:bg-(--btn-plain-bg-active) lg:first-of-type:mt-0"
    >
      <div class="inline-flex font-bold text-90 transition group-hover:text-(--primary)">
        {@html renderHighlighted(item.title)}
        <span class="icon-[fa6-solid--chevron-right] my-auto translate-x-1 text-[0.75rem] text-(--primary) transition"></span>
      </div>
      <div class="text-sm text-50 transition">
        {@html excerptOf(item)}
      </div>
    </a>
  {/each}
</div>

<style>
  input:focus {
    outline: 0;
  }

  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
</style>
