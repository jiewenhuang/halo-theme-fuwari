import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "../constants/constants";

export interface ThemeConfig {
  post: Post;
  profile: Profile;
  base: Base;
  style: Style;
  development: Development;
  music?: MusicConfig;
  analytics?: AnalyticsConfig;
  navbar_behavior?: NavbarBehavior;
  appearance?: {
    notice?: NoticeConfig;
    background?: BackgroundConfig;
    effects?: {
      enable_flow_text?: boolean;
      flow_text?: string;
      enable_liquid_glass?: boolean;
      enable_weather?: boolean;
      weather_type?: "sunny" | "cloudy" | "rain";
    };
  };
  footer?: { beian?: BeianConfig; analytics?: AnalyticsConfig };
}

export interface NoticeConfig {
  enable: boolean;
  level: string;
  content: string;
}

export interface BackgroundConfig {
  enable: boolean;
  src: string;
  position: string;
  size: string;
  attachment: string;
  opacity: number;
}

export interface BeianConfig {
  icp_text: string;
  icp_link: string;
  gongan_text: string;
  gongan_link: string;
  div: string;
}

export interface AnalyticsConfig {
  enable: boolean;
  show_site_stats: boolean;
}

export interface MusicConfig {
  enable: boolean;
  server_url: string;
  username: string;
  password: string;
  mode: "random" | "playlist";
  playlist_id: string;
  song_count: number;
}

export interface Development {
  enabled: boolean;
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

export interface NavbarBehavior {
  mode: "transparent" | "hide_after";
  hide_after_seconds?: number;
}

export interface Base {
  menu: string;
  banner: Banner;
  toc: Toc;
  themeColor: ThemeColor;
  menu_names: any[];
  /** @deprecated 已移至顶级 themeConfig.navbar_behavior，保留仅为兼容旧配置 */
  navbar_behavior?: NavbarBehavior;
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
