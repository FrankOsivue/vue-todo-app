import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/todos' },
    {
      path: '/todos',
      component: () => import('../pages/TodosPage.vue'),
    },
    {
      path: '/todos/:id',
      component: () => import('../pages/TodoDetail.vue'),
    },
  ],
});
