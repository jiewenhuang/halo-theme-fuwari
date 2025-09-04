import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "../constants/constants";

export interface ThemeConfig {
  post: Post;
  profile: Profile;
  base: Base;
  style: Style;
}

export interface Post {
  content_theme: string;
  content_size: string;
}

export interface Style {
  color_scheme: typeof LIGHT_MODE | typeof DARK_MODE | typeof AUTO_MODE;
  enable_change_color_scheme: boolean;
}
export interface Profile {
  name: string;
  bio: string;
  avatar: string;
  social_media: any[];
}

export interface Base {
  menu: string;
  banner: Banner;
  toc: Toc;
  themeColor: ThemeColor;
  menu_names: any[];
}

export interface Banner {
  position: string;
  credit: Credit;
  src: string;
  enable: boolean;
}

export interface Credit {
  enable: boolean;
  text: string;
}

export interface Toc {
  enable: boolean;
  max_depth: number;
}

export interface ThemeColor {
  hue: string;
  fixed: boolean;
}

export type LIGHT_DARK_MODE = typeof LIGHT_MODE | typeof DARK_MODE | typeof AUTO_MODE;
