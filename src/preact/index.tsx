import { render } from "preact";
import { Counter } from "./components/Counter";
import { Search } from "./components/Search";
import { DisplaySettings } from "./components/DisplaySettings";
import { Toc } from "./components/Toc";

export function mountCounter(container: HTMLElement) {
  render(<Counter />, container);
}
export function mountSearch(container: HTMLElement) {
  render(<Search />, container);
}

export function mountDisplaySettings(container: HTMLElement) {
  render(<DisplaySettings />, container);
}
export function mountToc(container: HTMLElement) {
  render(<Toc />, container);
}
