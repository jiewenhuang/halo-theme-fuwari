export default () => ({
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
  get currentValue() {
    // Get current color scheme from localStorage or default
    const stored = localStorage.getItem("color-scheme-fuwari");
    if (stored) return stored;

    // Fallback to checking the document classes to determine current theme
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return "auto";
  },
  set currentValue(value) {
    // This setter will be called when the template updates currentValue
    // The actual theme setting is handled by main.setColorScheme in the template
    localStorage.setItem("color-scheme-fuwari", value);
  },
  get colorScheme() {
    return this.colorSchemes.find((x) => x.value === this.currentValue);
  },
});
