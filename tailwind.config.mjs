// tailwind.config.mjs
import typography from '@tailwindcss/typography';
/** @type {import('tailwindcss').Config} */
export default {
    // 指摘の通り、最新推奨の 'selector' 戦略に変更
    // darkMode: 'selector',
    darkMode: 'class',

    // contentパスも念のため確認・統一
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        typography(),
    ],
}