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
  ],
})

export default router
