import { createRouter, createWebHistory } from "vue-router";
import MainView from "../components/main.vue";
import ProjectMain from "../components/projects/ProjectMain.vue";
import ProjectSetting from "../components/projects/settings/SettingMain.vue";
import ProjectInfo from "../components/projects/settings/edit_project/EditProjectInfo.vue";
import ProjectMatrix from "../components/projects/settings/view_matrix/ViewMatrix.vue";
import ProjectRight from "../components/projects/settings/manage_right/ManageRight.vue";
import Home from "../components/Home.vue";
import SignIn from "../components/Signin.vue";
import Signup from "../components/Signup.vue";

const routes = [
  {
    path: "/",
    name: "MainView",
    component: MainView,
  },
  {
    path: "/projects/:projectName",
    name: "ProjectMain",
    component: ProjectMain,
    props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings",
    name: "ProjectSetting",
    component: ProjectSetting,
    // props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings/info",
    name: "ProjectInfo",
    component: ProjectInfo,
    // props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings/matrix",
    name: "ProjectMatrix",
    component: ProjectMatrix,
    // props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings/right",
    name: "ProjectRight",
    component: ProjectRight,
    // props: true, // 라우트 파라미터를 props로 전달
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
