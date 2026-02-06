/**
 * Halo 内置访客统计
 * - 使用 POST /apis/api.halo.run/v1alpha1/trackers/counter 记录页面访问
 * - 使用 GET  /apis/api.halo.run/v1alpha1/stats/- 获取全站统计
 */

/** 记录当前页面的一次访问 */
export function trackPageVisit() {
  const el = document.getElementById("halo-counter-data");
  if (!el) return; // 不是可追踪的页面（首页、归档等不计数）

  const group = el.dataset.group;
  const name = el.dataset.name;
  const plural = el.dataset.plural;

  if (!group || !name || !plural) return;

  // 同一会话内同一页面只计数一次
  const key = `halo-visit-${plural}-${name}`;
  if (sessionStorage.getItem(key)) return;

  fetch("/apis/api.halo.run/v1alpha1/trackers/counter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      group,
      name,
      plural,
      hostname: window.location.hostname,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      referrer: document.referrer,
    }),
  })
    .then(() => {
      sessionStorage.setItem(key, "1");
    })
    .catch((err) => {
      console.warn("Visit tracking failed:", err);
    });
}

interface SiteStats {
  visit: number;
  post: number;
  comment: number;
  category: number;
}

/** 获取全站统计数据 */
async function fetchSiteStats(): Promise<SiteStats | null> {
  try {
    const res = await fetch("/apis/api.halo.run/v1alpha1/stats/-");
    if (!res.ok) return null;
    return (await res.json()) as SiteStats;
  } catch {
    return null;
  }
}

/** 在 #site-stats 元素中显示全站统计信息 */
export async function displaySiteStats() {
  const container = document.getElementById("site-stats");
  if (!container) return;

  const stats = await fetchSiteStats();
  if (!stats) return;

  const visit = typeof stats.visit === "number" ? stats.visit : 0;
  const post = typeof stats.post === "number" ? stats.post : 0;
  const comment = typeof stats.comment === "number" ? stats.comment : 0;
  container.innerHTML = `
    <span class="inline-flex items-center gap-1">
      <span class="icon-[material-symbols--visibility-outline-rounded] text-sm"></span>
      总访问 ${visit.toLocaleString()}
    </span>
    <span class="opacity-30">·</span>
    <span class="inline-flex items-center gap-1">
      <span class="icon-[material-symbols--article-outline-rounded] text-sm"></span>
      文章 ${post}
    </span>
    <span class="opacity-30">·</span>
    <span class="inline-flex items-center gap-1">
      <span class="icon-[material-symbols--chat-bubble-outline-rounded] text-sm"></span>
      评论 ${comment}
    </span>
  `;
}
