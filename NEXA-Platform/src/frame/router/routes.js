const routes = [
  {
    path: '/',
    component: () => import('@frame/layout/MainLayout.vue'),
    children: [
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
        path: 'nexa-pannel',
        name: 'NexaPannel',
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
        path: 'portfolio',
        name: 'Portfolio',
        component: () => import('@domains/portfolio/PortfolioDomain.vue'),
      },
      {
        path: 'erp',
        name: 'Erp',
        redirect: '/erp/parts-management',
      },
      {
        path: 'erp/parts-management',
        name: 'ErpPartsManagement',
        component: () => import('@domains/parts-management/PartsManagementDomain.vue'),
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
    ],
  },
  {
    path: '/extension',
    component: () => import('@frame/layout/U2BeeLayout.vue'),
    children: [
      {
        path: '',
        name: 'ExtensionU2Bee',
        component: () => import('@domains/extension/views/content/ExtensionContent.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@frame/views/common/ErrorNotFound.vue'),
  },
]

export default routes
