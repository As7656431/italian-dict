import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import WordDetailView from './views/WordDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '意大利语 CEFR 词典' }
  },
  {
    path: '/word/:word',
    name: 'word-detail',
    component: WordDetailView,
    props: true,
    meta: { title: '单词详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 动态页面标题
router.afterEach((to) => {
  if (to.name === 'word-detail' && to.params.word) {
    document.title = `${decodeURIComponent(to.params.word)} - 意大利语 CEFR 词典`
  } else {
    document.title = to.meta.title || '意大利语 CEFR 词典'
  }
})

export default router
