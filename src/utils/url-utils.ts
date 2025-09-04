export function pathsEqual(path1: string, path2: string) {
  const normalizedPath1 = path1.replace(/^\/|\/$/g, "").toLowerCase();
  const normalizedPath2 = path2.replace(/^\/|\/$/g, "").toLowerCase();
  return normalizedPath1 === normalizedPath2;
}

function joinUrl(...parts: string[]): string {
  const joined = parts.join("/");
  return joined.replace(/\/+/g, "/");
}

export function url(path: string) {
  return joinUrl("", getCurrentUrl(), path);
}
// 获取当前页面的url的
export function getCurrentUrl() {
  return window.location.origin;
}
