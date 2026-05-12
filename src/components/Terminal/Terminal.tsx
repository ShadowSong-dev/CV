import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TerminalWindow } from './TerminalWindow'
import { TerminalOutput } from './TerminalOutput'
import { TerminalInput, type TerminalInputHandle } from './TerminalInput'
import { QuickCommands, type QuickCommand } from './QuickCommands'
import {
  COMPLETIONS,
  complete,
  runCommand,
  welcomeLines,
} from './commands'
import type { Locale, OutputLine, TerminalTheme } from './types'

/** Terminal 组件 Props */
interface TerminalProps {
  /** 当前主题 */
  theme: TerminalTheme
  /** 主题切换回调（由命令触发） */
  onThemeChange: (next: TerminalTheme) => void
  /** 当前语言；默认 en */
  locale?: Locale
  /** 语言切换回调（由命令触发） */
  onLocaleChange?: (next: Locale) => void
  /** 切到 GUI 模式 */
  onSwitchToGui: () => void
  /** 标题栏中的提示符 */
  title?: string
}

/** 移动端 / 桌面端共用的快捷命令列表 */
const QUICK_COMMANDS: QuickCommand[] = [
  { label: 'help', command: 'help' },
  { label: 'whoami', command: 'whoami' },
  { label: 'ls projects', command: 'ls projects' },
  { label: 'cat aye.md', command: 'cat aye.md' },
  { label: 'cat cv.md', command: 'cat cv.md' },
  { label: 'skills', command: 'skills' },
  { label: 'contact', command: 'contact' },
  { label: 'lang en', command: 'lang en' },
  { label: 'lang zh', command: 'lang zh' },
  { label: 'gui', command: 'gui' },
]

/** Terminal — 编排状态、命令执行、历史与快捷栏 */
export function Terminal({
  theme,
  onThemeChange,
  locale = 'en',
  onLocaleChange,
  onSwitchToGui,
  title,
}: TerminalProps) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('terminal.title')
  // 命令缓冲区与每行的 incremental id
  // 注：welcome 在「首次挂载」时按当时的 locale 生成；后续 lang 切换不重写历史
  const [lines, setLines] = useState<OutputLine[]>(() =>
    welcomeLines(locale).map((l, i) => ({ ...l, id: `boot-${i}` })),
  )
  const idRef = useRef(lines.length)

  // 输入框值
  const [input, setInput] = useState('')
  // 历史与历史游标用 ref 持有：不需要触发 re-render
  const historyRef = useRef<string[]>([])
  // -1 表示当前未浏览历史；0..n-1 为历史位置
  const historyIndexRef = useRef<number>(-1)

  // clear 命令通过 bumping 该 key 强制重置 reveal 动效
  const [revealKey, setRevealKey] = useState(0)

  // 终端窗体下方滚动容器引用 — 每次 lines 增长时滚到底
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [lines])

  // 输入命令式句柄
  const inputHandleRef = useRef<TerminalInputHandle>(null)

  /** 追加若干行到缓冲区，自动分配 id */
  const append = useCallback((newLines: Omit<OutputLine, 'id'>[]) => {
    if (newLines.length === 0) return
    setLines((prev) => {
      const next = [...prev]
      for (const l of newLines) {
        idRef.current += 1
        next.push({ ...l, id: `l-${idRef.current}` })
      }
      return next
    })
  }, [])

  /** 命令上下文 — 注入给命令的副作用入口 */
  const ctx = useMemo(
    () => ({
      setTheme: (t: TerminalTheme) => onThemeChange(t),
      clear: () => {
        setLines([])
        setRevealKey((k) => k + 1)
      },
      switchToGui: () => onSwitchToGui(),
      locale,
      setLocale: (l: Locale) => onLocaleChange?.(l),
    }),
    [onThemeChange, onSwitchToGui, locale, onLocaleChange],
  )

  /** 提交命令：echo + 执行 + 追加输出 + 更新历史 */
  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      // 先 echo 用户输入（即使为空也保留一行 echo 让它感觉真实）
      idRef.current += 1
      const echoLine: OutputLine = {
        id: `e-${idRef.current}`,
        prompt: resolvedTitle,
        segments: [{ text: raw }],
        immediate: true,
      }
      setLines((prev) => [...prev, echoLine])
      if (trimmed) {
        const h = historyRef.current
        if (h[h.length - 1] !== trimmed) h.push(trimmed)
      }
      historyIndexRef.current = -1
      setInput('')
      const result = runCommand(raw, ctx)
      append(result.lines)
    },
    [append, ctx, resolvedTitle],
  )

  /** ↑ 历史 */
  const onHistoryPrev = useCallback(() => {
    const h = historyRef.current
    if (h.length === 0) return
    const idx = historyIndexRef.current
    const next = idx === -1 ? h.length - 1 : Math.max(0, idx - 1)
    historyIndexRef.current = next
    setInput(h[next] ?? '')
  }, [])

  /** ↓ 历史 */
  const onHistoryNext = useCallback(() => {
    const h = historyRef.current
    if (h.length === 0) return
    const idx = historyIndexRef.current
    if (idx === -1) return
    const next = idx + 1
    if (next >= h.length) {
      historyIndexRef.current = -1
      setInput('')
      return
    }
    historyIndexRef.current = next
    setInput(h[next] ?? '')
  }, [])

  /** Tab 补全：同时把输入扩展为最长公共前缀，并把所有候选打印出来（多个时） */
  const onComplete = useCallback(() => {
    const { completed, candidates } = complete(input)
    if (completed !== input) {
      setInput(completed)
    }
    if (candidates.length > 1) {
      append([
        {
          segments: [{ text: candidates.join('  '), tone: 'muted' }],
          immediate: true,
        },
      ])
    }
  }, [append, input])

  /** 当用户点击空白时让命令行获得焦点 */
  const onSurfaceMouseDown = useCallback((e: React.MouseEvent) => {
    // 不要劫持点击链接 / 按钮
    const target = e.target as HTMLElement
    if (target.closest('a, button, input')) return
    inputHandleRef.current?.focus()
  }, [])

  return (
    <TerminalWindow title={resolvedTitle}>
      <div
        ref={scrollRef}
        onMouseDown={onSurfaceMouseDown}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-background px-4 pt-4 sm:px-6 sm:pt-6"
        data-testid="terminal-surface"
        data-theme-current={theme}
      >
        <TerminalOutput key={revealKey} lines={lines} />
        <div className="pb-3">
          <TerminalInput
            ref={inputHandleRef}
            value={input}
            onChange={setInput}
            onSubmit={submit}
            onHistoryPrev={onHistoryPrev}
            onHistoryNext={onHistoryNext}
            onComplete={onComplete}
            prompt={resolvedTitle}
            ariaLabel={t('terminal.ariaInput')}
          />
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-surface px-3 py-2 sm:px-4">
        <QuickCommands
          commands={QUICK_COMMANDS}
          onPick={(c) => {
            // 点击快捷标签 = 直接执行（submit 内部会 echo 命令、追加输出、清空输入并更新历史）
            submit(c)
            inputHandleRef.current?.focus()
          }}
        />
      </div>
    </TerminalWindow>
  )
}

/** 暴露候选项给可能的外部用例 / 测试 */
export { COMPLETIONS as TERMINAL_COMPLETIONS }
