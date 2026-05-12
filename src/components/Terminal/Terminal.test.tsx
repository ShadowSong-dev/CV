import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n from '@/i18n'
import { Terminal } from './Terminal'

beforeEach(async () => {
  await i18n.changeLanguage('en')
})

function renderTerminal(
  overrides: Partial<React.ComponentProps<typeof Terminal>> = {},
) {
  const onThemeChange = vi.fn()
  const onLocaleChange = vi.fn()
  const onSwitchToGui = vi.fn()
  render(
    <Terminal
      theme="green"
      onThemeChange={onThemeChange}
      onSwitchToGui={onSwitchToGui}
      onLocaleChange={onLocaleChange}
      {...overrides}
    />,
  )
  return { onThemeChange, onLocaleChange, onSwitchToGui }
}

describe('Terminal · 启动状态', () => {
  it('挂载时显示欢迎语 (en)', () => {
    renderTerminal()
    expect(screen.getByText(/Welcome/)).toBeInTheDocument()
    expect(screen.getByText(/RayChen CLI/)).toBeInTheDocument()
  })

  it('locale="zh" 时显示中文欢迎语', () => {
    renderTerminal({ locale: 'zh' })
    expect(screen.getByText(/欢迎/)).toBeInTheDocument()
  })

  it('携带 surface 测试钩子并写入当前 theme', () => {
    renderTerminal({ theme: 'amber' })
    const surface = screen.getByTestId('terminal-surface')
    expect(surface).toHaveAttribute('data-theme-current', 'amber')
  })
})

describe('Terminal · 提交命令', () => {
  it('回车提交后 echo 输入 + 追加命令输出', async () => {
    const user = userEvent.setup()
    renderTerminal()
    const input = screen.getByRole('textbox')
    await user.type(input, 'whoami{Enter}')
    // whoami 输出包含 Ray Chen
    expect(await screen.findByText(/Ray Chen/)).toBeInTheDocument()
    // echo 行包含用户输入
    const echoLines = screen.getAllByTestId('output-line')
    const echoTexts = echoLines.map((n) => n.textContent ?? '')
    expect(echoTexts.some((t) => t.includes('whoami'))).toBe(true)
  })

  it('未知命令显示 "command not found"', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await user.type(screen.getByRole('textbox'), 'nope{Enter}')
    expect(await screen.findByText(/command not found/)).toBeInTheDocument()
  })

  it('theme amber 调用 onThemeChange', async () => {
    const user = userEvent.setup()
    const { onThemeChange } = renderTerminal()
    await user.type(screen.getByRole('textbox'), 'theme amber{Enter}')
    expect(onThemeChange).toHaveBeenCalledWith('amber')
  })

  it('lang zh 调用 onLocaleChange', async () => {
    const user = userEvent.setup()
    const { onLocaleChange } = renderTerminal()
    await user.type(screen.getByRole('textbox'), 'lang zh{Enter}')
    expect(onLocaleChange).toHaveBeenCalledWith('zh')
  })

  it('gui 命令调用 onSwitchToGui', async () => {
    const user = userEvent.setup()
    const { onSwitchToGui } = renderTerminal()
    await user.type(screen.getByRole('textbox'), 'gui{Enter}')
    expect(onSwitchToGui).toHaveBeenCalledTimes(1)
  })

  it('提交后输入框被清空', async () => {
    const user = userEvent.setup()
    renderTerminal()
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'help{Enter}')
    expect(input.value).toBe('')
  })
})

describe('Terminal · 历史与 Tab 补全', () => {
  it('↑ / ↓ 取出/回退历史', async () => {
    const user = userEvent.setup()
    renderTerminal()
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'help{Enter}')
    await user.type(input, 'whoami{Enter}')
    // 现在 input 已清空
    expect(input.value).toBe('')
    await user.keyboard('{ArrowUp}')
    expect(input.value).toBe('whoami')
    await user.keyboard('{ArrowUp}')
    expect(input.value).toBe('help')
    await user.keyboard('{ArrowDown}')
    expect(input.value).toBe('whoami')
    await user.keyboard('{ArrowDown}')
    // 再下一次离开历史，回到空串
    expect(input.value).toBe('')
  })

  it('Tab 在唯一前缀下直接补全', async () => {
    const user = userEvent.setup()
    renderTerminal()
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'hel')
    await user.keyboard('{Tab}')
    expect(input.value).toBe('help')
  })
})

describe('Terminal · 快捷命令栏 (点击 = 直接执行)', () => {
  it('点击 "whoami" 直接提交并显示输出 (不只是把字塞到输入框)', async () => {
    const user = userEvent.setup()
    renderTerminal()
    // 找到 toolbar 内的 whoami 按钮（避免与 input 的 textbox 混淆）
    const toolbar = screen.getByRole('toolbar')
    await user.click(within(toolbar).getByRole('button', { name: 'whoami' }))
    // 输出区出现 whoami 的简介
    expect(await screen.findByText(/Ray Chen/)).toBeInTheDocument()
    // 输入框依然是空
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
  })

  it('点击 "help" 触发 help 输出', async () => {
    const user = userEvent.setup()
    renderTerminal()
    const toolbar = screen.getByRole('toolbar')
    await user.click(within(toolbar).getByRole('button', { name: 'help' }))
    expect(await screen.findByText(/Available commands/)).toBeInTheDocument()
  })
})
