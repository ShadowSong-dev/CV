import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** 一个快捷命令的定义 */
export interface QuickCommand {
  /** 显示在按钮上的标签 */
  label: string
  /** 点击时塞进命令行的字符串 */
  command: string
}

/** QuickCommands 的 Props */
interface QuickCommandsProps {
  /** 快捷按钮列表 */
  commands: QuickCommand[]
  /** 点击某个标签时触发 */
  onPick: (command: string) => void
  /** 透传 className */
  className?: string
}

/** 移动端友好的快捷命令标签列表 */
export function QuickCommands({
  commands,
  onPick,
  className,
}: QuickCommandsProps) {
  const { t } = useTranslation()
  return (
    <div
      role="toolbar"
      aria-label={t('terminal.ariaQuick')}
      className={cn(
        'flex flex-wrap gap-2 overflow-x-auto pb-1',
        className,
      )}
    >
      {commands.map((c) => (
        <button
          key={c.command}
          type="button"
          onClick={() => onPick(c.command)}
          className={cn(
            'shrink-0 rounded border border-border bg-surface px-2.5 py-1 text-xs text-accent-dim transition-colors',
            'hover:border-accent hover:text-accent',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'min-h-8 sm:min-h-9',
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
