import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TerminalOutput } from './TerminalOutput'
import type { OutputLine } from './types'

const mk = (id: string, text: string, opts: Partial<OutputLine> = {}): OutputLine => ({
  id,
  segments: [{ text }],
  ...opts,
})

describe('TerminalOutput', () => {
  it('reducedMotion=true 时立即渲染所有非 immediate 行', () => {
    const lines: OutputLine[] = [
      mk('a', 'line A'),
      mk('b', 'line B'),
      mk('c', 'line C'),
    ]
    render(<TerminalOutput lines={lines} reducedMotion />)
    expect(screen.getByText('line A')).toBeInTheDocument()
    expect(screen.getByText('line B')).toBeInTheDocument()
    expect(screen.getByText('line C')).toBeInTheDocument()
    expect(screen.getAllByTestId('output-line')).toHaveLength(3)
  })

  it('immediate 行不受 stagger 影响 (一开始就显示)', () => {
    const lines: OutputLine[] = [
      mk('echo', 'echoed', { prompt: 'p$', immediate: true }),
    ]
    // 不传 reducedMotion，故意让动画启用；immediate 不应被推迟
    render(<TerminalOutput lines={lines} />)
    expect(screen.getByText('echoed')).toBeInTheDocument()
    expect(screen.getByText('p$')).toBeInTheDocument()
  })

  it('带 href 的段渲染为外部链接 (target=_blank, rel=noreferrer noopener)', () => {
    const lines: OutputLine[] = [
      {
        id: 'l',
        segments: [
          { text: 'home', href: 'https://example.com' },
        ],
      },
    ]
    render(<TerminalOutput lines={lines} reducedMotion />)
    const a = screen.getByRole('link', { name: 'home' })
    expect(a).toHaveAttribute('href', 'https://example.com')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('tone 决定 CSS 类: accent / muted / danger / warn', () => {
    const lines: OutputLine[] = [
      { id: '1', segments: [{ text: 'A', tone: 'accent' }] },
      { id: '2', segments: [{ text: 'M', tone: 'muted' }] },
      { id: '3', segments: [{ text: 'D', tone: 'danger' }] },
      { id: '4', segments: [{ text: 'W', tone: 'warn' }] },
    ]
    render(<TerminalOutput lines={lines} reducedMotion />)
    expect(screen.getByText('A')).toHaveClass('text-accent')
    expect(screen.getByText('M')).toHaveClass('text-muted')
    // danger / warn 使用 var(--color-*) 形式的 Tailwind 任意值类
    expect(screen.getByText('D').className).toContain('color-danger')
    expect(screen.getByText('W').className).toContain('color-warn')
  })

  it('外层带 role=log + aria-live=polite + i18n 化的 aria-label', () => {
    render(<TerminalOutput lines={[]} reducedMotion />)
    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(log.getAttribute('aria-label')).toMatch(/Terminal|终端/)
  })
})
