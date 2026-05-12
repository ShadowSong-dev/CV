import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** TerminalWindow 的 Props */
interface TerminalWindowProps {
  /** title bar 中显示的提示符 */
  title: string
  /** 终端正文 */
  children: React.ReactNode
  /** 透传给最外层 div 的 className */
  className?: string
}

/** 模拟一个真实的终端窗口：左上角三个 macOS 圆点 + 顶部标题栏 */
export function TerminalWindow({
  title,
  children,
  className,
}: TerminalWindowProps) {
  const { t } = useTranslation()
  return (
    <div
      role="region"
      aria-label={t('terminal.ariaWindow')}
      className={cn(
        'flex h-dvh w-full flex-col overflow-hidden bg-background',
        'sm:h-dvh',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-2',
        )}
      >
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="block h-3 w-3 rounded-full bg-danger" />
          <span className="block h-3 w-3 rounded-full bg-warn" />
          <span className="block h-3 w-3 rounded-full bg-ok" />
        </div>
        <div className="flex-1 text-center text-xs text-muted sm:text-sm">
          <span className="text-accent-dim">{title}</span>
        </div>
        {/* 右侧占位，让标题视觉居中 */}
        <div className="w-13.5" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}
