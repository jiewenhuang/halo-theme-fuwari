/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
import { addDynamicIconSelectors } from "@iconify/tailwind";

export default {
    content: ["./templates/**/*.html", "./src/main.ts", "./src/**/*.{js,jsx,svelte,ts,tsx}"],
    darkMode: "class", // allows toggling dark mode manually
    safelist: [
        // 社交媒体图标 - 从 settings.yaml 中的 social_media 配置提取
        "icon-[tabler--mail-filled]",
        "icon-[streamline-logos--wechat-logo-block]",
        "icon-[fa6-brands--qq]",
        "icon-[simple-icons--sinaweibo]",
        "icon-[ant-design--zhihu-circle-filled]",
        "icon-[streamline-logos--douban-logo-block]",
        "icon-[streamline-logos--bilibili-logo-block]",
        "icon-[streamline-logos--tiktok-logo-block]",
        "icon-[ic--baseline-telegram]",
        "icon-[ic--baseline-facebook]",
        "icon-[ant-design--instagram-filled]",
        "icon-[entypo-social--linkedin-with-circle]",
        "icon-[streamline-logos--x-twitter-logo-block]",
        "icon-[ant-design--slack-circle-filled]",
        "icon-[ic--baseline-discord]",
        "icon-[entypo-social--youtube-with-circle]",
        "icon-[ri--steam-fill]",
        "icon-[mdi--github]",
        "icon-[fa6-brands--square-gitlab]",
        "icon-[streamline-plump--rss-square-solid]",

        // 主题切换图标
        "icon-[material-symbols--moon-stars-outline-rounded]",
        "icon-[material-symbols--sunny-outline-rounded]",
        "icon-[material-symbols--radio-button-partial-outline]",

        // 界面图标 - 从模板中提取
        "icon-[tabler--smart-home]",
        "icon-[tabler--external-link]",
        "icon-[material-symbols--palette-outline]",
        "icon-[material-symbols--menu-rounded]",
        "icon-[material-symbols--chevron-right-rounded]",
        "icon-[material-symbols--chevron-left-rounded]",
        "icon-[material-symbols--copyright-outline-rounded]",
        "icon-[material-symbols--share-outline]",
        "icon-[material-symbols--notes-rounded]",
        "icon-[material-symbols--schedule-outline-rounded]",
        "icon-[fa6-brands--creative-commons]",
        "icon-[material-symbols--more-horiz]",
        "icon-[fa6-regular--address-card]",
        "icon-[material-symbols--keyboard-arrow-up-rounded]",
        "icon-[material-symbols--calendar-today-outline-rounded]",
        "icon-[material-symbols--edit-calendar-outline-rounded]",
        "icon-[material-symbols--book-2-outline-rounded]",
        "icon-[material-symbols--tag-rounded]",
        "icon-[material-symbols--readiness-score-outline-rounded]",
        "icon-[material-symbols--ar-stickers-outline]",
        "icon-[material-symbols--close-rounded]",

        // 音乐播放器图标
        "icon-[material-symbols--music-note-rounded]",
        "icon-[material-symbols--play-arrow-rounded]",
        "icon-[material-symbols--pause-rounded]",
        "icon-[material-symbols--skip-previous-rounded]",
        "icon-[material-symbols--skip-next-rounded]",
        "icon-[material-symbols--album]",

        // 访客统计图标
        "icon-[material-symbols--visibility-outline-rounded]",
        "icon-[material-symbols--article-outline-rounded]",
        "icon-[material-symbols--chat-bubble-outline-rounded]",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require("@tailwindcss/typography"), addDynamicIconSelectors()],
};