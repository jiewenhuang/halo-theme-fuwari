/**
 * Liquid Glass Effect - only on navbar, one glass with follow effect (hover nav link = glass follows)
 * Power by big ***z
 */

function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x: number, y: number): { type: string; x: number; y: number } {
  return { type: "t", x, y };
}

function generateId(): string {
  return "liquid-glass-" + Math.random().toString(36).substr(2, 9);
}

interface ShaderOptions {
  width?: number;
  height?: number;
  /** When set, glass is attached to this element (no drag, fills element, pointer-events: none). */
  anchorElement?: HTMLElement;
  /** When true, mouse position is lerped toward followTarget each frame (for navbar follow effect). */
  useFollowTarget?: boolean;
  fragment?: (uv: { x: number; y: number }, mouse: { x: number; y: number }) => { type: string; x: number; y: number };
}

/** Fragment: displacement follows mouse/followTarget (lens effect at that point). */
const NAVBAR_FOLLOW_FRAGMENT = (uv: { x: number; y: number }, mouse: { x: number; y: number }) => {
  const dx = uv.x - mouse.x;
  const dy = uv.y - mouse.y;
  const dist = length(dx, dy);
  const pull = smoothStep(0.5, 0.1, dist);
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const edge = roundedRectSDF(ix, iy, 0.45, 0.45, 0.5);
  const edgeMask = smoothStep(0.02, 0, edge);
  const displace = pull * edgeMask * 0.08;
  return texture(uv.x + dx * displace, uv.y + dy * displace);
};

class Shader {
  width: number;
  height: number;
  fragment: (uv: { x: number; y: number }, mouse: { x: number; y: number }) => { type: string; x: number; y: number };
  canvasDPI: number;
  id: string;
  offset: number;
  mouse: { x: number; y: number };
  followTarget: { x: number; y: number };
  useFollowTarget: boolean;
  mouseUsed: boolean;
  anchorElement?: HTMLElement;
  container!: HTMLDivElement;
  svg!: SVGElement;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  feImage!: SVGElement;
  feDisplacementMap!: SVGElement;
  private resizeObserver: ResizeObserver | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private rafId: number | null = null;
  private readonly LERP = 0.12;
  private _cleanups: Array<() => void> = [];
  private _destroyed = false;

  constructor(options: ShaderOptions = {}) {
    this.width = options.width ?? 300;
    this.height = options.height ?? 200;
    this.anchorElement = options.anchorElement;
    this.useFollowTarget = options.useFollowTarget ?? false;
    this.fragment = options.fragment ?? NAVBAR_FOLLOW_FRAGMENT;
    this.canvasDPI = 1;
    this.id = generateId();
    this.offset = 10;
    this.mouse = { x: 0.5, y: 0.5 };
    this.followTarget = { x: 0.5, y: 0.5 };
    this.mouseUsed = false;
    this.createElement();
    this.setupEventListeners();
    this.updateShader();
    if (this.useFollowTarget) this.startFollowLoop();
  }

  setFollowTarget(x: number, y: number): void {
    if (this._destroyed) return;
    this.followTarget.x = Math.max(0, Math.min(1, x));
    this.followTarget.y = Math.max(0, Math.min(1, y));
  }

  addCleanup(fn: () => void): void {
    this._cleanups.push(fn);
  }

  private startFollowLoop(): void {
    const tick = () => {
      this.mouse.x += (this.followTarget.x - this.mouse.x) * this.LERP;
      this.mouse.y += (this.followTarget.y - this.mouse.y) * this.LERP;
      this.updateShader();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  createElement(): void {
    this.container = document.createElement("div");
    const isAttached = !!this.anchorElement;
    if (isAttached) {
      this.container.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: inherit;
        pointer-events: none;
        backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
        -webkit-backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
      `;
    } else {
      this.container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${this.width}px;
        height: ${this.height}px;
        overflow: hidden;
        border-radius: 150px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15);
        cursor: grab;
        backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
        z-index: 9999;
        pointer-events: auto;
      `;
    }

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.svg.setAttribute("width", "0");
    this.svg.setAttribute("height", "0");
    this.svg.style.cssText = "position: absolute; width: 0; height: 0; pointer-events: none;";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", `${this.id}_filter`);
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("colorInterpolationFilters", "sRGB");
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", String(Math.max(1, this.width)));
    filter.setAttribute("height", String(Math.max(1, this.height)));

    this.feImage = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
    this.feImage.setAttribute("id", `${this.id}_map`);
    this.feImage.setAttribute("width", String(Math.max(1, this.width)));
    this.feImage.setAttribute("height", String(Math.max(1, this.height)));

    this.feDisplacementMap = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
    this.feDisplacementMap.setAttribute("in", "SourceGraphic");
    this.feDisplacementMap.setAttribute("in2", `${this.id}_map`);
    this.feDisplacementMap.setAttribute("xChannelSelector", "R");
    this.feDisplacementMap.setAttribute("yChannelSelector", "G");

    filter.appendChild(this.feImage);
    filter.appendChild(this.feDisplacementMap);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    this.canvas = document.createElement("canvas");
    const w = Math.max(1, Math.round(this.width * this.canvasDPI));
    const h = Math.max(1, Math.round(this.height * this.canvasDPI));
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.display = "none";
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not available");
    this.context = ctx;
  }

  updateSize(): void {
    if (!this.anchorElement || this._destroyed) return;
    const rect = this.anchorElement.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.canvas.width = w * this.canvasDPI;
    this.canvas.height = h * this.canvasDPI;
    this.feImage.setAttribute("width", String(w));
    this.feImage.setAttribute("height", String(h));
    const filterEl = this.feImage.parentElement;
    if (filterEl) {
      filterEl.setAttribute("width", String(w));
      filterEl.setAttribute("height", String(h));
    }
    this.updateShader();
  }

  constrainPosition(x: number, y: number): { x: number; y: number } {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minX = this.offset;
    const maxX = viewportWidth - this.width - this.offset;
    const minY = this.offset;
    const maxY = viewportHeight - this.height - this.offset;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }

  setupEventListeners(): void {
    const isAttached = !!this.anchorElement;
    if (isAttached) {
      this.boundMouseMove = (e: MouseEvent) => {
        const rect = this.container.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        if (this.useFollowTarget) {
          this.setFollowTarget(x, y);
        } else {
          this.mouse.x = x;
          this.mouse.y = y;
          this.updateShader();
        }
      };
      document.addEventListener("mousemove", this.boundMouseMove);
      return;
    }
    let isDragging = false;
    let startX: number, startY: number, initialX: number, initialY: number;

    this.container.addEventListener("mousedown", (e: MouseEvent) => {
      isDragging = true;
      this.container.style.cursor = "grabbing";
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.container.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const constrained = this.constrainPosition(initialX + deltaX, initialY + deltaY);
        this.container.style.left = constrained.x + "px";
        this.container.style.top = constrained.y + "px";
        this.container.style.transform = "none";
      }
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = (e.clientY - rect.top) / rect.height;
      if (this.mouseUsed) this.updateShader();
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      this.container.style.cursor = "grab";
    });

    window.addEventListener("resize", () => {
      const rect = this.container.getBoundingClientRect();
      const constrained = this.constrainPosition(rect.left, rect.top);
      if (rect.left !== constrained.x || rect.top !== constrained.y) {
        this.container.style.left = constrained.x + "px";
        this.container.style.top = constrained.y + "px";
        this.container.style.transform = "none";
      }
    });
  }

  updateShader(): void {
    if (this._destroyed) return;
    const w = Math.max(1, Math.round(this.width * this.canvasDPI));
    const h = Math.max(1, Math.round(this.height * this.canvasDPI));
    if (w <= 0 || h <= 0) return;
    const mouseProxy = new Proxy(this.mouse, {
      get: (target, prop: string) => {
        this.mouseUsed = true;
        return (target as Record<string, number>)[prop];
      },
    });
    this.mouseUsed = false;

    const data = new Uint8ClampedArray(w * h * 4);
    let maxScale = 0;
    const rawValues: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = this.fragment({ x: x / w, y: y / h }, mouseProxy);
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.5;
    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5;
      const g = rawValues[index++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    this.context.putImageData(new ImageData(data, w, h), 0, 0);
    this.feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.canvas.toDataURL());
    this.feDisplacementMap.setAttribute("scale", String(maxScale / this.canvasDPI));
  }

  appendTo(parent: HTMLElement): void {
    if (!parent || this._destroyed) return;
    parent.appendChild(this.svg);
    if (this.anchorElement) {
      try {
        const style = window.getComputedStyle(this.anchorElement);
        if (style.position === "static") {
          this.anchorElement.style.position = "relative";
        }
      } catch {
        /* ignore */
      }
      this.anchorElement.appendChild(this.container);
      this.updateSize();
      try {
        this.resizeObserver = new ResizeObserver(() => this.updateSize());
        this.resizeObserver.observe(this.anchorElement);
      } catch {
        /* ResizeObserver not supported */
      }
    } else {
      parent.appendChild(this.container);
    }
  }

  destroy(): void {
    this._destroyed = true;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.boundMouseMove) {
      document.removeEventListener("mousemove", this.boundMouseMove);
      this.boundMouseMove = null;
    }
    if (this.resizeObserver && this.anchorElement) {
      try {
        this.resizeObserver.disconnect();
      } catch {
        /* ignore */
      }
      this.resizeObserver = null;
    }
    for (const fn of this._cleanups) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
    this._cleanups.length = 0;
    try {
      this.svg?.remove();
    } catch {
      /* ignore */
    }
    try {
      this.container?.remove();
    } catch {
      /* ignore */
    }
    try {
      this.canvas?.remove();
    } catch {
      /* ignore */
    }
  }
}

/** Navbar bar is the first .card-base inside #navbar (not float panels). */
function getNavbarCard(): HTMLElement | null {
  return document.querySelector("#navbar > .card-base") as HTMLElement | null;
}

function setupNavbarFollow(shader: Shader): () => void {
  const navbarCard = shader.anchorElement;
  if (!navbarCard || !shader.useFollowTarget) return () => {};
  const links = Array.from(navbarCard.querySelectorAll<HTMLElement>('a[href].btn-plain, a[href].scale-animation'));
  const enterHandlers: Array<(e: MouseEvent) => void> = [];
  links.forEach((el) => {
    const handler = () => {
      try {
        const r = el.getBoundingClientRect();
        const card = navbarCard.getBoundingClientRect();
        const cw = card.width || 1;
        const ch = card.height || 1;
        const x = (r.left - card.left + r.width / 2) / cw;
        const y = (r.top - card.top + r.height / 2) / ch;
        shader.setFollowTarget(x, y);
      } catch {
        /* ignore */
      }
    };
    enterHandlers.push(handler);
    el.addEventListener("mouseenter", handler);
  });
  const onLeave = () => shader.setFollowTarget(0.5, 0.5);
  navbarCard.addEventListener("mouseleave", onLeave);
  return () => {
    links.forEach((el, i) => el.removeEventListener("mouseenter", enterHandlers[i]));
    navbarCard.removeEventListener("mouseleave", onLeave);
  };
}

export function initLiquidGlass(): void {
  if (typeof window === "undefined") return;
  const win = window as unknown as { liquidGlassShaders?: Shader[] };
  if (win.liquidGlassShaders?.length) {
    win.liquidGlassShaders.forEach((s) => s.destroy());
    win.liquidGlassShaders = [];
  }
  const navbarCard = getNavbarCard();
  if (!navbarCard) return;
  const shader = new Shader({
    anchorElement: navbarCard,
    useFollowTarget: true,
    fragment: NAVBAR_FOLLOW_FRAGMENT,
  });
  const cleanupFollow = setupNavbarFollow(shader);
  if (cleanupFollow) shader.addCleanup(cleanupFollow);
  shader.appendTo(document.body);
  win.liquidGlassShaders = [shader];
}

export function destroyLiquidGlass(): void {
  const win = window as unknown as { liquidGlassShaders?: Shader[] };
  if (win.liquidGlassShaders?.length) {
    win.liquidGlassShaders.forEach((s) => s.destroy());
    win.liquidGlassShaders = [];
  }
}
