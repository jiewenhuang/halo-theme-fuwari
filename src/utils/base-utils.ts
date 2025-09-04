export function setClickOutsideToClose(panel: string, ignores: string[]) {
  document.addEventListener("click", (event) => {
    let panelDom = document.getElementById(panel);
    let tDom = event.target;
    if (!(tDom instanceof Node)) return; // Ensure the event target is an HTML Node
    for (let ig of ignores) {
      let ie = document.getElementById(ig);
      if (ie == tDom || ie?.contains(tDom)) {
        return;
      }
    }
    panelDom!.classList.add("float-panel-closed");
  });
}
