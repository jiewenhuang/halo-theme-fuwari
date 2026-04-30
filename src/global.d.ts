import type { AstroIntegration } from "@swup/astro";

declare global {
  interface Window {
    // type from '@swup/astro' is incorrect
    swup: AstroIntegration;
    __fuwariOriginalHistory?: {
      pushState?: History["pushState"];
      replaceState?: History["replaceState"];
    };
    __fuwariSwupHandlersBound?: boolean;
    SearchWidget?: {
      open: () => void;
    };
  }
}
