import "./styles/variables.styl";
import "./styles/tailwind.css";

import "./styles/main.css";

import "./styles/markdown-extend.styl";
import "./styles/back-to-top.styl";
import "./styles/scrollbar.css";
import "./styles/transition.css";
import "./styles/markdown.css";
import "./styles/photoswipe.css";

import "overlayscrollbars/overlayscrollbars.css";
import "photoswipe/style.css";
import "./styles/music-player.css";

import Alpine from "alpinejs";
import Swup from "swup";
import SwupHeadPlugin from "@swup/head-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupScriptsPlugin from "@swup/scripts-plugin";

import { mountSearch, mountDisplaySettings, mountToc } from "./preact";
import {
  OverlayScrollbars,
  // ScrollbarsHidingPlugin,
  // SizeObserverPlugin,
  // ClickScrollPlugin
} from "overlayscrollbars";
import PhotoSwipeLightbox from "photoswipe/lightbox";

import { getHue, setHue, getRainbowMode, setRainbowMode, getRainbowSpeed, setRainbowSpeed, getBgBlur, setBgBlur } from "./utils/setting-utils";
import { initMusicPlayer } from "./plugins/music-player";
import { initDistortionText } from "./plugins/distortion-text";
import { initLiquidGlass } from "./plugins/liquid-glass";
import { initWeatherEffect, setWeatherType, getWeatherType } from "./plugins/weather-effect";
import { trackPageVisit, displaySiteStats } from "./plugins/visit-tracker";
import { loadButtonScript } from "./widgets/navbar";
import { setClickOutsideToClose } from "./utils/base-utils";
import dropdown from "./alpine-data/dropdown";
import colorSchemeSwitcher from "./alpine-data/color-scheme-switcher";
import weatherSwitcher from "./alpine-data/weather-switcher";
import upvote from "./alpine-data/upvote";
import share from "./alpine-data/share";
import uiPermission from "./alpine-data/ui-permission";
import articleStats from "./alpine-data/article-stats";

import type { ThemeConfig, LIGHT_DARK_MODE } from "./types/config";
import {
  BANNER_HEIGHT,
  BANNER_HEIGHT_EXTEND,
  BANNER_HEIGHT_HOME,
  MAIN_PANEL_OVERLAPS_BANNER_HEIGHT,
} from "./constants/constants";

import { mountCounter } from "./preact";

window.Alpine = Alpine;

// 将主要函数暴露到全局 window.fuwari 对象中以便模板调用
window.fuwari = {
  setColorScheme,
  getCurrentColorScheme,
  setWeatherType,
  getWeatherType,
};
const swup = new Swup({
  animationSelector: '[class*="transition-swup-"]',
  containers: ["main"],
  plugins: [
    new SwupHeadPlugin({ persistAssets: true }),
    new SwupPreloadPlugin(),
    new SwupScrollPlugin(),
    new SwupScriptsPlugin({
      head: false,
      body: true,
    }),
  ],
});
Alpine.data("dropdown", dropdown);
Alpine.data("colorSchemeSwitcher", colorSchemeSwitcher);
Alpine.data("weatherSwitcher", weatherSwitcher);
Alpine.data("upvote", upvote);
Alpine.data("share", share);
Alpine.data("uiPermission", uiPermission);
Alpine.data("articleStats", articleStats);
Alpine.start();

function getThemeConfig(): ThemeConfig | undefined {
  const el = document.querySelector<HTMLScriptElement>("#theme-config");
  if (!el?.textContent) return undefined;

  try {
    return JSON.parse(el.textContent) as ThemeConfig;
  } catch (e) {
    console.error("解析 theme-config 失败:", e);
    return undefined;
  }
}

// 使用
const themeConfig = getThemeConfig();
const debugEnabled = !!themeConfig?.development?.enabled;
if (debugEnabled) console.log("主题配置：", themeConfig);

function mountWidgets() {
  if (debugEnabled) console.log("Mounting widgets...");
  const counterContainer = document.querySelector("#counter");
  if (counterContainer) {
    mountCounter(counterContainer as HTMLElement);
  }
  //   挂载搜索框
  const searchContainer = document.querySelector("#search");
  if (searchContainer) {
    mountSearch(searchContainer as HTMLElement);
  }
  //   挂载主题色设置
  const displaySettingsContainer = document.querySelector("#display-setting");
  if (displaySettingsContainer) {
    mountDisplaySettings(displaySettingsContainer as HTMLElement);
  }
  //   挂载目录
  const tocContainer = document.querySelector(".toc");
  if (tocContainer) {
    mountToc(tocContainer as HTMLElement);
  }
}

// 新增：初始化笔记块函数
function initNoteBlocks() {
  //console.log("Initializing note blocks...");
  const blockquotes = document.querySelectorAll("blockquote");

  blockquotes.forEach(function (blockquote) {
    const paragraphs = blockquote.querySelectorAll("p");

    if (paragraphs.length > 0) {
      const firstP = paragraphs[0] as HTMLElement;
      const firstText = firstP.textContent?.trim() || "";

      if (firstText.startsWith("[!NOTE]")) {
        blockquote.classList.add("note-block");

        firstP.innerHTML = firstP.innerHTML.replace("[!NOTE]", "NOTE: "); // 示例替换
      }
      if (firstText.startsWith("[!TIP]")) {
        blockquote.classList.add("tip-block");

        firstP.innerHTML = firstP.innerHTML.replace("[!TIP]", "TIP: ");
      }
      if (firstText.startsWith("[!IMPORTANT]")) {
        blockquote.classList.add("important-block");

        firstP.innerHTML = firstP.innerHTML.replace("[!IMPORTANT]", "IMPORTANT: ");
      }
      if (firstText.startsWith("[!WARNING]")) {
        blockquote.classList.add("warning-block");

        firstP.innerHTML = firstP.innerHTML.replace("[!WARNING]", "WARNING: ");
      }
      if (firstText.startsWith("[!CAUTION]")) {
        blockquote.classList.add("caution-block");

        firstP.innerHTML = firstP.innerHTML.replace("[!CAUTION]", "CAUTION: ");
      }
    }
  });
}

let currentColorScheme: LIGHT_DARK_MODE = "auto";

export function initColorScheme(defaultColorScheme: LIGHT_DARK_MODE, enableChangeColorScheme: boolean) {
  let colorScheme = defaultColorScheme;

  if (enableChangeColorScheme) {
    colorScheme = (localStorage.getItem("color-scheme-fuwari") as LIGHT_DARK_MODE) || defaultColorScheme;
  }

  currentColorScheme = colorScheme;

  setColorScheme(colorScheme, false);
}

export function setColorScheme(colorScheme: LIGHT_DARK_MODE, store: boolean) {
  if (colorScheme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.add(prefersDark ? "dark" : "light");
    document.documentElement.classList.remove(prefersDark ? "light" : "dark");
  } else {
    document.documentElement.classList.add(colorScheme);
    document.documentElement.classList.remove(colorScheme === "dark" ? "light" : "dark");
  }
  currentColorScheme = colorScheme;
  if (store) {
    localStorage.setItem("color-scheme-fuwari", colorScheme);
  }
}

export function getCurrentColorScheme(): LIGHT_DARK_MODE {
  return currentColorScheme;
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
  if (currentColorScheme === "auto") {
    setColorScheme("auto", false);
  }
});

let bannerEnabled = !!document.getElementById("banner-wrapper");

function loadHue() {
  setHue(getHue());
}

function initCustomScrollbar() {
  const bodyElement = document.querySelector("body");
  if (!bodyElement) return;
  OverlayScrollbars(
    // docs say that an initialization to the body element would affect native functionality like window.scrollTo
    // but just leave it here for now
    {
      target: bodyElement,
      cancel: {
        nativeScrollbarsOverlaid: true, // don't initialize the overlay scrollbar if there is a native one
      },
    },
    {
      scrollbars: {
        theme: "scrollbar-base scrollbar-auto py-1",
        autoHide: "move",
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    },
  );

  const katexElements = document.querySelectorAll(".katex-display") as NodeListOf<HTMLElement>;

  const katexObserverOptions = {
    root: null,
    rootMargin: "100px",
    threshold: 0.1,
  };

  const processKatexElement = (element: HTMLElement) => {
    if (!element.parentNode) return;
    if (element.hasAttribute("data-scrollbar-initialized")) return;

    const container = document.createElement("div");
    container.className = "katex-display-container";
    container.setAttribute("aria-label", "scrollable container for formulas");

    element.parentNode.insertBefore(container, element);
    container.appendChild(element);

    OverlayScrollbars(container, {
      scrollbars: {
        theme: "scrollbar-base scrollbar-auto",
        autoHide: "leave",
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    });

    element.setAttribute("data-scrollbar-initialized", "true");
  };

  const katexObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        processKatexElement(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    });
  }, katexObserverOptions);

  katexElements.forEach((element) => {
    katexObserver.observe(element);
  });
}
function showBanner() {
  if (!themeConfig?.base.banner.enable) return;

  const banner = document.getElementById("banner");
  if (!banner) {
    console.error("Banner element not found");
    return;
  }

  banner.classList.remove("opacity-0", "scale-105");
}
function initRainbowMode() {
  if (getRainbowMode()) {
    setRainbowMode(true);
    setRainbowSpeed(getRainbowSpeed());
  }
}

function initBgBlur() {
  setBgBlur(getBgBlur());
}

function init() {
  initColorScheme(
    themeConfig?.style.color_scheme as LIGHT_DARK_MODE,
    themeConfig?.style.enable_change_color_scheme as boolean,
  );
  loadHue();
  initRainbowMode();
  initBgBlur();
  initCustomScrollbar();
  initNoteBlocks();
  showBanner();
  // 初始化音乐播放器（仅初始化一次）
  if (themeConfig?.music && !document.getElementById("music-player")) {
    initMusicPlayer(themeConfig.music);
  }
  // 流动文字（页脚扭曲特效）：仅当开启且填写了文字时初始化
  const effects = themeConfig?.appearance?.effects;
  const flowText = effects?.flow_text?.trim();
  if (effects?.enable_flow_text && flowText) {
    const distortionEl = document.getElementById("distortion-text");
    if (distortionEl && !distortionEl.querySelector("canvas")) {
      initDistortionText(distortionEl, flowText);
    }
  }
  // 液态玻璃效果（仅导航栏 + 跟随）
  if (effects?.enable_liquid_glass) {
    initLiquidGlass();
  }
  // 天气拟真效果：配置开启或顶栏已有天气按钮时初始化（避免客户端 config 与服务端不一致导致不渲染）
  const shouldEnableWeather = effects?.enable_weather || !!document.getElementById("weather-switch");
  if (shouldEnableWeather) {
    initWeatherEffect(effects?.weather_type ?? "sunny");
  }
  // Halo 内置访客统计
  const analytics = themeConfig?.footer?.analytics ?? themeConfig?.analytics;
  if (analytics?.enable !== false) {
    trackPageVisit();
    if (analytics?.show_site_stats !== false) {
      displaySiteStats();
    }
  }
}
/* Load settings when entering the site */

// 初始化 Swup
const setup = () => {
  // TODO: temp solution to change the height of the banner
  /*
    window.swup.hooks.on('animation:out:start', () => {
      const path = window.location.pathname
      const body = document.querySelector('body')
      if (path[path.length - 1] === '/' && !body.classList.contains('is-home')) {
        body.classList.add('is-home')
      } else if (path[path.length - 1] !== '/' && body.classList.contains('is-home')) {
        body.classList.remove('is-home')
      }
    })
  */
  swup.hooks.on("link:click", () => {
    // Remove the delay for the first time page load
    document.documentElement.style.setProperty("--content-delay", "0ms");

    // prevent elements from overlapping the navbar
    if (!bannerEnabled) {
      return;
    }
    const threshold = window.innerHeight * (BANNER_HEIGHT / 100) - 72 - 16;
    const navbar = document.getElementById("navbar-wrapper");
    if (!navbar || !document.body.classList.contains("is-home")) {
      return;
    }
    if (document.body.scrollTop >= threshold || document.documentElement.scrollTop >= threshold) {
      navbar.classList.add("navbar-hidden");
    }
  });
  swup.hooks.on("content:replace", (_visit) => {
    // change banner height immediately when a link is clicked
    const _pageType = _visit.to.document?.body?.getAttribute("data-page-type");
    const bodyElement = document.querySelector("body");
    if (_pageType === "home") {
      bodyElement?.classList.add("is-home");
    } else {
      bodyElement?.classList.remove("is-home");
    }
    // set the page type to the body element
    document.body?.setAttribute("data-page-type", _visit.to.document?.body?.getAttribute("data-page-type") || "");

    initCustomScrollbar();
    initNoteBlocks(); // 新增：内容替换后重新初始化笔记块（SPA 路由关键）
    if (themeConfig?.appearance?.effects?.enable_liquid_glass) {
      initLiquidGlass();
    }
    const hasWeatherBtn = document.getElementById("weather-switch");
    if (themeConfig?.appearance?.effects?.enable_weather || hasWeatherBtn) {
      initWeatherEffect(themeConfig?.appearance?.effects?.weather_type ?? "sunny");
    }
    // SPA 路由后重新追踪访问
    if ((themeConfig?.footer?.analytics ?? themeConfig?.analytics)?.enable !== false) {
      trackPageVisit();
    }
  });
  swup.hooks.on("visit:start", () => {
    // increase the page height during page transition to prevent the scrolling animation from jumping
    const heightExtend = document.getElementById("page-height-extend");
    if (heightExtend) {
      heightExtend.classList.remove("hidden");
    }

    // Hide the TOC while scrolling back to top
    const toc = document.getElementById("toc-wrapper");
    if (toc) {
      toc.classList.add("toc-not-ready");
    }
  });
  swup.hooks.on("page:view", () => {
    // hide the temp high element when the transition is done
    const heightExtend = document.getElementById("page-height-extend");
    if (heightExtend) {
      heightExtend.classList.remove("hidden");
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  swup.hooks.on("visit:end", (_visit: { to: { url: string } }) => {
    setTimeout(() => {
      const heightExtend = document.getElementById("page-height-extend");
      if (heightExtend) {
        heightExtend.classList.add("hidden");
      }

      // Just make the transition looks better
      const toc = document.getElementById("toc-wrapper");
      if (toc) {
        toc.classList.remove("toc-not-ready");
      }
    }, 200);
  });
};
setup();

window.onresize = () => {
  // calculate the --banner-height-extend, which needs to be a multiple of 4 to avoid blurry text
  let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
  offset = offset - (offset % 4);
  document.documentElement.style.setProperty("--banner-height-extend", `${offset}px`);
};

let lightbox: PhotoSwipeLightbox;
const pswp = import("photoswipe");
function createPhotoSwipe() {
  lightbox = new PhotoSwipeLightbox({
    gallery: ".custom-md img, #post-cover img",
    pswpModule: () => pswp,
    closeSVG:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>',
    zoomSVG:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M340-540h-40q-17 0-28.5-11.5T260-580q0-17 11.5-28.5T300-620h40v-40q0-17 11.5-28.5T380-700q17 0 28.5 11.5T420-660v40h40q17 0 28.5 11.5T500-580q0 17-11.5 28.5T460-540h-40v40q0 17-11.5 28.5T380-460q-17 0-28.5-11.5T340-500v-40Zm40 220q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>',
    padding: { top: 20, bottom: 20, left: 20, right: 20 },
    wheelToZoom: true,
    arrowPrev: false,
    arrowNext: false,
    imageClickAction: "close",
    tapAction: "close",
    doubleTapAction: "zoom",
  });

  lightbox.addFilter("domItemData", (itemData, element) => {
    if (element instanceof HTMLImageElement) {
      itemData.src = element.src;

      itemData.w = Number(element.naturalWidth || window.innerWidth);
      itemData.h = Number(element.naturalHeight || window.innerHeight);

      itemData.msrc = element.src;
    }

    return itemData;
  });

  lightbox.init();
}
const setupLightbox = () => {
  if (!lightbox) {
    createPhotoSwipe();
  }
  swup.hooks.on("page:view", () => {
    createPhotoSwipe();
  });

  swup.hooks.on(
    "content:replace",
    () => {
      lightbox?.destroy?.();
    },
    { before: true },
  );
};
setupLightbox();

// 导航点击

// 页面初始加载
document.addEventListener("DOMContentLoaded", () => {
  init();
  mountWidgets();
  loadButtonScript();
  setClickOutsideToClose("display-setting", ["display-setting", "display-settings-switch"]);
  setClickOutsideToClose("nav-menu-panel", ["nav-menu-panel", "nav-menu-switch"]);
  // setClickOutsideToClose("search-panel", ["search-panel", "search-bar", "search-switch"])

  const backToTopBtn = document.getElementById("back-to-top-btn");
  const toc = document.getElementById("toc-wrapper");
  const navbar = document.getElementById("navbar-wrapper");
  bannerEnabled = !!document.getElementById("banner-wrapper");

  const minimalToggle = document.getElementById("navbar-minimal-toggle");
  if (minimalToggle && navbar) {
    minimalToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navbar.classList.toggle("navbar-minimal");
    });
  }
  if (navbar) {
    navbar.addEventListener("click", () => {
      if (navbar.classList.contains("navbar-minimal")) {
        navbar.classList.remove("navbar-minimal");
      }
    });
  }

  const navBehavior = themeConfig?.navbar_behavior ?? themeConfig?.base?.navbar_behavior;
  const rawMode = navBehavior?.mode;
  const navMode = rawMode === "hide_after" ? "hide_after" : "transparent";
  const hideAfterSeconds = Math.min(10, Math.max(1, navBehavior?.hide_after_seconds ?? 2));

  let hideNavbarTimer: ReturnType<typeof setTimeout> | null = null;
  function clearHideNavbarTimer() {
    if (hideNavbarTimer != null) {
      clearTimeout(hideNavbarTimer);
      hideNavbarTimer = null;
    }
  }

  if (bannerEnabled && navbar && navMode === "transparent") {
    navbar.classList.add("navbar-transparent");
  }
  if (bannerEnabled && navbar && navMode === "hide_after") {
    navbar.classList.add("navbar-transparent");
    hideNavbarTimer = setTimeout(() => {
      hideNavbarTimer = null;
      navbar.classList.add("navbar-hidden");
      navbar.classList.remove("navbar-transparent");
    }, hideAfterSeconds * 1000);
  }

  function scrollFunction() {
    const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);

    if (backToTopBtn) {
      if (document.body.scrollTop > bannerHeight || document.documentElement.scrollTop > bannerHeight) {
        backToTopBtn.classList.remove("hide");
      } else {
        backToTopBtn.classList.add("hide");
      }
    }

    if (bannerEnabled && toc) {
      if (document.body.scrollTop > bannerHeight || document.documentElement.scrollTop > bannerHeight) {
        toc.classList.remove("toc-hide");
      } else {
        toc.classList.add("toc-hide");
      }
    }

    if (!bannerEnabled || !navbar) return;

    const NAVBAR_HEIGHT = 72;
    const MAIN_PANEL_EXCESS_HEIGHT = MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16;

    let bannerHeightNum = BANNER_HEIGHT;
    if (document.body.classList.contains("is-home") && window.innerWidth >= 1024) {
      bannerHeightNum = BANNER_HEIGHT_HOME;
    }
    const threshold =
      window.innerHeight * (bannerHeightNum / 100) - NAVBAR_HEIGHT - MAIN_PANEL_EXCESS_HEIGHT - 16;
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

    if (navMode === "hide_after") {
      clearHideNavbarTimer();
      if (scrollTop >= threshold) {
        navbar.classList.add("navbar-hidden");
        navbar.classList.remove("navbar-transparent");
      } else if (scrollTop < 200) {
        navbar.classList.remove("navbar-hidden");
        navbar.classList.add("navbar-transparent");
        hideNavbarTimer = setTimeout(() => {
          hideNavbarTimer = null;
          navbar.classList.add("navbar-hidden");
          navbar.classList.remove("navbar-transparent");
        }, hideAfterSeconds * 1000);
      } else {
        navbar.classList.remove("navbar-hidden");
        navbar.classList.remove("navbar-transparent");
      }
      return;
    }

    if (scrollTop >= threshold) {
      navbar.classList.add("navbar-hidden");
      navbar.classList.remove("navbar-transparent");
    } else if (scrollTop < 200) {
      navbar.classList.remove("navbar-hidden");
      navbar.classList.add("navbar-transparent");
    } else {
      navbar.classList.remove("navbar-hidden");
      navbar.classList.remove("navbar-transparent");
    }
  }
  window.onscroll = scrollFunction;

  const scrollToTopButton = document.getElementById("back-to-top-btn");

  if (!scrollToTopButton) {
    return;
  }

  scrollToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
