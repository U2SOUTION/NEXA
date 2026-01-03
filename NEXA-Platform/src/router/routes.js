const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue'), name: 'Home' },
      { path: 'nexa-board', component: () => import('pages/NexaBoardPage.vue'), name: 'NexaBoard' },
      { path: 'old-index', component: () => import('pages/IndexBoardPage.vue') },
      {
        path: 'add-device',
        name: 'AddDevice',
        component: () => import('components/form/AddDeviceForm.vue'),
      },
      {
        path: 'board-admin',
        name: 'BoardAdmin',
        component: () => import('pages/BoardAdminPage.vue'),
      },
      {
        path: 'parts-management',
        name: 'PartsManagement',
        component: () => import('pages/PartsManagementPage.vue'),
      },
      {
        path: 'nexa-pannel',
        name: 'NexaPannel',
        component: () => import('pages/NexaPannelPage.vue'),
      },
      {
        path: 'nexa-node',
        name: 'NexaNode',
        component: () => import('pages/NexaNodePage.vue'),
      },
      {
        path: 'nexa-teach',
        name: 'NexaTeach',
        component: () => import('pages/NexaTeachPage.vue'),
      },
      {
        path: 'portfolio',
        name: 'Portfolio',
        component: () => import('pages/PortfolioPage.vue'),
      },
      {
        path: 'erp',
        name: 'Erp',
        component: () => import('src/pages/NexaErpPage.vue'),
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('pages/SystemPage.vue'),
      },
      {
        path: 'network',
        name: 'Network',
        component: () => import('pages/NetworkPage.vue'),
      },
      {
        path: 'solutions',
        name: 'Solutions',
        component: () => import('pages/SolutionsPage.vue'),
      },
      {
        path: 'extension',
        name: 'Extension',
        component: () => import('pages/ExtensionPage.vue'),
      },
      {
        path: 'help',
        name: 'Help',
        component: () => import('pages/HelpPage.vue'),
      },
      {
        path: 'dev',
        name: 'Dev',
        component: () => import('pages/DevelopmentPage.vue'),
      },
      {
        path: 'my',
        name: 'My',
        component: () => import('pages/MyPage.vue'),
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/SettingsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
