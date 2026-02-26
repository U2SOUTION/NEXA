// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

// ESM 환경에서 __dirname 정의
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SRC_ROOT = path.resolve(__dirname, 'src')

/**
 * src 전용 .ts 우선 해석. node_modules/deps에는 관여하지 않음.
 * 문제 시: .quasar 삭제 후 서버 재시작으로 대부분 해결됨.
 */
function vitePluginPreferTsInSrc() {
  const srcRootNorm = path.normalize(SRC_ROOT)
  const underSrc = (p) => {
    if (!p || typeof p !== 'string') return false
    const resolved = path.normalize(path.resolve(p))
    return resolved === srcRootNorm || resolved.startsWith(srcRootNorm + path.sep)
  }
  const tryTs = async function (baseId, importer) {
    const tsId = baseId.endsWith('.ts') ? baseId : baseId.replace(/\.js$/, '') + '.ts'
    const r = await this.resolve(tsId, importer, { skipSelf: true })
    if (!r?.id) return null
    const pathOnly = r.id.split('?')[0]
    return (underSrc(pathOnly) && fs.existsSync(pathOnly)) ? r.id : null
  }
  return {
    name: 'vite-prefer-ts-in-src',
    enforce: 'pre',
    async resolveId(id, importer) {
      try {
        if (!id || id.includes('node_modules') || id.startsWith('#') || (importer && importer.includes('node_modules'))) return null
        if (id.endsWith('.js')) {
          const tsResolved = await tryTs.call(this, id, importer)
          if (tsResolved) return tsResolved
          if (id.startsWith('/src/')) {
            const full = path.resolve(__dirname, id.split('?')[0].replace(/\.js$/, '.ts').slice(1))
            if (underSrc(full) && fs.existsSync(full)) return full
          }
          return null
        }
        if (!path.extname(id) && (id.startsWith('.') || id.startsWith('@'))) return await tryTs.call(this, id, importer)
      } catch { /* 파이프라인 중단 방지 */ }
      return null
    },
  }
}

export default defineConfig((/* ctx */) => {
  return {
    // app boot file (/src/system/boot)
    boot: ['../system/boot/pinia', '../system/boot/errorTracking', '../system/boot/notify'],

    // 전역 스타일 설정
    css: ['../system/css/themes/light.scss', '../system/css/themes/dark.scss', '../system/css/nexa-system/nexa-system.scss', '../system/css/app.scss', '~vue3-grid-layout-next/dist/style.css'],

    extras: ['roboto-font', 'material-icons', 'fontawesome-v6'],

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
          '@components': path.resolve(__dirname, './src/system/components'),
          // layoutRegistry 등에서 사용: layouts/ → frame/layout
          layouts: path.resolve(__dirname, './src/frame/layout'),
          // 라우터: Quasar 표준 경로 → frame/router (sourceFiles.router와 쌍)
          'src/router': path.resolve(__dirname, './src/frame/router'),
          'app/src/router': path.resolve(__dirname, './src/frame/router'),
          'app/src/router/index': path.resolve(__dirname, './src/frame/router/index.ts'),
          'app/src/frame/router/index': path.resolve(__dirname, './src/frame/router/index.ts'),
        }

        // SCSS 전역 변수 설정
        viteConf.css = {
          preprocessorOptions: {
            scss: {
              // additionalData는 이제 src/css/quasar.variables.scss 심(Shim) 파일이 처리합니다.
            },
          },
        }

        // HMR 설정
        viteConf.server = viteConf.server || {}
        viteConf.server.hmr = {
          overlay: true,
        }

        // 파일 감시 설정 (기존 설정 유지)
        viteConf.server.watch = viteConf.server.watch || {}
        viteConf.server.watch.ignored = [...(viteConf.server.watch.ignored || []), '**/docs/**', '**/NEXA-Documentation/**']

        // .md 파일을 JS로 파싱하지 않고 에셋으로 처리 (빌드 시 PARSE_ERROR 방지)
        viteConf.assetsInclude = viteConf.assetsInclude || []
        if (Array.isArray(viteConf.assetsInclude)) {
          viteConf.assetsInclude.push('**/*.md')
        }

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
        vitePluginPreferTsInSrc(),
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,ts,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    //같은 네트워크 환경에서 접속 허용
    devServer: {
      host: '0.0.0.0', // LAN 접속 허용
      open: true,
      port: 9000,
      allowedHosts: ['nexa-solutions.net', 'www.nexa-solutions.net'],
      hmr: {
        overlay: true,
      },
      proxy: {
        '/uploads': {
          target: `http://localhost:${process.env.VITE_API_PORT || '3001'}`,
          changeOrigin: true,
        },
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

    // Quasar 표준 경로를 아키텍처 레이어에 맞게 공식적으로 변경
    sourceFiles: {
      router: 'src/frame/router/index',
    },

    bex: {
      extraScripts: [],
    },
  }
})
