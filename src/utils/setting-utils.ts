// import { AUTO_MODE, DARK_MODE, DEFAULT_THEME, LIGHT_MODE } from "../constants/constants";
// import type { LIGHT_DARK_MODE } from "../types/config";

export function getDefaultHue(): number {
  const fallback = "250";
  const configCarrier = document.getElementById("config-carrier");
  return Number.parseInt(configCarrier?.dataset.hue || fallback);
}

export function getHue(): number {
  const stored = localStorage.getItem("hue");
  return stored ? Number.parseInt(stored) : getDefaultHue();
}

export function setHue(hue: number): void {
  localStorage.setItem("hue", String(hue));
  const r = document.querySelector(":root") as HTMLElement;
  if (!r) {
    return;
  }
  r.style.setProperty("--hue", String(hue));
}

/* ===== Rainbow Mode ===== */
export function getRainbowMode(): boolean {
  return localStorage.getItem("rainbow-mode") === "true";
}
export function setRainbowMode(enabled: boolean): void {
  localStorage.setItem("rainbow-mode", String(enabled));
  if (enabled) {
    document.documentElement.classList.add("is-rainbow-mode");
  } else {
    document.documentElement.classList.remove("is-rainbow-mode");
  }
}
export function getRainbowSpeed(): number {
  return Number.parseInt(localStorage.getItem("rainbow-speed") || "20");
}
export function setRainbowSpeed(speed: number): void {
  localStorage.setItem("rainbow-speed", String(speed));
  document.documentElement.style.setProperty("--rainbow-duration", `${120 / speed}s`);
}

/* ===== Background Blur ===== */
export function getBgBlur(): number {
  return Number.parseInt(localStorage.getItem("bg-blur") || "0");
}
export function setBgBlur(blur: number): void {
  localStorage.setItem("bg-blur", String(blur));
  document.documentElement.style.setProperty("--bg-blur", `${blur}px`);
}

// export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
//   switch (theme) {
//     case LIGHT_MODE:
//       document.documentElement.classList.remove("dark");
//       break;
//     case DARK_MODE:
//       document.documentElement.classList.add("dark");
//       break;
//     case AUTO_MODE:
//       if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//         document.documentElement.classList.add("dark");
//       } else {
//         document.documentElement.classList.remove("dark");
//       }
//       break;
//   }
// }
//
// export function setTheme(theme: LIGHT_DARK_MODE): void {
//   localStorage.setItem("theme-fuwari", theme);
//   applyThemeToDocument(theme);
// }
//
// export function getStoredTheme(): LIGHT_DARK_MODE {
//   return (localStorage.getItem("theme-fuwari") as LIGHT_DARK_MODE) || DEFAULT_THEME;
// }
