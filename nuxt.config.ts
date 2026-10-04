import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    srcDir: 'app/',

    future: {
        compatibilityVersion: 4,
    },

    modules: [
      '@pinia/nuxt',
      '@vueuse/nuxt',
      'nuxt-swiper',
      '@nuxt/icon',
        '@nuxtjs/device',
    ],

    css: [
        '~/assets/css/main.css',
    ],

    // Захищені сторінки рендеримо на клієнті: refresh-cookie має Path=/api/auth і на SSR сторінки не приходить,
    // тож відновити сесію після протухання access-токена можна лише в браузері.
    routeRules: {
        // CSP поки в Report-Only: порушення видно в консолі браузера, нічого не блокується.
        // Після перевірки GTM/Pixel/Instagram — перейменувати заголовок на Content-Security-Policy.
        '/**': {
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'Content-Security-Policy-Report-Only': [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' data: https://fonts.gstatic.com",
                    "img-src 'self' data: blob: https: http://localhost:9000",
                    "media-src 'self' blob: https: http://localhost:9000",
                    "connect-src 'self' https: ws:",
                    'frame-src https:',
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                    "object-src 'none'",
                ].join('; '),
            },
        },
        '/account': { ssr: false },
        '/account/**': { ssr: false },
        '/admin': { ssr: false },
        '/admin/**': { ssr: false },
        '/favorites': { ssr: false },
    },


    vite: {
        plugins: [
            tailwindcss(),
        ],
        server: {
            hmr: {
                clientPort: 3001,
            },
        },
    },


    app: {
        // Адмінка перекриває це у middleware/admin.ts (admin-blur)
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            // Ставимо тему до першого рендера, щоб не було спалаху світлої сторінки.
            script: [
                {
                    innerHTML: "try{var m=localStorage.getItem('vueuse-color-scheme')||'auto';if(m==='auto')m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',m)}catch(e){}",
                    tagPosition: 'head',
                },
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap',
                },
            ],
        },
    },

    runtimeConfig: {
        apiInternalBase: 'http://127.0.0.1:3000/api',
        public: {
            apiBase: '',
            s3BaseUrl: '',
            // Аналитика (2.2). Пусто = выключено. Заполняется через env NUXT_PUBLIC_*.
            gtmId: '',
            metaPixelId: '',
        },
    },

    typescript: {
        strict: true,
    },

    components: [
        {
            path: '~/modules/ui/components',
        },
        {
            path: '~/modules/common/components',
        },
        {
            path: '~/modules/catalog/components',
            pathPrefix: false,
        },
    ],

    imports: {
        dirs: [
            'modules/**/composables',
            'modules/**/helpers',
        ],
    },

    devServer: {
        port: 3001,
    },


    compatibilityDate: '2025-06-01',
})
