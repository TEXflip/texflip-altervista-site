import { createApp } from 'vue'
import App from './App.vue'
import axiosApi from 'axios'

const axios = axiosApi.create({
    baseURL: '/pellad_set_creator',
    // headers:
});

const app = createApp(App)
app.config.globalProperties.axios = axios;
app.mount('#app')