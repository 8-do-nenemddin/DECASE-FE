import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../components/main.vue'; // Main.vue 경로 확인 필요
import ProjectHome from '../components/ProjectHome.vue';

const routes = [
  {
    path: '/',
    name: 'MainView',
    component: MainView
  },
  {
    path: '/project/:projectName',
    name: 'ProjectHome',
    component: ProjectHome,
    props: true // 라우트 파라미터를 props로 전달
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;