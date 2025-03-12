import { messageReducer, messageReviver } from './utils/messagePayload';
import path from 'path';

export default defineNuxtConfig({
  //compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' }
    }
  },

  css: ['~/assets/css/style.css'],

  algolia:{
    apiKey:process.env.ALGOLIA_SEARCH_API_KEY,
    applicationId:process.env.ALGOLIA_APPLICATION_ID,
  },

  script: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', type: 'text/javascript', defer: true },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js', type: 'text/javascript', defer: true },
    { src: '/path/to/script.js', type: 'text/javascript', defer: true },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js' }
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.APIBASE,
      stripePubishKey: process.env.STRIPE_PUBLISHABLE_KEY,
      stripeTestKey: process.env.STRIPE_TEST_KEY
    }
  },

  modules: ['@nuxtjs/google-fonts', '@nuxtjs/algolia'],

  googleFonts: {
    families: ['Roboto', 'Inter', 'Josefin+Sans', 'Lato', 'Raleway', 'Crimson Pro','Poppins','Dancing Script'],
  },

  payload: {
    reducers: {
      Message: messageReducer,
    },
    revivers: {
      Message: messageReviver,
    }
  },

  modules: ['nuxt-emoji-picker', // Add nuxt-swiper module here
  'nuxt-swiper', '@nuxtjs/google-fonts'],

  render: {
    csp: {
      policies: {
        'default-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
        'img-src': ["'self'", "data:", "blob:", "*"],
        'media-src': ["'self'", "data:", "blob:", "*"],
        'trusted-types': ["'self'"],
      }
    }
  },

  build: {
    extend(config, ctx) {
      if (ctx.isServer) {
        config.target = 'node'
        config.output = {
          path: path.resolve(__dirname, '.output/server'),
          filename: 'index.mjs',
        };
      } else {
        config.output = {
          path: path.resolve(__dirname, '.output/public/_nuxt'),
        };
      }
    }
  },

  nitro: {
    output: {
      dir: '.output',
      publicDir: '.output/public',
      serverDir: '.output/server',
    }
  },

  experimental: {
    renderJsonPayloads: false,
  },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '/',
        name: 'Home',
        component: resolve(__dirname, 'pages/index.vue'),
      });
      routes.push({
        path: '/users/signin',
        name: 'SignIn',
        component: resolve(__dirname, 'pages/users/signin.vue'),
      });
      routes.push({
        path: '/:catchAll(.*)*', // Catch-all route for undefined paths
        component: resolve(__dirname, 'pages/404.vue'),
      });
    },
  },

  compatibilityDate: '2025-03-08'
});