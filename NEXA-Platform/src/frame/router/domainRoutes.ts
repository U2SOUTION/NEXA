import type { RouteRecordRaw } from 'vue-router'

export const domainRoutes: RouteRecordRaw[] = [
  { path: '', component: () => import('@domains/home/views/content/HomeView.vue'), name: 'Home' },
  {
    path: 'nexa-board',
    component: () => import('@domains/board/BoardDomain.vue'),
    children: [
      { path: '', component: () => import('@domains/board/views/content/BoardContent.vue'), name: 'NexaBoard' },
      { path: 'add-device', component: () => import('@domains/infra/components/AddDeviceForm.vue'), name: 'BoardAddDevice' },
      { path: 'admin', component: () => import('@domains/board/views/admin/BoardAdminPage.vue'), name: 'BoardAdmin' },
    ],
  },
  {
    path: 'nexa-panel',
    name: 'NexaPanel',
    component: () => import('@domains/panel/PanelDomain.vue'),
  },
  {
    path: 'nexa-node',
    name: 'NexaNode',
    component: () => import('@domains/node/NodeDomain.vue'),
  },
  {
    path: 'nexa-trace',
    name: 'NexaTrace',
    component: () => import('@domains/trace/TraceDomain.vue'),
  },
  {
    path: 'nexa-ai',
    name: 'NexaAi',
    component: () => import('@domains/ai/AiDomain.vue'),
    children: [
      {
        path: '',
        name: 'NexaAiChat',
        component: () => import('@domains/ai/views/content/AiContent.vue'),
      },
    ],
  },
  {
    path: 'nexa-archive',
    name: 'NexaArchive',
    component: () => import('@domains/archive/ArchiveDomain.vue'),
    beforeEnter: (to, from, next) => {
      const map: Record<string, string> = {
        index: 'NexaArchiveIndex',
        hub: 'NexaArchiveHub',
        studio: 'NexaArchiveStudio',
        connector: 'NexaArchiveConnector',
        insights: 'NexaArchiveInsights',
      }
      const landing = (typeof localStorage !== 'undefined' && localStorage.getItem('archive-default-landing')) || 'index'
      const target = map[landing] || map.index
      if (to.name === 'NexaArchive' || to.name === 'NexaArchiveIndex') {
        if (to.name !== target) {
          next({ name: target, replace: true })
          return
        }
      }
      next()
    },
    children: [
      {
        path: '',
        name: 'NexaArchiveIndex',
        component: () => import('@domains/archive/views/content/ArchiveIndex.vue'),
      },
      {
        path: 'hub',
        name: 'NexaArchiveHub',
        component: () => import('@domains/archive/views/content/HubView.vue'),
        meta: { section: 'hub' },
      },
      {
        path: 'studio',
        name: 'NexaArchiveStudio',
        component: () => import('@domains/archive/views/content/StudioView.vue'),
        meta: { section: 'studio' },
      },
      {
        path: 'connector',
        name: 'NexaArchiveConnector',
        component: () => import('@domains/archive/views/content/ConnectorView.vue'),
        meta: { section: 'connector' },
      },
      {
        path: 'insights',
        name: 'NexaArchiveInsights',
        component: () => import('@domains/archive/views/content/InsightsView.vue'),
        meta: { section: 'insights' },
      },
    ],
  },
  {
    path: 'portfolio',
    name: 'Portfolio',
    component: () => import('@domains/portfolio/PortfolioDomain.vue'),
  },
  {
    path: 'erp',
    name: 'Erp',
    component: () => import('@domains/erp/ErpDomain.vue'),
  },
  {
    path: 'erp/parts',
    name: 'ErpParts',
    component: () => import('@domains/parts/PartsManagementDomain.vue'),
  },
  {
    path: 'infra',
    component: () => import('@domains/infra/InfraDomain.vue'),
    children: [
      { path: '', component: () => import('@domains/infra/views/content/InfraContent.vue'), name: 'Infra' },
      { path: 'add-device', component: () => import('@domains/infra/components/AddDeviceForm.vue'), name: 'InfraAddDevice' },
    ],
  },
  {
    path: 'network',
    name: 'Network',
    component: () => import('@domains/network/NetworkDomain.vue'),
  },
  {
    path: 'solutions',
    name: 'Solutions',
    component: () => import('@domains/solutions/SolutionsDomain.vue'),
  },
  {
    path: 'extension',
    name: 'Extension',
    component: () => import('@domains/extension/views/content/ExtensionContent.vue'),
    beforeEnter: (to, from, next) => {
      const isU2BeeMode = (to.query.mode === 'popup' || to.query.mode === 'sidepanel') && to.query.extension === 'u2bee'
      if (isU2BeeMode) {
        next({ name: 'ExtensionU2Bee', query: to.query, params: to.params })
      } else {
        next()
      }
    },
  },
  {
    path: 'help',
    name: 'Help',
    component: () => import('@domains/help/views/content/HelpView.vue'),
  },
  {
    path: 'dev',
    name: 'Dev',
    component: () => import('@domains/dev/DevDomain.vue'),
  },
  {
    path: 'my',
    name: 'My',
    component: () => import('@domains/my/views/content/MyView.vue'),
  },
  {
    path: 'settings',
    name: 'Settings',
    component: () => import('@domains/settings/views/content/SettingsContent.vue'),
  },
]
