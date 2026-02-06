import "../../styles/display-settings.styl";
import { useEffect, useState } from "preact/hooks";
import {
  getDefaultHue,
  getHue,
  setHue as setShue,
  getRainbowMode,
  setRainbowMode as setRMode,
  getRainbowSpeed,
  setRainbowSpeed as setRSpeed,
  getBgBlur,
  setBgBlur as setBBlur,
} from "../../utils/setting-utils";

export function DisplaySettings() {
  const [hue, setHue] = useState(getHue());
  const [rainbowMode, setRainbowMode] = useState(getRainbowMode());
  const [rainbowSpeed, setRainbowSpeed] = useState(getRainbowSpeed());
  const [bgBlur, setBgBlur] = useState(getBgBlur());

  const defaultHue = getDefaultHue();

  function resetHue() {
    setHue(defaultHue);
  }

  function toggleRainbow() {
    const next = !rainbowMode;
    setRainbowMode(next);
    setRMode(next);
    if (next) {
      setRSpeed(rainbowSpeed);
    } else {
      setShue(hue); // restore static hue
    }
  }

  // 监听 hue 的变化
  useEffect(() => {
    if (!rainbowMode) {
      setShue(hue);
    }
  }, [hue, rainbowMode]);

  // 监听 speed 变化
  useEffect(() => {
    if (rainbowMode) {
      setRSpeed(rainbowSpeed);
    }
  }, [rainbowSpeed, rainbowMode]);

  // 监听 blur 变化
  useEffect(() => {
    setBBlur(bgBlur);
  }, [bgBlur]);

  return (
    <>
      {/* Theme Color */}
      <div className="mb-3 flex flex-row items-center justify-between gap-2">
        <div className="relative ml-3 flex gap-2 text-lg font-bold text-neutral-900 transition before:absolute before:top-[0.33rem] before:-left-3 before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100">
          主题色调
          <button
            aria-label="Reset to Default"
            className={`btn-regular flex h-7 w-7 items-center justify-center rounded-md transition active:scale-90 ${
              hue === defaultHue ? "pointer-events-none opacity-0" : ""
            }`}
            onClick={resetHue}
          >
            <div className="flex items-center justify-center text-[var(--btn-content)]">
              <span className="icon-[material-symbols--device-reset] text-[1.3rem]"></span>
            </div>
          </button>
        </div>
        <div className="flex gap-1">
          <div className="flex h-7 w-10 items-center justify-center rounded-md bg-[var(--btn-regular-bg)] text-sm font-bold text-[var(--btn-content)] transition">
            {hue}
          </div>
        </div>
      </div>
      <div className="h-6 w-full rounded bg-[oklch(0.80_0.10_0)] px-1 select-none dark:bg-[oklch(0.70_0.10_0)]">
        <input
          aria-label="Color Picker"
          type="range"
          min="0"
          max="360"
          value={hue}
          onInput={(e) => setHue(Number((e.target as HTMLInputElement).value))}
          className="slider"
          id="colorSlider"
          step="5"
          style="width: 100%"
        />
      </div>

      {/* Rainbow Mode */}
      <div className="mt-4 mb-3 flex flex-row items-center justify-between gap-2">
        <div className="relative ml-3 text-lg font-bold text-neutral-900 transition before:absolute before:top-[0.33rem] before:-left-3 before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100">
          彩虹模式
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={rainbowMode}
            onChange={toggleRainbow}
            className="peer sr-only"
            aria-label="Rainbow Mode"
          />
          <div className="h-6 w-11 rounded-full bg-[var(--btn-regular-bg)] transition after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-full dark:after:bg-neutral-300"></div>
        </label>
      </div>

      {/* Rainbow Speed (shown only when rainbow is on) */}
      {rainbowMode && (
        <>
          <div className="mb-2 flex flex-row items-center justify-between gap-2">
            <div className="relative ml-3 text-lg font-bold text-neutral-900 transition before:absolute before:top-[0.33rem] before:-left-3 before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100">
              变换速率
            </div>
            <div className="flex h-7 w-10 items-center justify-center rounded-md bg-[var(--btn-regular-bg)] text-sm font-bold text-[var(--btn-content)] transition">
              {rainbowSpeed}
            </div>
          </div>
          <div className="h-6 w-full rounded bg-[var(--btn-regular-bg)] select-none overflow-hidden">
            <input
              aria-label="Rainbow Speed"
              type="range"
              min="1"
              max="100"
              value={rainbowSpeed}
              onInput={(e) => setRainbowSpeed(Number((e.target as HTMLInputElement).value))}
              className="slider"
              step="1"
              style="width: 100%"
            />
          </div>
        </>
      )}

      {/* Background Blur */}
      <div className="mt-4 mb-2 flex flex-row items-center justify-between gap-2">
        <div className="relative ml-3 text-lg font-bold text-neutral-900 transition before:absolute before:top-[0.33rem] before:-left-3 before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100">
          背景模糊
        </div>
        <div className="flex h-7 w-10 items-center justify-center rounded-md bg-[var(--btn-regular-bg)] text-sm font-bold text-[var(--btn-content)] transition">
          {bgBlur}
        </div>
      </div>
      <div className="h-6 w-full rounded bg-[var(--btn-regular-bg)] select-none overflow-hidden">
        <input
          aria-label="Background Blur"
          type="range"
          min="0"
          max="20"
          value={bgBlur}
          onInput={(e) => setBgBlur(Number((e.target as HTMLInputElement).value))}
          className="slider"
          step="1"
          style="width: 100%"
        />
      </div>
    </>
  );
}
