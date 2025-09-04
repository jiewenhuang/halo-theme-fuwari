export default (selector = "#content") => ({
  wordCount: 0 as number,
  readingTime: 0 as number,
  chineseChars: 0 as number,
  englishWords: 0 as number,
  wordCountText: "",
  readingTimeText: "",
  locale: document.documentElement.lang || "en",

  init(): void {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) {
      this.wordCount = 0;
      this.readingTime = 0;
      return;
    }

    // 深拷贝 DOM，剔除不参与统计的内容
    const clonedNode = el.cloneNode(true);
    if (!(clonedNode instanceof Element)) return;

    clonedNode.querySelectorAll("script, style, code, pre, iframe").forEach((child) => child.remove());

    const rawText = (clonedNode.textContent ?? "").trim().replace(/\s+/g, " ");

    this.chineseChars = (rawText.match(/[\u4e00-\u9fa5]/g) || []).length;
    this.englishWords = (rawText.match(/\b[a-zA-Z]+\b/g) || []).length;

    this.wordCount = this.chineseChars + this.englishWords;
    this.readingTime = Math.ceil(this.chineseChars / 300 + this.englishWords / 200);
    this.readingTimeText = this.formatReadingTime();
    this.wordCountText = this.formatWordCount();
  },
  formatReadingTime(): string {
    const time = this.readingTime;
    switch (this.locale.toLowerCase()) {
      case "es":
        return `${time} minutos`;
      case "zh_TW":
        return `${time} 分鐘`;
      case "zh_CN":
        return `${time} 分钟`;
      case "en":
        return `${time} minutes`;
      default:
        return `${time} minutes`;
    }
  },
  formatWordCount(): string {
    const count = this.wordCount;
    switch (this.locale.toLowerCase()) {
      case "es":
        return `${count} palabras`;
      case "zh_TW":
        return `${count} 字`;
      case "zh_CN":
        return `${count} 字`;
      case "en":
        return `${count} words`;
      default:
        return `${count} words`;
    }
  },
});
