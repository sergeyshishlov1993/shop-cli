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
        '@nuxtjs/device'
    ],

    css: [
        '~/assets/css/main.css',
    ],

    vite: {
        plugins: [
            tailwindcss(),
        ],
    },

    runtimeConfig: {
        public: {
            apiBase: '',
            s3BaseUrl: ''
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