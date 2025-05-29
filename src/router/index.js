import { createRouter, createWebHistory } from "vue-router";
import MainView from "../components/main.vue";
import ProjectHome from "../components/ProjectHome.vue";
import ProjectMain from "../components/projects/ProjectMain.vue";
import Home from "../components/Home.vue";
import AuthLeftPanel from "../components/AuthLeftPanel.vue";
import SignIn from "../components/Signin.vue";
import Signup from "../components/Signup.vue";

const routes = [
  {
    path: "/",
    name: "MainView",
    component: MainView,
  },
  {
    path: "/project/:projectName",
    name: "ProjectHome",
    component: ProjectHome,
    props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/projects/:projectName",
    name: "ProjectMain",
    component: ProjectMain,
    props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  {
    path: "/signin",
    name: "SignIn",
    component: SignIn,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
