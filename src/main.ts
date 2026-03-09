import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'

import App from './App.vue'
import { useLogStore } from './stores/logStore'
import i18n, { getLocale } from './locales'

import './assets/styles/global.scss'

// 注册highlight.js语言
hljs.registerLanguage('json', json)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)
app.use(i18n)

// 初始化主题
const store = useLogStore()
if (store.theme === 'dark') {
  document.documentElement.classList.add('dark')
}

// 设置文档语言
document.documentElement.setAttribute('lang', getLocale())

app.mount('#app')

// 导出hljs供全局使用
export { hljs }