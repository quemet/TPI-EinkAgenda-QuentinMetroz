import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/agenda/:agendaId',
      name: 'agenda',
      props: true,
      component: () => import('../pages/AgendaPage.vue'),
    },
    {
      path: '/dashboard/:familyId',
      name: 'dashboard',
      props: true,
      component: () => import('../pages/DashboardView.vue'),
    },
  ],
})

export default router
