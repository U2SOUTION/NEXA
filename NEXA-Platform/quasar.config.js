// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import path from 'node:path' // 경로 계산을 위한 path 모듈 추가

export default defineConfig((/* ctx */) => {
  return {
    // app boot file (/src/boot)
    boot: ['pinia', 'errorTracking'],

    // 전역 스타일 설정
    css: ['app.scss', 'themes/light.scss', 'themes/dark.scss', 'nexa-system/nexa-system.scss', '~vue3-grid-layout-next/dist/style.css'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'hash',

      extendViteConf(viteConf) {
        // [리펙토링 할 때 추가] 도메인 및 시스템 별칭(Alias) 설정
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = {
          ...viteConf.resolve.alias,
          '@frame': path.resolve(__dirname, './src/frame'),
          '@engines': path.resolve(__dirname, './src/engines'),
          '@system': path.resolve(__dirname, './src/system'),
          '@domains': path.resolve(__dirname, './src/domains'),
          '@infra': path.resolve(__dirname, './src/domains/infra'),
          '@erp': path.resolve(__dirname, './src/domains/erp'),
          '@board': path.resolve(__dirname, './src/domains/board'),
        }

        // HMR 설정
        viteConf.server = viteConf.server || {}
        viteConf.server.hmr = {
          overlay: true,
        }

        // 파일 감시 설정 (기존 설정 유지)
        viteConf.server.watch = viteConf.server.watch || {}
        viteConf.server.watch.ignored = [...(viteConf.server.watch.ignored || []), '**/docs/**', '**/NEXA-Documentation/**']

        // Tiptap 및 라이브러리 최적화 (기존 설정 유지)
        viteConf.optimizeDeps = viteConf.optimizeDeps || {}
        viteConf.optimizeDeps.include = [
          ...(viteConf.optimizeDeps.include || []),
          '@tiptap/vue-3',
          '@tiptap/starter-kit',
          '@tiptap/extension-underline',
          '@tiptap/extension-image',
          '@tiptap/extension-link',
          '@tiptap/extension-table',
          '@tiptap/extension-table-row',
          '@tiptap/extension-table-cell',
          '@tiptap/extension-table-header',
          'jspdf',
          'jspdf-autotable',
          'xlsx',
        ]
      },

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
      port: 9000,
      hmr: {
        overlay: true,
      },
    },

    framework: {
      config: {
        dark: false,
      },
      plugins: ['Notify', 'Dialog', 'Loading'],
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: ['render'],
      pwa: false,
    },

    pwa: {
      workboxMode: 'GenerateSW',
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      builder: {
        appId: 'quasar-project',
      },
    },

    bex: {
      extraScripts: [],
    },
  }
})
