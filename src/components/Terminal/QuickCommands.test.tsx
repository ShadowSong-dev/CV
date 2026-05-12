import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QuickCommands } from './QuickCommands'

describe('QuickCommands', () => {
  it('为每条命令渲染一个按钮 (使用 label 作为可见文字)', () => {
    render(
      <QuickCommands
        commands={[
          { label: 'help', command: 'help' },
          { label: 'whoami', command: 'whoami' },
        ]}
        onPick={() => undefined}
      />,
    )
    expect(screen.getByRole('button', { name: 'help' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'whoami' })).toBeInTheDocument()
  })

  it('点击按钮以「command 字段」回调，不是 label', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(
      <QuickCommands
        commands={[{ label: 'show me', command: 'whoami' }]}
        onPick={onPick}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'show me' }))
    expect(onPick).toHaveBeenCalledWith('whoami')
  })

  it('外层 toolbar 带 i18n 的 aria-label', () => {
    render(
      <QuickCommands
        commands={[{ label: 'a', command: 'a' }]}
        onPick={() => undefined}
      />,
    )
    const bar = screen.getByRole('toolbar')
    expect(bar.getAttribute('aria-label')).toMatch(/Quick|快捷/)
  })
})
