import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "../constants/constants";

export interface ThemeConfig {
  base: Base;
  style: Style;
  sidebar: Sidebar;
  profile: Profile;
  post: Post;
  beian: Beian;
  development: Development;
}

export interface Base {
  themeColor: ThemeColor;
  banner: Banner;
  menu: string;
}

export interface ThemeColor {
  hue: number;
  fixed: boolean;
}

export interface Banner {
  enable: boolean;
  src: string;
  position: string;
  credit: Credit;
}

export interface Credit {
  enable: boolean;
  text: string;
  url: string;
}

export interface Style {
  color_scheme: string;
  enable_change_color_scheme: boolean;
}

export interface Sidebar {
  widgets: Widget[];
}

export interface Widget {
  value: string;
  html?: string;
}

export interface Profile {
  name: string;
  bio: string;
  avatar: string;
  enable_profile: boolean;
  url: string;
  social_media: SocialMedum[];
}

export interface SocialMedum {
  icon: string;
  url: string;
  text?: string;
  url_type: string;
  name?: string;
  custom_icon?: string;
}

export interface Post {
  license: License;
  content_theme: string;
  enable_toc: boolean;
  toc_depth: number;
  content_size: string;
}

export interface License {
  enable: boolean;
  name: string;
  url: string;
}

export interface Beian {
  gongan_link: string;
  icp_link: string;
  gongan_text: string;
  icp_text: string;
}

export interface Development {
  enabled: boolean;
}

export type LIGHT_DARK_MODE =
  | typeof LIGHT_MODE
  | typeof DARK_MODE
  | typeof AUTO_MODE;
