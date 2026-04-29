import type {ThemeConfig} from "./types/config.ts";

let themeConfig: ThemeConfig | undefined= undefined;

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
themeConfig = getThemeConfig();
console.log("主题配置：", themeConfig);

export {themeConfig}


