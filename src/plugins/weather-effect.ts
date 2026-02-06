/**
 * 超级拟真天气 - HyperOS-style: 多层景深、平滑过渡、全局动效
 * 晴天 / 多云 / 下雨，支持后续接入天气 API
 */

export type WeatherType = "sunny" | "cloudy" | "rain";

const STORAGE_KEY = "theme-fuwari-weather";
const TRANSITION_MS = 950;
const TRANSITION_EASE = "cubic-bezier(0.33, 0, 0.2, 1)";
const MAX_RAIN_DROPS = 2200;
const REDUCED_MOTION_FACTOR = 0.25;

let container: HTMLElement | null = null;
let currentType: WeatherType = "sunny";
let rainAnimationId: number | null = null;
let rainResize: (() => void) | null = null;
let transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isDestroyed = false;

function getContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById("weather-effect");
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function injectGlobalStyles(): void {
  if (typeof document === "undefined" || document.getElementById("weather-effect-styles")) return;
  const style = document.createElement("style");
  style.id = "weather-effect-styles";
  style.textContent = `
    .weather-effect { transition: opacity ${TRANSITION_MS}ms ${TRANSITION_EASE}; }
    @keyframes weather-sunny-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.75; } }
    @keyframes weather-sunny-ray { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.28; transform: scale(1.008); } }
    @keyframes weather-sunny-sun { 0%, 100% { opacity: 0.55; transform: scale(1); filter: brightness(1); } 50% { opacity: 0.7; transform: scale(1.01); filter: brightness(1.04); } }
    @keyframes weather-cloud-drift { 0% { transform: translateX(-12%) translateZ(0); } 100% { transform: translateX(112%) translateZ(0); } }
    @keyframes weather-cloud-drift-slow { 0% { transform: translateX(-8%) translateZ(0); } 100% { transform: translateX(108%) translateZ(0); } }
    .weather-cloud-outer { position: absolute; pointer-events: none; transform-origin: 0 0; backface-visibility: hidden; }
    .weather-cloud { position: absolute; border-radius: 50%; pointer-events: none; backface-visibility: hidden; }
    .weather-sun { pointer-events: none; backface-visibility: hidden; flex-shrink: 0; }
    .weather-layer { position: absolute; inset: 0; pointer-events: none; }
    .weather-rain-back { filter: blur(6px); opacity: 0.78; }
    .weather-rain-front { filter: none; }
  `;
  document.head.appendChild(style);
}

function clearEffect(): void {
  isDestroyed = true;
  if (transitionTimeoutId != null) {
    clearTimeout(transitionTimeoutId);
    transitionTimeoutId = null;
  }
  if (rainAnimationId != null) {
    cancelAnimationFrame(rainAnimationId);
    rainAnimationId = null;
  }
  if (rainResize) {
    try {
      window.removeEventListener("resize", rainResize);
    } catch {
      /* ignore */
    }
    rainResize = null;
  }
  if (container) {
    try {
      container.innerHTML = "";
      container.className = "weather-effect pointer-events-none fixed inset-0 z-[35]";
      container.style.opacity = "";
    } catch {
      /* ignore */
    }
  }
}

function safeApply(type: WeatherType): void {
  const el = getContainer();
  if (!el) return;
  container = el;
  isDestroyed = false;
  currentType = type;
  el.classList.add(`weather-${type}`);

  injectGlobalStyles();

  if (type === "sunny") renderSunny();
  else if (type === "cloudy") renderCloudy();
  else if (type === "rain") renderRain();
}

function renderSunny(): void {
  if (!container || isDestroyed) return;
  const wrap = document.createElement("div");
  wrap.className = "weather-layer weather-sunny";

  // 景深：最远层 - 大气霾（大范围、最柔）
  const haze = document.createElement("div");
  haze.className = "weather-layer";
  haze.setAttribute("aria-hidden", "true");
  haze.style.cssText = `
    background: radial-gradient(ellipse 200% 140% at 50% -25%,
      rgba(255, 248, 240, 0.04) 0%,
      rgba(255, 242, 230, 0.015) 40%,
      transparent 65%);
    filter: blur(4px);
    z-index: 0;
  `;
  wrap.appendChild(haze);

  const isDark = document.documentElement.classList.contains("dark");
  const sunCore = isDark
    ? "rgba(255,248,235,0.45)"
    : "rgba(255,252,248,0.5)";
  const sunMid = isDark
    ? "rgba(255,240,210,0.28)"
    : "rgba(255,245,225,0.35)";
  const sunOuter = isDark
    ? "rgba(255,228,200,0.12)"
    : "rgba(255,232,210,0.18)";
  const sunHalo = isDark
    ? "rgba(255,220,180,0.04)"
    : "rgba(255,218,190,0.06)";

  const sunWrap = document.createElement("div");
  sunWrap.className = "weather-layer";
  sunWrap.setAttribute("aria-hidden", "true");
  sunWrap.style.cssText = `
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    height: 28%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: clamp(1%, 8px, 3%);
  `;
  const sun = document.createElement("div");
  sun.className = "weather-sun";
  sun.setAttribute("aria-hidden", "true");
  sun.style.cssText = `
    position: relative;
    width: clamp(32px, 6vmin, 48px);
    height: clamp(32px, 6vmin, 48px);
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%,
      ${sunCore} 0%,
      ${sunMid} 28%,
      ${sunOuter} 55%,
      ${sunHalo} 78%,
      transparent 100%);
    box-shadow: 0 0 0 1px rgba(255,248,230,0.08),
                0 0 clamp(12px, 2.5vmin, 24px) clamp(4px, 1vmin, 12px) rgba(255,238,210,0.12),
                0 0 clamp(24px, 5vmin, 48px) clamp(6px, 1.5vmin, 16px) rgba(255,225,190,0.06);
    animation: weather-sunny-sun 22s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  `;
  sunWrap.appendChild(sun);
  wrap.appendChild(sunWrap);

  const base = document.createElement("div");
  base.className = "weather-layer";
  base.setAttribute("aria-hidden", "true");
  base.style.cssText = `
    background: radial-gradient(ellipse 130% 85% at 50% -18%,
      rgba(255, 242, 220, 0.12) 0%,
      rgba(255, 232, 200, 0.05) 38%,
      rgba(255, 225, 190, 0.02) 58%,
      transparent 72%);
    animation: weather-sunny-pulse 16s cubic-bezier(0.45, 0, 0.55, 1) infinite;
    z-index: 2;
  `;
  wrap.appendChild(base);

  const ray = document.createElement("div");
  ray.className = "weather-layer";
  ray.setAttribute("aria-hidden", "true");
  ray.style.cssText = `
    background: radial-gradient(ellipse 55% 38% at 50% 0%,
      rgba(255, 250, 240, 0.18) 0%,
      rgba(255, 246, 230, 0.06) 45%,
      transparent 62%);
    animation: weather-sunny-ray 18s cubic-bezier(0.45, 0, 0.55, 1) infinite;
    z-index: 3;
  `;
  wrap.appendChild(ray);

  container.appendChild(wrap);
}

function renderCloudy(): void {
  if (!container || isDestroyed) return;
  renderSunny();

  const reduced = prefersReducedMotion();
  // 景深：远层缩小+强模糊+低不透明，中层过渡，近层略大+弱模糊+高不透明
  const layerConfigs = [
    { count: reduced ? 2 : 4, sizeMin: 120, sizeMax: 220, topMin: 2, topMax: 14, durationMin: 72, durationMax: 110, speedKey: "weather-cloud-drift-slow", opacity: 0.05, blur: 10, zIndex: 1, scale: 0.82 },
    { count: reduced ? 2 : 5, sizeMin: 80, sizeMax: 165, topMin: 5, topMax: 24, durationMin: 52, durationMax: 88, speedKey: "weather-cloud-drift", opacity: 0.085, blur: 5, zIndex: 2, scale: 0.94 },
    { count: reduced ? 1 : 4, sizeMin: 50, sizeMax: 115, topMin: 9, topMax: 30, durationMin: 34, durationMax: 58, speedKey: "weather-cloud-drift", opacity: 0.14, blur: 1.5, zIndex: 3, scale: 1.04 },
  ];

  const isDark = document.documentElement.classList.contains("dark");
  const cloudBgFar = isDark ? "rgba(248,250,252,0.05)" : "rgba(248,252,255,0.09)";
  const cloudBgMid = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.11)";
  const cloudBgNear = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.13)";

  for (let cfgIndex = 0; cfgIndex < layerConfigs.length; cfgIndex++) {
    const cfg = layerConfigs[cfgIndex];
    const cloudBg = cfgIndex === 0 ? cloudBgFar : cfgIndex === 1 ? cloudBgMid : cloudBgNear;
    for (let i = 0; i < cfg.count; i++) {
      const outer = document.createElement("div");
      outer.className = "weather-cloud-outer";
      outer.setAttribute("aria-hidden", "true");
      const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);
      const top = cfg.topMin + Math.random() * (cfg.topMax - cfg.topMin);
      const duration = cfg.durationMin + Math.random() * (cfg.durationMax - cfg.durationMin);
      const delay = -Math.random() * 35;
      outer.style.cssText = `
        top: ${top}%;
        left: -10%;
        z-index: ${cfg.zIndex};
        transform: scale(${cfg.scale});
      `;
      const cloud = document.createElement("div");
      cloud.className = "weather-cloud";
      cloud.setAttribute("aria-hidden", "true");
      cloud.style.cssText = `
        width: ${size}px;
        height: ${size * 0.52}px;
        left: 0;
        top: 0;
        background: ${cloudBg};
        filter: blur(${cfg.blur}px);
        box-shadow: ${size * 0.18}px ${size * 0.1}px ${size * 0.38}px rgba(255,255,255,0.05);
        animation: ${cfg.speedKey} cubic-bezier(0.4, 0, 0.6, 1) infinite;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${cfg.opacity};
      `;
      outer.appendChild(cloud);
      container.appendChild(outer);
    }
  }
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
  wind: number;
  layer: number;
  phase: number;
}

/** 控件顶边碰撞区：雨滴 y 穿过 top 且 x 在 [left, right] 时触发水花 */
interface SplashZone {
  top: number;
  left: number;
  right: number;
}

/** 单个水花：从 life 0 到 maxLife 扩散后消失 */
interface Splash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  opacity: number;
  rays: number;
}

const SPLASH_ZONE_SELECTOR = ".card-base, .btn-card, [class*='float-panel']";
const SPLASH_ZONE_MIN_WIDTH = 40;
const SPLASH_RAY_COUNT = 5;
const SPLASH_MAX_LIFE = 22;
const SPLASHES_PER_FRAME = 4;
const ZONE_UPDATE_INTERVAL_FRAMES = 45;

function getSplashZones(): SplashZone[] {
  if (typeof document === "undefined") return [];
  const zones: SplashZone[] = [];
  try {
    const els = document.querySelectorAll(SPLASH_ZONE_SELECTOR);
    for (let i = 0; i < els.length; i++) {
      const r = (els[i] as HTMLElement).getBoundingClientRect();
      if (r.width < SPLASH_ZONE_MIN_WIDTH || r.height < 4) continue;
      zones.push({
        top: r.top,
        left: r.left,
        right: r.right,
      });
    }
  } catch {
    /* ignore */
  }
  return zones;
}

function renderRain(): void {
  if (!container || isDestroyed) return;

  const wrap = document.createElement("div");
  wrap.className = "weather-layer";
  wrap.style.cssText = "position: absolute; inset: 0;";

  const canvasBack = document.createElement("canvas");
  canvasBack.className = "weather-rain-canvas weather-layer weather-rain-back";
  canvasBack.setAttribute("aria-hidden", "true");
  canvasBack.style.display = "block";
  wrap.appendChild(canvasBack);

  const canvasFront = document.createElement("canvas");
  canvasFront.className = "weather-rain-canvas weather-layer weather-rain-front";
  canvasFront.setAttribute("aria-hidden", "true");
  canvasFront.style.display = "block";
  wrap.appendChild(canvasFront);

  container.appendChild(wrap);

  const ctxBack = canvasBack.getContext("2d");
  const ctxFront = canvasFront.getContext("2d");
  if (!ctxBack || !ctxFront) return;

  const reduced = prefersReducedMotion();
  const dropCount = Math.min(
    MAX_RAIN_DROPS,
    Math.floor((window.innerWidth * window.innerHeight) / 4500) * (reduced ? REDUCED_MOTION_FACTOR : 1)
  );

  const layers: RainDrop[][] = [[], [], []];
  const layerConfig = [
    { lenMin: 6, lenMax: 12, speedMin: 2, speedMax: 5, opacityMin: 0.07, opacityMax: 0.16, wind: 0.12 },
    { lenMin: 10, lenMax: 18, speedMin: 4, speedMax: 8, opacityMin: 0.1, opacityMax: 0.24, wind: 0.3 },
    { lenMin: 14, lenMax: 24, speedMin: 5.5, speedMax: 11, opacityMin: 0.15, opacityMax: 0.32, wind: 0.45 },
  ];
  const perLayer = Math.max(1, Math.floor(dropCount / 3));

  for (let L = 0; L < 3; L++) {
    const c = layerConfig[L];
    for (let i = 0; i < perLayer; i++) {
      layers[L].push({
        x: Math.random() * (window.innerWidth + 100) - 50,
        y: Math.random() * (window.innerHeight + 50) - 50,
        len: c.lenMin + Math.random() * (c.lenMax - c.lenMin),
        speed: c.speedMin + Math.random() * (c.speedMax - c.speedMin),
        opacity: c.opacityMin + Math.random() * (c.opacityMax - c.opacityMin),
        wind: c.wind,
        layer: L,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const backDrops = layers[0];
  const frontDrops = layers[1].concat(layers[2]);
  const splashes: Splash[] = [];
  let splashZones: SplashZone[] = getSplashZones();
  let frameCount = 0;
  let lastWidth = 0;
  let lastHeight = 0;

  const resize = () => {
    if (isDestroyed || !wrap.parentNode) return;
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    if (w === lastWidth && h === lastHeight) return;
    lastWidth = w;
    lastHeight = h;
    canvasBack.width = w;
    canvasBack.height = h;
    canvasFront.width = w;
    canvasFront.height = h;
    for (const d of backDrops.concat(frontDrops)) {
      if (d.x > w) d.x = d.x % w;
      if (d.x < 0) d.x = w + d.x;
      if (d.y > h) d.y = -d.len;
      if (d.y < -d.len) d.y = h + d.y;
    }
  };
  rainResize = resize;
  resize();
  window.addEventListener("resize", rainResize);

  const isDark = document.documentElement.classList.contains("dark");
  const strokeBack = isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.3)";
  const strokeFront = isDark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.38)";

  const drawLayer = (ctx: CanvasRenderingContext2D, drops: RainDrop[], strokeStyle: string) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (w <= 0 || h <= 0) return;
    ctx.clearRect(0, 0, w, h);
    const time = performance.now() * 0.002;
    for (const d of drops) {
      const wobble = Math.sin(time + d.phase) * 0.8;
      const x1 = d.x;
      const y1 = d.y;
      const x2 = d.x + d.wind + wobble;
      const y2 = d.y + d.len;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeStyle;
      ctx.globalAlpha = d.opacity;
      ctx.lineWidth = 0.9;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const trySplash = (x: number, prevY: number, currY: number): boolean => {
    for (const z of splashZones) {
      if (currY < z.top || prevY >= z.top) continue;
      if (x < z.left || x > z.right) continue;
      if (splashes.length >= 48) return false;
      splashes.push({
        x,
        y: z.top,
        life: 0,
        maxLife: SPLASH_MAX_LIFE,
        opacity: 0.28 + Math.random() * 0.2,
        rays: SPLASH_RAY_COUNT + Math.floor(Math.random() * 2),
      });
      return true;
    }
    return false;
  };

  const drawSplashes = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (w <= 0 || h <= 0) return;
    const isDark = document.documentElement.classList.contains("dark");
    const stroke = isDark ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.6)";
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      const t = s.life / s.maxLife;
      const easeOut = 1 - Math.pow(1 - t, 1.6);
      const length = 2 + easeOut * 14;
      const alpha = Math.pow(1 - t, 1.3) * s.opacity;
      ctx.strokeStyle = stroke;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (let r = 0; r < s.rays; r++) {
        const angle = -Math.PI * 0.28 - (r / Math.max(1, s.rays - 1)) * Math.PI * 0.6 + (Math.random() - 0.5) * 0.35;
        const ex = s.x + Math.cos(angle) * length * (0.55 + Math.random() * 0.45);
        const ey = s.y + Math.sin(angle) * length * 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      s.life++;
      if (s.life >= s.maxLife) splashes.splice(i, 1);
    }
    ctx.globalAlpha = 1;
  };

  const animate = () => {
    if (isDestroyed || !container?.contains(wrap) || !ctxBack || !ctxFront) {
      rainAnimationId = null;
      return;
    }
    const w = canvasBack.width;
    const h = canvasBack.height;
    if (w <= 0 || h <= 0) {
      rainAnimationId = requestAnimationFrame(animate);
      return;
    }
    frameCount++;
    if (frameCount % ZONE_UPDATE_INTERVAL_FRAMES === 0) splashZones = getSplashZones();

    for (const d of backDrops) {
      d.y += d.speed;
      d.x += d.wind * 0.6;
      if (d.y > h) d.y = -d.len;
      if (d.y < -d.len) d.y = h + d.y;
      if (d.x > w + 10) d.x = -10;
      if (d.x < -10) d.x = w + 10;
    }
    let added = 0;
    for (const d of frontDrops) {
      const prevY = d.y;
      d.y += d.speed;
      d.x += d.wind * 0.6;
      if (added < SPLASHES_PER_FRAME && trySplash(d.x, prevY, d.y)) added++;
      if (d.y > h) d.y = -d.len;
      if (d.y < -d.len) d.y = h + d.y;
      if (d.x > w + 10) d.x = -10;
      if (d.x < -10) d.x = w + 10;
    }
    drawLayer(ctxBack, backDrops, strokeBack);
    drawLayer(ctxFront, frontDrops, strokeFront);
    drawSplashes(ctxFront);
    rainAnimationId = requestAnimationFrame(animate);
  };
  rainAnimationId = requestAnimationFrame(animate);
}

function runTransition(toType: WeatherType): void {
  const el = getContainer();
  if (!el) return;
  el.style.opacity = "0";
  if (transitionTimeoutId != null) clearTimeout(transitionTimeoutId);
  transitionTimeoutId = setTimeout(() => {
    transitionTimeoutId = null;
    clearEffect();
    container = getContainer();
    if (!container) return;
    isDestroyed = false;
    currentType = toType;
    container.classList.add(`weather-${toType}`);
    container.style.opacity = "0";
    injectGlobalStyles();
    if (toType === "sunny") renderSunny();
    else if (toType === "cloudy") renderCloudy();
    else if (toType === "rain") renderRain();
    requestAnimationFrame(() => {
      if (container) container.style.opacity = "1";
    });
  }, TRANSITION_MS);
}

function applyWeather(type: WeatherType): void {
  if (transitionTimeoutId != null) {
    clearTimeout(transitionTimeoutId);
    transitionTimeoutId = null;
  }
  clearEffect();
  safeApply(type);
}

export function getWeatherType(): WeatherType {
  return currentType;
}

export function setWeatherType(type: WeatherType): void {
  const t: WeatherType = type === "sunny" || type === "cloudy" || type === "rain" ? type : "sunny";
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
  runTransition(t);
}

export function initWeatherEffect(defaultType?: WeatherType): void {
  if (typeof document === "undefined") return;
  let type: WeatherType = "sunny";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "sunny" || stored === "cloudy" || stored === "rain") type = stored;
    else if (defaultType === "sunny" || defaultType === "cloudy" || defaultType === "rain") type = defaultType;
  } catch {
    if (defaultType === "sunny" || defaultType === "cloudy" || defaultType === "rain") type = defaultType;
  }
  applyWeather(type);
}

export function destroyWeatherEffect(): void {
  clearEffect();
  container = null;
  currentType = "sunny";
}
