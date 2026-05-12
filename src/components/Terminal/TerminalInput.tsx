import { useEffect, useImperativeHandle, useRef } from 'react'
import { cn } from '@/lib/utils'

/** TerminalInput 暴露给父组件的命令式句柄 */
export interface TerminalInputHandle {
  /** 让命令行获得焦点 */
  focus: () => void
}

/** TerminalInput 的 Props */
interface TerminalInputProps {
  /** 输入值（受控） */
  value: string
  /** 输入变化回调 */
  onChange: (next: string) => void
  /** 用户回车提交时触发 */
  onSubmit: (value: string) => void
  /** ↑ 取上一条历史命令 */
  onHistoryPrev: () => void
  /** ↓ 取下一条历史命令 */
  onHistoryNext: () => void
  /** Tab 自动补全 */
  onComplete: () => void
  /** 提示符文本 */
  prompt: string
  /** 命令式 ref（聚焦） */
  ref?: React.Ref<TerminalInputHandle>
  /** 输入框 aria-label，便于无障碍 */
  ariaLabel: string
}

/** 终端输入行：闪烁光标 + 历史 + Tab 补全 */
export function TerminalInput({
  value,
  onChange,
  onSubmit,
  onHistoryPrev,
  onHistoryNext,
  onComplete,
  prompt,
  ref,
  ariaLabel,
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  // 默认进入聚焦
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <form
      className="flex w-full items-center gap-2 font-mono text-sm sm:text-[15px]"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(value)
      }}
    >
      <label htmlFor="terminal-input" className="sr-only">
        {ariaLabel}
      </label>
      <span className="shrink-0 text-accent glow-accent" aria-hidden="true">
        {prompt}
      </span>
      <input
        id="terminal-input"
        ref={inputRef}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            onHistoryPrev()
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            onHistoryNext()
          } else if (e.key === 'Tab') {
            e.preventDefault()
            onComplete()
          }
        }}
        className={cn(
          'flex-1 border-0 bg-transparent p-0 text-foreground caret-accent outline-none',
          'focus:outline-none focus-visible:outline-none',
        )}
      />
    </form>
  )
}
