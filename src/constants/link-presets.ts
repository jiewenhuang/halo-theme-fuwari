import { LinkPreset, type NavBarLink } from "../types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
  [LinkPreset.Home]: {
    name: "首页",
    url: "/",
  },
  [LinkPreset.About]: {
    name: "关于",
    url: "/about/",
  },
  [LinkPreset.Archive]: {
    name: "归档",
    url: "/archives/",
  },
};
