import type { RouteRecordRaw } from 'vue-router'
import { domainRoutes } from './domainRoutes'
import { useAuthStore } from '@system/store/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@frame/layout/MainLayout.vue'),
    children: domainRoutes,
  },
  {
    path: '/change-password',
    component: () => import('@frame/layout/AuthLayout.vue'),
    meta: { requiresAuth: true },
    beforeEnter: (_to, _from, next) => {
      const authStore = useAuthStore()
      authStore.init()
      if (!authStore.isLoggedIn) {
        next({ path: '/login', query: { redirect: '/change-password' } })
        return
      }
      next()
    },
    children: [
      { path: '', name: 'ChangePassword', component: () => import('@frame/views/auth/ChangePasswordPage.vue') },
    ],
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
