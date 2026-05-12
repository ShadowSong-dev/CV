import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GuiMode } from './GuiMode'

describe('GuiMode · 渲染', () => {
  it('默认 (en) 渲染英文姓名 + ShadowSong 旁注 + tagline', () => {
    render(<GuiMode onBackToTerminal={() => undefined} />)
    expect(
      screen.getByRole('heading', { level: 1, name: /Ray Chen/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Web3 full-stack/)).toBeInTheDocument()
  })

  it('locale="zh" 渲染中文姓名 + 中文 tagline', () => {
    render(<GuiMode locale="zh" onBackToTerminal={() => undefined} />)
    expect(
      screen.getByRole('heading', { level: 1, name: /陈瑞泰/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Web3 全栈开发/)).toBeInTheDocument()
  })

  it('技能分组在英文 / 中文下显示相同的技术名词 (frontend / web3 / contracts / backend / ai)', () => {
    const { unmount } = render(<GuiMode onBackToTerminal={() => undefined} />)
    for (const k of ['frontend', 'web3', 'contracts', 'backend', 'ai']) {
      expect(screen.getByText(k)).toBeInTheDocument()
    }
    unmount()
    render(<GuiMode locale="zh" onBackToTerminal={() => undefined} />)
    for (const k of ['frontend', 'web3', 'contracts', 'backend', 'ai']) {
      expect(screen.getByText(k)).toBeInTheDocument()
    }
  })

  it('渲染两个项目卡片 (Aye 与本简历)', () => {
    render(<GuiMode onBackToTerminal={() => undefined} />)
    expect(screen.getByRole('heading', { level: 3, name: /Aye/ })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /Personal resume/i }),
    ).toBeInTheDocument()
  })

  it('Contact 区域包含 email 与 github 链接', () => {
    render(<GuiMode onBackToTerminal={() => undefined} />)
    const mail = screen.getByRole('link', { name: /shadowsong\.dev@gmail\.com/i })
    expect(mail).toHaveAttribute('href', 'mailto:shadowsong.dev@gmail.com')
    const gh = screen.getByRole('link', { name: /github\.com\/ShadowSong-dev/i })
    expect(gh).toHaveAttribute('href', 'https://github.com/ShadowSong-dev')
  })
})

describe('GuiMode · 交互', () => {
  it('点击 "← terminal" 调用 onBackToTerminal', async () => {
    const user = userEvent.setup()
    const back = vi.fn()
    render(<GuiMode onBackToTerminal={back} />)
    await user.click(screen.getByRole('button', { name: /Back to terminal mode/i }))
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('点击语言按钮调用 onLocaleChange 切换到「另一种」语言', async () => {
    const user = userEvent.setup()
    const onLocaleChange = vi.fn()
    const { unmount } = render(
      <GuiMode
        onBackToTerminal={() => undefined}
        locale="en"
        onLocaleChange={onLocaleChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Switch language to Chinese/i }))
    expect(onLocaleChange).toHaveBeenCalledWith('zh')
    unmount()
    render(
      <GuiMode
        onBackToTerminal={() => undefined}
        locale="zh"
        onLocaleChange={onLocaleChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Switch language to English/i }))
    expect(onLocaleChange).toHaveBeenLastCalledWith('en')
  })
})
