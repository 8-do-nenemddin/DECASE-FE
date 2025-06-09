import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/home/Home.vue";
import Login from "../components/home/Login.vue";
import Signup from "../components/home/SignUp.vue";
import MainView from "../components/main/main.vue";
import ProjectMain from "../components/projects/ProjectMain.vue";
import inviteMember from "../components/projects/invitations/InviteMember.vue";

import ProjectSetting from "../components/projects/settings/SettingMain.vue";
import ProjectInfo from "../components/projects/settings/edit_project/EditProjectInfo.vue";
import ProjectRight from "../components/projects/settings/manage_right/ManageRight.vue";
import ProjectMatrix from "../components/projects/settings/view_matrix/ViewMatrix.vue";

import DetailsMain from "../components/projects/details/DetailsMain.vue"
import ProjectDetailInfo from "../components/projects/details/project_detail/ProjectInfo.vue"
import ProjectDetailMatrix from "../components/projects/details/view_matrix/ViewMatrix.vue"


const routes = [
  {
    path: "/",
    name: "MainView",
    component: MainView,
  },
  {
    path: "/projects/:projectId",
    name: "ProjectMain",
    component: ProjectMain,
    props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings/:projectId",
    name: "ProjectSetting",
    component: ProjectSetting,
    props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/details/:projectId",
    name: "ProjectDetail",
    component: DetailsMain,
    props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings/info",
    name: "ProjectInfo",
    component: ProjectInfo,
    // props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/details/info",
    name: "ProjectDetailInfo",
    component: ProjectDetailInfo,
    // props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/settings/matrix",
    name: "ProjectMatrix",
    component: ProjectMatrix,
    // props: true, // 라우트 파라미터를 props로 전달
  },
  {
    path: "/details/matrix",
    name: "ProjectDetailMatrix",
    component: ProjectDetailMatrix,
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
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/invite/:token",
    name: "InviteMember",
    component: inviteMember,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
