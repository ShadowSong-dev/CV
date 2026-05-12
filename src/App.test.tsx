import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from '@/i18n'
import { App } from './App'

beforeEach(async () => {
  await i18n.changeLanguage('en')
})

describe('App · 模式切换', () => {
  it('默认进入 Terminal 模式', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: /Terminal|终端/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('终端里输入 gui 命令后切换到 GuiMode (出现 H1 姓名 + Skills 区)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox'), 'gui{Enter}')
    expect(
      await screen.findByRole('heading', { level: 1, name: /Ray Chen/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Skills/i })).toBeInTheDocument()
  })

  it('在 GuiMode 中点击 "← terminal" 返回 Terminal', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox'), 'gui{Enter}')
    await screen.findByRole('heading', { level: 1, name: /Ray Chen/ })
    await user.click(screen.getByRole('button', { name: /Back to terminal mode/i }))
    // 回到终端：又能看到输入框
    expect(await screen.findByRole('textbox')).toBeInTheDocument()
  })
})

describe('App · 主题副作用', () => {
  it('主题切换写入 <html data-theme=…>', async () => {
    const user = userEvent.setup()
    render(<App />)
    // 初始默认 green
    expect(document.documentElement.getAttribute('data-theme')).toBe('green')
    await user.type(screen.getByRole('textbox'), 'theme amber{Enter}')
    expect(document.documentElement.getAttribute('data-theme')).toBe('amber')
  })

  it('locale 切换写入 <html lang=…>', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(document.documentElement.getAttribute('lang')).toBe('en')
    await user.type(screen.getByRole('textbox'), 'lang zh{Enter}')
    expect(document.documentElement.getAttribute('lang')).toBe('zh')
  })
})
