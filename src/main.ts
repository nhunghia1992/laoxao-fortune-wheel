import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate';
import App from './App.vue'
import '@/main.css'

const app = createApp(App)

// pinia store
const pinia = createPinia();
pinia.use(piniaPersistedState);
app.use(pinia)

app.mount('#app')
