import Antd from 'ant-design-vue';
import { createApp } from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css';
import './assets/main.css';
const app = createApp(App);
app.use(Antd).mount('#app');
