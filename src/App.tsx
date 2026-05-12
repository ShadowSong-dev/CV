import { useCallback, useEffect, useState } from 'react'
import i18n from '@/i18n'
import { Terminal } from '@/components/Terminal/Terminal'
import { GuiMode } from '@/components/GuiMode/GuiMode'
import type { Locale, TerminalTheme } from '@/components/Terminal/types'

/** 应用级模式 */
type AppMode = 'terminal' | 'gui'

/** 应用根：在终端 / GUI 模式之间切换；通过 data-theme 应用配色；管理 locale */
export function App() {
  const [mode, setMode] = useState<AppMode>('terminal')
  const [theme, setTheme] = useState<TerminalTheme>('green')
  // 默认英文
  const [locale, setLocale] = useState<Locale>('en')

  // 把 theme 写到 <html data-theme=…>，触发 CSS 变量切换
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    return () => {
      root.removeAttribute('data-theme')
    }
  }, [theme])

  // 把当前模式写到 <html data-mode=…>。Terminal 模式下 CSS 据此锁定文档滚动，
  // 避免「内层 overflow-y-auto + 外层 body 滚动」两条滚动条同时出现。
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-mode', mode)
    return () => {
      root.removeAttribute('data-mode')
    }
  }, [mode])

  // 把 locale 写到 <html lang=…>，同时同步 i18n 当前语言
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [locale])

  const switchToGui = useCallback(() => setMode('gui'), [])
  const backToTerminal = useCallback(() => setMode('terminal'), [])

  if (mode === 'gui') {
    return (
      <GuiMode
        locale={locale}
        onLocaleChange={setLocale}
        onBackToTerminal={backToTerminal}
      />
    )
  }

  return (
    <Terminal
      theme={theme}
      onThemeChange={setTheme}
      locale={locale}
      onLocaleChange={setLocale}
      onSwitchToGui={switchToGui}
    />
  )
}
