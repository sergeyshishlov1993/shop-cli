import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    content: [    './app/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
        './app/modules/**/components/**/*.{vue,js,ts}'
    ],
    theme: {
        extend: {}
    },
    plugins: []
}