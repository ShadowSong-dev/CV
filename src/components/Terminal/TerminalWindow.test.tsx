import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TerminalWindow } from './TerminalWindow'

describe('TerminalWindow', () => {
  it('渲染传入的 title 与子内容', () => {
    render(
      <TerminalWindow title="guest@host:~$">
        <div data-testid="body">hello</div>
      </TerminalWindow>,
    )
    expect(screen.getByText('guest@host:~$')).toBeInTheDocument()
    expect(screen.getByTestId('body')).toHaveTextContent('hello')
  })

  it('外层 region 带可访问 label (从 i18n 取)', () => {
    render(
      <TerminalWindow title="t">
        <div />
      </TerminalWindow>,
    )
    // 默认 en 下 ariaWindow = "Terminal window"
    const region = screen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', expect.stringMatching(/Terminal|终端/))
  })

  it('透传 className 到根 div', () => {
    render(
      <TerminalWindow title="t" className="custom-cls">
        <div />
      </TerminalWindow>,
    )
    expect(screen.getByRole('region')).toHaveClass('custom-cls')
  })
})
