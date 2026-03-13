export default () => ({
  // Alpine.js 内部状态变量
  currentValue: localStorage.getItem("color-scheme-fuwari") || "auto",

  colorSchemes: [
    {
      label: window.i18nResources["jsModule.colorSchemeSwitcher.dark"],
      value: "dark",
      icon: "icon-[material-symbols--moon-stars-outline-rounded]",
    },
    {
      label: window.i18nResources["jsModule.colorSchemeSwitcher.light"],
      value: "light",
      icon: "icon-[material-symbols--sunny-outline-rounded]",
    },
    {
      label: window.i18nResources["jsModule.colorSchemeSwitcher.auto"],
      value: "auto",
      icon: "icon-[material-symbols--radio-button-partial-outline]",
    },
  ],

  get colorScheme() {
    return this.colorSchemes.find((x) => x.value === this.currentValue);
  },

  // 切换主题的方法
  switchTheme: function (value: any) {
    // 更新内部状态
    this.currentValue = value;
    // 调用主题切换函数
    window.fuwari.setColorScheme(value, true);
  },

  // 循环切换到下一个主题（用于移动端）
  toggleNextTheme: function () {
    const values = this.colorSchemes.map((s) => s.value);
    const currentIndex = values.indexOf(this.currentValue);
    const nextIndex = (currentIndex + 1) % values.length;
    const nextValue = values[nextIndex];
    this.switchTheme(nextValue);
  },
});
