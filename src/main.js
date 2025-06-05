import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


import './style.css'
import App from './App.vue'
import router from './router' // 라우터 import 추가

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

app.use(router); // 라우터 사용
app.use(pinia);
app.mount('#app');

