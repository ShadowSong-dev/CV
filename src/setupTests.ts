import '@testing-library/jest-dom'
// 让 useTranslation 在所有测试里都有一个真实的 i18n 实例可用，
// 否则 react-i18next 会抛 NO_I18NEXT_INSTANCE 警告并把 key 当成回退文本。
import '@/i18n'

/**
 * 把 prefers-reduced-motion 强制为 true，让 staggered reveal 在测试中即时显示，
 * 避免依赖 fake timers 与异步 wait。
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}
