import type { RouteRecordRaw } from 'vue-router'
import { domainRoutes } from './domainRoutes'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@frame/layout/MainLayout.vue'),
    children: domainRoutes,
  },
  {
    path: '/login',
    component: () => import('@frame/layout/AuthLayout.vue'),
    children: [{ path: '', name: 'Login', component: () => import('@frame/views/auth/LoginPage.vue') }],
  },
  {
    path: '/register',
    component: () => import('@frame/layout/AuthLayout.vue'),
    children: [{ path: '', name: 'Register', component: () => import('@frame/views/auth/RegisterPage.vue') }],
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
