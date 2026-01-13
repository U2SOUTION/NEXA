import { domainRoutes } from './domainRoutes'

const routes = [
  {
    path: '/',
    component: () => import('@frame/layout/MainLayout.vue'),
    children: domainRoutes,
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
