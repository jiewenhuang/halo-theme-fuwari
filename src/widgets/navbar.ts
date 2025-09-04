function switchTheme() {
  // if (localStorage.theme === "dark") {
  //   document.documentElement.classList.remove("dark");
  //   localStorage.theme = "light";
  // } else {
  //   document.documentElement.classList.add("dark");
  //   localStorage.theme = "dark";
  // }
}

function loadButtonScript() {
  const switchBtn = document.getElementById("scheme-switch");
  if (switchBtn) {
    switchBtn.onclick = function () {
      switchTheme();
    };
  }

  const settingBtn = document.getElementById("display-settings-switch");
  if (settingBtn) {
    settingBtn.onclick = function () {
      const settingPanel = document.getElementById("display-setting");
      if (settingPanel) {
        settingPanel.classList.toggle("float-panel-closed");
      }
    };
  }

  const menuBtn = document.getElementById("nav-menu-switch");
  if (menuBtn) {
    menuBtn.onclick = function () {
      const menuPanel = document.getElementById("nav-menu-panel");
      if (menuPanel) {
        menuPanel.classList.toggle("float-panel-closed");
      }
    };
  }
}

export { loadButtonScript };
