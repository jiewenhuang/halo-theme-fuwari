// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import swup from "@swup/astro";

import vue from "@astrojs/vue";
import Icons from "unplugin-icons/vite";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";

/** @typedef {NonNullable<NonNullable<Parameters<typeof defineConfig>[0]["vite"]>["plugins"]>[number]} AstroVitePlugin */

/** @type {AstroVitePlugin} */
const iconsPlugin = /** @type {AstroVitePlugin} */ (
  /** @type {unknown} */ (
    Icons({
      compiler: "vue3",
    })
  )
);

export default defineConfig({
  base: "/themes/theme-fuwari",
  build: {
    assets: "assets",
    format: "file",
  },
  experimental: {
    rustCompiler: true,
  },
  outDir: "./templates",
  integrations: [
    swup({
      theme: false,
      animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
      // the default value `transition-` cause transition delay
      // when the Tailwind class `transition-all` is used
      containers: ["main", "#toc-container"],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
    }),
    icon({
      include: {
        "preprocess: vitePreprocess(),": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"],
      },
    }),
    vue(),
    svelte(),
  ],
  vite: {
    plugins: [tailwindcss(), iconsPlugin],
  },
});
