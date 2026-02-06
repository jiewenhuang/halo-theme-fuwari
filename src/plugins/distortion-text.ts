/**
 * Mouse-driven text distortion effect (Canvas 2D)
 * Renders large text and distorts pixels near the cursor.
 */

export function initDistortionText(container: HTMLElement, text = "CANZ") {
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  if (!ctx) return;

  let W = 0;
  let H = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let targetX = -9999;
  let targetY = -9999;
  let imgData: ImageData | null = null;
  let originalData: Uint8ClampedArray | null = null;
  let raf = 0;
  let dpr = window.devicePixelRatio || 1;

  // Distortion params
  const RADIUS = 120;     // distortion radius (px)
  const STRENGTH = 60;    // max pixel shift
  const LERP = 0.12;      // mouse smoothing

  function resize() {
    const rect = container.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    W = Math.round(rect.width * dpr);
    H = Math.round(rect.height * dpr);
    canvas.width = W;
    canvas.height = H;
    renderBaseText();
  }

  function getTextColor(): string {
    // Match theme text color
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  }

  function renderBaseText() {
    ctx.clearRect(0, 0, W, H);

    const color = getTextColor();

    // Calculate font size to fill width nicely
    const fontSize = Math.min(W * 0.28, H * 0.85);
    ctx.font = `900 ${fontSize}px "Inter", "Roboto", "SF Pro Display", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, W / 2, H / 2);

    // Store original pixel data
    imgData = ctx.getImageData(0, 0, W, H);
    originalData = new Uint8ClampedArray(imgData.data);
  }

  function distort() {
    if (!imgData || !originalData) return;

    // Smooth mouse
    targetX += (mouseX * dpr - targetX) * LERP;
    targetY += (mouseY * dpr - targetY) * LERP;

    const data = imgData.data;
    const orig = originalData;
    const r = RADIUS * dpr;
    const r2 = r * r;
    const str = STRENGTH * dpr;

    // Reset to original
    data.set(orig);

    // Only process pixels within bounding box of distortion radius
    const cx = Math.round(targetX);
    const cy = Math.round(targetY);
    const x0 = Math.max(0, cx - Math.ceil(r) - Math.ceil(str));
    const x1 = Math.min(W - 1, cx + Math.ceil(r) + Math.ceil(str));
    const y0 = Math.max(0, cy - Math.ceil(r) - Math.ceil(str));
    const y1 = Math.min(H - 1, cy + Math.ceil(r) + Math.ceil(str));

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < r2) {
          // Distortion factor: strongest at center, zero at edge
          const dist = Math.sqrt(dist2);
          const factor = 1 - dist / r;
          // Smooth falloff (ease-out cubic)
          const smooth = factor * factor * (3 - 2 * factor);
          const shift = smooth * str;

          // Push pixels away from cursor (radial distortion)
          const angle = Math.atan2(dy, dx);
          const srcX = Math.round(x - Math.cos(angle) * shift);
          const srcY = Math.round(y - Math.sin(angle) * shift);

          if (srcX >= 0 && srcX < W && srcY >= 0 && srcY < H) {
            const dstIdx = (y * W + x) * 4;
            const srcIdx = (srcY * W + srcX) * 4;
            data[dstIdx] = orig[srcIdx];
            data[dstIdx + 1] = orig[srcIdx + 1];
            data[dstIdx + 2] = orig[srcIdx + 2];
            data[dstIdx + 3] = orig[srcIdx + 3];
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function loop() {
    distort();
    raf = requestAnimationFrame(loop);
  }

  // Events
  function onMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouseX = -9999;
    mouseY = -9999;
  }

  // Touch support
  function onTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
  }

  function onTouchEnd() {
    mouseX = -9999;
    mouseY = -9999;
  }

  container.addEventListener("mousemove", onMouseMove);
  container.addEventListener("mouseleave", onMouseLeave);
  container.addEventListener("touchmove", onTouchMove, { passive: true });
  container.addEventListener("touchend", onTouchEnd);

  // Theme change observer (light/dark)
  const observer = new MutationObserver(() => {
    renderBaseText();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // Resize
  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(container);

  // Init
  resize();
  loop();

  // Cleanup function
  return () => {
    cancelAnimationFrame(raf);
    container.removeEventListener("mousemove", onMouseMove);
    container.removeEventListener("mouseleave", onMouseLeave);
    container.removeEventListener("touchmove", onTouchMove);
    container.removeEventListener("touchend", onTouchEnd);
    observer.disconnect();
    resizeObserver.disconnect();
    canvas.remove();
  };
}
