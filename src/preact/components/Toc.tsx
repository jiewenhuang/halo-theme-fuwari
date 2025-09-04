import { useEffect, useRef, useState } from "preact/hooks";

interface Heading {
  id: string;
  text: string;
  depth: number;
}

export function Toc() {
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const activeIndicatorRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [visibleMap, setVisibleMap] = useState<Map<string, boolean>>(new Map());

  const minDepth = Math.min(...headings.map((h) => h.depth), 6);
  let heading1Count = 1;

  // 1. 提取 #content 中的 h1~h4
  function extractHeadings() {
    const content = document.getElementById("content");
    if (!content) return [];

    const nodes = Array.from(content.querySelectorAll("h1, h2, h3, h4")) as HTMLHeadingElement[];
    const seenIds = new Set();
    return nodes.map((el) => {
      let id = el.id || el.textContent?.trim().replace(/\s+/g, "-") || "";
      let origId = id;
      let suffix = 1;
      while (seenIds.has(id)) {
        id = `${origId}-${suffix++}`;
      }
      el.id = id;
      seenIds.add(id);

      return {
        id,
        text: el.textContent?.trim() || "",
        depth: parseInt(el.tagName[1]),
      };
    });
  }

  // 2. IntersectionObserver 实现高亮
  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const newMap = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          newMap.set(id, entry.isIntersecting);
        }
        setVisibleMap(new Map(newMap));
      },
      { threshold: 0.1 },
    );

    for (const el of headingElements) observer.observe(el);

    return () => observer.disconnect();
  }, [headings]);

  // 3. 渲染后根据 visible 项更新 active-indicator 位置
  useEffect(() => {
    const container = tocWrapperRef.current;
    const indicator = activeIndicatorRef.current;
    if (!container || !indicator) return;

    const visibleEntries = Array.from(container.querySelectorAll(".visible")) as HTMLElement[];
    if (visibleEntries.length === 0) {
      indicator.classList.add("hidden");
      return;
    }

    const parentTop = container.getBoundingClientRect().top;
    const scrollTop = container.scrollTop;

    const top = visibleEntries[0].getBoundingClientRect().top - parentTop + scrollTop;
    const bottom = visibleEntries[visibleEntries.length - 1].getBoundingClientRect().bottom - parentTop + scrollTop;

    indicator.style.top = `${top}px`;
    indicator.style.height = `${bottom - top}px`;
    indicator.classList.remove("hidden");
  }, [visibleMap]);

  // 4. 初始化提取 + swup 页面更新支持
  useEffect(() => {
    const refresh = () => setHeadings(extractHeadings());
    refresh();
    document.addEventListener("swup:contentReplaced", refresh);
    return () => document.removeEventListener("swup:contentReplaced", refresh);
  }, []);

  const removeTrailingHash = (text: string) => {
    const idx = text.lastIndexOf("#");
    return idx === text.length - 1 ? text.substring(0, idx) : text;
  };

  return (
    <div class="group relative" id="toc">
      <div id="toc-inner-wrapper" ref={tocWrapperRef} class="max-h-[calc(100vh-100px)] overflow-y-auto">
        {headings.map((heading) => {
          const isVisible = visibleMap.get(heading.id);
          const depthOffset = heading.depth - minDepth;

          let badge = null;
          if (depthOffset === 0) {
            badge = (
              <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--toc-badge-bg)] text-xs font-bold text-[var(--btn-content)] transition">
                {heading1Count++}
              </div>
            );
          } else if (depthOffset === 1) {
            badge = (
              <div class="ml-4 flex h-5 w-5 shrink-0 items-center justify-center transition">
                <div class="h-2 w-2 rounded-[0.1875rem] bg-[var(--toc-badge-bg)]"></div>
              </div>
            );
          } else {
            badge = (
              <div class="ml-8 flex h-5 w-5 shrink-0 items-center justify-center transition">
                <div class="h-1.5 w-1.5 rounded-sm bg-black/5 dark:bg-white/10"></div>
              </div>
            );
          }

          const textColor = depthOffset === 0 || depthOffset === 1 ? "text-50" : "text-30";

          return (
            <a
              href={`#${heading.id}`}
              class={`relative flex min-h-9 w-full gap-2 rounded-xl px-2 py-2 transition hover:bg-[var(--toc-btn-hover)] active:bg-[var(--toc-btn-active)] ${
                isVisible ? "visible" : ""
              }`}
            >
              {badge}
              <div class={`text-sm transition ${textColor}`}>{removeTrailingHash(heading.text)}</div>
            </a>
          );
        })}
      </div>
      <div
        id="active-indicator"
        ref={activeIndicatorRef}
        class={`absolute right-0 left-0 -z-10 hidden rounded-xl border-2 border-dashed border-[var(--toc-btn-hover)] bg-[var(--toc-btn-hover)] transition-all group-hover:border-[var(--toc-btn-active)] group-hover:bg-transparent`}
      ></div>
    </div>
  );
}
