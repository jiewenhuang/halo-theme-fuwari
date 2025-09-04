import "../../styles/display-settings.styl";
import { useEffect, useState } from "preact/hooks";
import { getDefaultHue, getHue, setHue as setShue } from "../../utils/setting-utils";

export function DisplaySettings() {
  const [hue, setHue] = useState(getHue());

  const defaultHue = getDefaultHue();

  function resetHue() {
    setHue(defaultHue);
  }
  // 监听 hue 的变化
  useEffect(() => {
    setShue(hue);
  }, [hue]);
  return (
    <>
      <div className="mb-3 flex flex-row items-center justify-between gap-2">
        <div className="relative ml-3 flex gap-2 text-lg font-bold text-neutral-900 transition before:absolute before:top-[0.33rem] before:-left-3 before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100">
          Theme Color
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
          <div
            id="hueValue"
            className="flex h-7 w-10 items-center justify-center rounded-md bg-[var(--btn-regular-bg)] text-sm font-bold text-[var(--btn-content)] transition"
          >
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
    </>
  );
}
