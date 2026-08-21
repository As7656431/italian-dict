import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import WordDetailView from './views/WordDetailView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/word/:word', name: 'word-detail', component: WordDetailView, props: true },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
