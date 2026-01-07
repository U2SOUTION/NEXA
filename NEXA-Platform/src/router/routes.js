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
        // 라우터 가드에서 U2BEE 모드 확인하여 리다이렉트
        beforeEnter: (to, from, next) => {
          // U2BEE 레이아웃을 사용할 조건 확인
          const isU2BeeMode = (to.query.mode === 'popup' || to.query.mode === 'sidepanel') && to.query.extension === 'u2bee'

          if (isU2BeeMode) {
            // U2BEE 레이아웃으로 리다이렉트
            next({ name: 'ExtensionU2Bee', query: to.query, params: to.params })
          } else {
            // 일반 Extension 페이지 표시
            next()
          }
        },
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
  // Extension 경로: U2BEE 전용 레이아웃 (크롬 확장 프로그램용)
  // query parameter로 mode=popup 또는 mode=sidepanel이 있고 extension=u2bee인 경우 U2BeeLayout 사용
  {
    path: '/extension',
    component: () => import('layouts/U2BeeLayout.vue'),
    children: [
      {
        path: '',
        name: 'ExtensionU2Bee',
        component: () => import('pages/ExtensionPage.vue'),
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
