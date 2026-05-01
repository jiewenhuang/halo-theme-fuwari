# AGENTS.md

## Project Overview

Halo 2 CMS blog theme "Fuwari" - an Astro-based theme ported from the original [fuwari](https://github.com/saicaca/fuwari) Astro theme.

**Tech Stack**: Astro 6, Vue 3, Svelte 5, Tailwind CSS 4, TypeScript, pnpm

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server with file watching (nodemon)
pnpm build            # Build theme to templates/
pnpm build:pkg        # Build + package for Halo distribution
pnpm format           # Format with Prettier (includes .astro files)
```

**No test suite** - verify changes by running `pnpm build` and checking output.

## Architecture

### Build Output

- `templates/` is the build output directory (gitignored)
- Base path: `/themes/theme-fuwari`
- Experimental Rust compiler enabled (`astro.config.mjs`)

### Source Structure

- `src/pages/` - Astro page templates (index, post, archives, categories, tags, etc.)
- `src/layouts/` - Layout components (Layout.astro, MainGridLayout.astro)
- `src/components/` - Mixed framework components:
  - `.astro` - Static components (Header, Footer, PostCard, etc.)
  - `.svelte` - Interactive components (Search, LightDarkSwitch)
  - `.vue` - Interactive components (ThemeSwitcher, UserButton)
- `src/styles/` - Global styles
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

### Key Files

- `astro.config.mjs` - Astro configuration with integrations
- `theme.yaml` - Halo theme metadata (requires Halo >= 2.24.0)
- `settings.yaml` - Halo theme settings schema
- `i18n/` - Internationalization properties files
- `nodemon.json` - Watches `src/**/*` and `public/**/*` for dev rebuilds

### External Dependencies

- `@halo-dev/api-client` - Halo API client
- `@swup/astro` - Page transitions (containers: `main`, `#toc-container`)
- `astro-icon` + `unplugin-icons` - Icon system (Iconify)
- `sharp` - Image processing (requires native build)

## Conventions

- **Formatting**: Prettier with `prettier-plugin-astro` (config in `package.json`)
- **Icons**: Use Iconify icon classes (e.g., `icon-[mdi--github]`)
- **Theme Config**: Embedded in HTML via `#theme-config` script tag
- **Translations**: Halo i18n format in `i18n/*.properties`

## CI/CD

- GitHub Actions CD workflow triggers on releases
- Uses `halo-sigs/reusable-workflows` for theme packaging
- Requires `HALO_PAT` secret for publishing

## Gotchas

- `templates/` and `_fuwari/` are gitignored - don't edit build output
- `_fuwari/` contains the original fuwari theme source for reference
- Node.js >= 22.12.0 required
- `pnpm-workspace.yaml` allows native builds for esbuild and sharp
