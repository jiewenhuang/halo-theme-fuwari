import { fileURLToPath, URL } from "node:url";

import { viteConfig } from "@halo-dev/ui-plugin-bundler-kit";
import Icons from "unplugin-icons/vite";
import type { PluginOption } from "vite";

const iconsPlugin = Icons({ compiler: "vue3" }) as unknown as PluginOption;

export default viteConfig({
  manifestPath: "./ui-plugin.yaml",
  vite: {
    plugins: [iconsPlugin],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "chunks",
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            return assetInfo.name === "style.css"
              ? "style.css"
              : "chunks/[name]-[hash][extname]";
          },
        },
      },
    },
  },
});
