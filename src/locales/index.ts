import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'

// 从 localStorage 获取保存的语言设置，默认为中文
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
})

export default i18n

// 切换语言的辅助函数
export function setLocale(locale: string) {
  i18n.global.locale.value = locale as any
  localStorage.setItem('locale', locale)
  document.documentElement.setAttribute('lang', locale)
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value as string
}

// 获取可用语言列表
export const availableLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
]