/// <reference types="vite/client" />

import type { Alpine } from "alpinejs";
import type { LIGHT_DARK_MODE } from "./types/config";

export {};

declare global {
  interface Window {
    Alpine: Alpine;
    i18nResources: Record<string, string>;
    fuwari: {
      setColorScheme: (colorScheme: LIGHT_DARK_MODE, store: boolean) => void;
      getCurrentColorScheme: () => LIGHT_DARK_MODE;
      setWeatherType?: (type: "sunny" | "cloudy" | "rain") => void;
      getWeatherType?: () => "sunny" | "cloudy" | "rain";
    };
  }
}
