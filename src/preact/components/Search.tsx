import { useState, useEffect, useRef } from "preact/hooks";
import type { SearchResult } from "../../types/search";

export function Search() {
  const [result, setResult] = useState<SearchResult>();
  const [keywordMobile, setKeywordMobile] = useState<string>("");
  const [keywordDesktop, setKeywordDesktop] = useState<string>("");
  const [panelVisible, setPanelVisible] = useState<boolean>(false);
  const debounceTimer = useRef<number>();
  const panelRef = useRef<HTMLDivElement>(null);

  const togglePanel = () => {
    const newVisible = !panelVisible;
    setPanelVisible(newVisible);

    // 如果打开面板时有搜索词但没有对应结果，重新搜索
    if (newVisible) {
      const currentKeyword = keywordMobile || keywordDesktop;
      if (currentKeyword && !result) {
        debouncedSearch(currentKeyword, false);
      }
    }
  };

  const setPanelVisibility = (show: boolean): void => {
    setPanelVisible(show);
  };

  const doSearch = async (keyword: string, isDesktop: boolean) => {
    if (!keyword.trim()) {
      if (isDesktop) {
        setPanelVisibility(false);
      }
      setResult(undefined);
      return;
    }

    try {
      const res = await fetch(`/apis/api.halo.run/v1alpha1/indices/-/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          highlightPostTag: "</mark>",
          highlightPreTag: "<mark>",
          keyword: keyword.trim(),
          limit: 10,
        }),
      });

      if (!res.ok) {
        throw new Error(`搜索请求失败: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);

      // 只有搜索有结果时才显示面板
      if (data && data.hits && data.hits.length > 0) {
        setPanelVisibility(true);
      } else if (isDesktop) {
        setPanelVisibility(false);
      }
    } catch (error) {
      console.error("搜索错误:", error);
      setResult(undefined);
      if (isDesktop) {
        setPanelVisibility(false);
      }
    }
  };

  // 防抖搜索
  const debouncedSearch = (keyword: string, isDesktop: boolean) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      doSearch(keyword, isDesktop);
    }, 300);
  };

  // 处理输入变化
  const handleInputChange = (value: string, isDesktop: boolean) => {
    if (isDesktop) {
      setKeywordDesktop(value);
    } else {
      setKeywordMobile(value);
    }
    debouncedSearch(value, isDesktop);
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent, isDesktop: boolean) => {
    if (e.key === "Escape") {
      setPanelVisible(false);
      if (isDesktop) {
        setKeywordDesktop("");
      } else {
        setKeywordMobile("");
      }
      setResult(undefined);
    }
  };

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // 只关闭面板，保持搜索状态
        setPanelVisible(false);
      }
    };

    if (panelVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelVisible]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <>
      {/*search bar for desktop view*/}
      <div
        id="search-bar"
        className="mr-2 hidden h-11 items-center rounded-lg bg-black/[0.04] transition-all focus-within:bg-black/[0.06] hover:bg-black/[0.06] lg:flex dark:bg-white/5 dark:focus-within:bg-white/10 dark:hover:bg-white/10"
      >
        <span className="icon-[tabler--search] pointer-events-none absolute my-auto ml-3 text-[1.25rem] text-black/30 transition dark:text-white/30"></span>
        <input
          placeholder="搜索文章..."
          value={keywordDesktop}
          onInput={(e) => handleInputChange((e.target as HTMLInputElement).value, true)}
          onKeyDown={(e) => handleKeyDown(e, true)}
          onFocus={() => {
            // 如果有搜索结果，直接显示面板
            if (result && result.hits.length > 0) {
              setPanelVisibility(true);
            }
            // 如果有关键词但没有结果，重新搜索
            else if (keywordDesktop && !result) {
              debouncedSearch(keywordDesktop, true);
            }
          }}
          className="h-full w-40 bg-transparent pl-10 text-sm text-black/50 outline-0 transition-all focus:w-60 active:w-60 dark:text-white/50"
        />
      </div>
      {/*toggle btn for phone/tablet view*/}
      <button
        onClick={togglePanel}
        aria-label="Search Panel"
        id="search-switch"
        className="btn-plain scale-animation h-11 w-11 rounded-lg active:scale-90 lg:!hidden"
      >
        <span className="icon-[tabler--search] text-[1.25rem]"></span>
      </button>

      {/*search panel*/}
      <div
        ref={panelRef}
        id="search-panel"
        className={`float-panel search-panel absolute top-20 right-4 left-4 overflow-y-auto rounded-2xl p-2 shadow-2xl md:left-[unset] md:w-[30rem] ${panelVisible ? "" : "float-panel-closed"}`}
      >
        {/*search bar inside panel for phone/tablet*/}
        <div
          id="search-bar-inside"
          className="relative flex h-11 items-center rounded-xl bg-black/[0.04] transition-all focus-within:bg-black/[0.06] hover:bg-black/[0.06] lg:hidden dark:bg-white/5 dark:focus-within:bg-white/10 dark:hover:bg-white/10"
        >
          <span className="icon-[tabler--search] pointer-events-none absolute my-auto ml-3 text-[1.25rem] text-black/30 transition dark:text-white/30"></span>
          <input
            placeholder="搜索文章..."
            value={keywordMobile}
            onInput={(e) => handleInputChange((e.target as HTMLInputElement).value, false)}
            onKeyDown={(e) => handleKeyDown(e, false)}
            className="absolute inset-0 bg-transparent pl-10 text-sm text-black/50 outline-0 focus:w-60 dark:text-white/50"
          />
        </div>

        {/*search results*/}
        {result && result.hits.length > 0 && (
          <div className="mt-2">
            {result.hits.map((item, index) => (
              <a
                key={index}
                href={item.permalink}
                className="group block rounded-xl px-3 py-2 text-lg transition hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]"
                onClick={() => setPanelVisible(false)}
              >
                <div className="text-90 inline-flex font-bold transition group-hover:text-[var(--primary)]">
                  <span dangerouslySetInnerHTML={{ __html: item.title || "无标题" }}></span>
                  <span className="icon-[tabler--chevron-right] my-auto translate-x-1 text-[1rem] font-bold text-[var(--primary)] transition"></span>
                </div>
                <div
                  className="text-50 text-sm transition"
                  dangerouslySetInnerHTML={{ __html: item.description || "无描述" }}
                ></div>
              </a>
            ))}
          </div>
        )}

        {/*no results*/}
        {result && result.hits.length === 0 && (keywordMobile || keywordDesktop) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="icon-[tabler--search-off] mb-2 text-4xl text-black/20 dark:text-white/20"></span>
            <p className="text-sm text-black/50 dark:text-white/50">未找到相关文章</p>
            <p className="mt-1 text-xs text-black/30 dark:text-white/30">尝试使用不同的关键词搜索</p>
          </div>
        )}

        {/*search tips*/}
        {!result && !keywordMobile && !keywordDesktop && panelVisible && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="icon-[tabler--search] mb-2 text-4xl text-black/20 dark:text-white/20"></span>
            <p className="text-sm text-black/50 dark:text-white/50">输入关键词开始搜索</p>
            <p className="mt-1 text-xs text-black/30 dark:text-white/30">支持搜索文章标题和内容</p>
          </div>
        )}
      </div>
    </>
  );
}
