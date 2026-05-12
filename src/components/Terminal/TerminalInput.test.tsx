import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TerminalInput } from './TerminalInput'

function mountInput(overrides: Partial<React.ComponentProps<typeof TerminalInput>> = {}) {
  const onChange = vi.fn()
  const onSubmit = vi.fn()
  const onHistoryPrev = vi.fn()
  const onHistoryNext = vi.fn()
  const onComplete = vi.fn()
  render(
    <TerminalInput
      value=""
      onChange={onChange}
      onSubmit={onSubmit}
      onHistoryPrev={onHistoryPrev}
      onHistoryNext={onHistoryNext}
      onComplete={onComplete}
      prompt="$"
      ariaLabel="cmd"
      {...overrides}
    />,
  )
  return { onChange, onSubmit, onHistoryPrev, onHistoryNext, onComplete }
}

describe('TerminalInput', () => {
  it('挂载后自动 focus 输入框', () => {
    mountInput()
    expect(screen.getByRole('textbox', { name: 'cmd' })).toHaveFocus()
  })

  it('显示 prompt 字符串', () => {
    mountInput({ prompt: 'guest@host:~$' })
    expect(screen.getByText('guest@host:~$')).toBeInTheDocument()
  })

  it('打字触发 onChange', async () => {
    const user = userEvent.setup()
    const { onChange } = mountInput()
    await user.type(screen.getByRole('textbox', { name: 'cmd' }), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('回车触发 onSubmit (当前 value)', async () => {
    const user = userEvent.setup()
    const { onSubmit } = mountInput({ value: 'help' })
    await user.type(screen.getByRole('textbox', { name: 'cmd' }), '{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('help')
  })

  it('↑ 触发 onHistoryPrev、↓ 触发 onHistoryNext、Tab 触发 onComplete', async () => {
    const user = userEvent.setup()
    const { onHistoryPrev, onHistoryNext, onComplete } = mountInput()
    const input = screen.getByRole('textbox', { name: 'cmd' })
    input.focus()
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Tab}')
    expect(onHistoryPrev).toHaveBeenCalled()
    expect(onHistoryNext).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
