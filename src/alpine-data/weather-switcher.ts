export default () => ({
  currentValue: "sunny",
  init() {
    const type = (typeof window !== "undefined" && window.fuwari?.getWeatherType?.()) || "sunny";
    this.currentValue = type;
    // 若效果尚未初始化（容器为空），则补一次初始化，确保有天气显示
    if (typeof document !== "undefined") {
      const container = document.getElementById("weather-effect");
      if (container && !container.classList.contains("weather-sunny") && !container.classList.contains("weather-cloudy") && !container.classList.contains("weather-rain")) {
        window.fuwari?.setWeatherType?.(type);
      }
    }
  },
  weatherOptions: [
    { value: "sunny", label: "晴天", icon: "icon-[material-symbols--sunny-outline-rounded]" },
    { value: "cloudy", label: "多云", icon: "icon-[material-symbols--cloud-outline-rounded]" },
    { value: "rain", label: "下雨", icon: "icon-[material-symbols--water-drop-outline-rounded]" },
  ],
  get currentOption() {
    return this.weatherOptions.find((o) => o.value === this.currentValue) ?? this.weatherOptions[0];
  },
  switchWeather(value: string) {
    if (value === "sunny" || value === "cloudy" || value === "rain") {
      window.fuwari?.setWeatherType?.(value);
      this.currentValue = value;
    }
  },
});
