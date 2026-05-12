import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { OutputLine, OutputSegment } from './types'

/** TerminalOutput 的 Props */
interface TerminalOutputProps {
  /** 当前缓冲区的所有行 */
  lines: OutputLine[]
  /** 行间隔（ms），默认 80ms */
  staggerMs?: number
  /** 测试 / 减少动效场景下立即展示全部行 */
  reducedMotion?: boolean
}

/** 检测用户是否要求减少动效；override 为 undefined 时回落到系统媒体查询 */
function usePrefersReducedMotion(override?: boolean): boolean {
  const [systemReduced, setSystemReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setSystemReduced(mql.matches)
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])
  return override ?? systemReduced
}

/** 当 lines 增多时，每 staggerMs 揭示一行；immediate=true 时直接揭示全部 */
function useRevealedCount(
  total: number,
  staggerMs: number,
  immediate: boolean,
): number {
  const [revealed, setRevealed] = useState(immediate ? total : 0)
  useEffect(() => {
    if (immediate) return
    if (revealed >= total) return
    const timer = window.setTimeout(() => {
      setRevealed((n) => Math.min(n + 1, total))
    }, staggerMs)
    return () => window.clearTimeout(timer)
  }, [total, revealed, staggerMs, immediate])
  // 当 immediate=true 时让父组件感受到 total 的真实值，避免外层依赖错位
  return immediate ? total : revealed
}

/** 渲染一段文本，可选 link */
function Segment({ segment }: { segment: OutputSegment }) {
  const toneClass =
    segment.tone === 'accent'
      ? 'text-accent'
      : segment.tone === 'muted'
        ? 'text-muted'
        : segment.tone === 'danger'
          ? 'text-[var(--color-danger)]'
          : segment.tone === 'warn'
            ? 'text-[var(--color-warn)]'
            : 'text-foreground'
  if (segment.href) {
    return (
      <a
        href={segment.href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          'underline decoration-dotted underline-offset-4 hover:text-accent focus:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          toneClass !== 'text-muted' && toneClass,
        )}
      >
        {segment.text}
      </a>
    )
  }
  return <span className={toneClass}>{segment.text}</span>
}

/** 终端输出区 — 包含 staggered 揭示与无障碍标签 */
export function TerminalOutput({
  lines,
  staggerMs = 80,
  reducedMotion,
}: TerminalOutputProps) {
  const { t } = useTranslation()
  const prefersReduced = usePrefersReducedMotion(reducedMotion)
  // 立即行（用户回显的命令）总是先展示，普通行依次 80ms 揭示
  const animatedTotal = useMemo(
    () => lines.filter((l) => !l.immediate).length,
    [lines],
  )
  const revealedAnimated = useRevealedCount(
    animatedTotal,
    staggerMs,
    prefersReduced,
  )

  // 把每一行的「可见性」按动画行的 0-based 序号比对 revealedAnimated 计算出来；
  // 写法刻意采用纯函数式，不在渲染期间复用可变变量。
  const visibilities = useMemo(() => {
    // ordinal[i]: 非立即行的全局序号；立即行为 -1。O(n²) 但行数极小。
    const ordinal = lines.map((l, i) =>
      l.immediate ? -1 : lines.slice(0, i).filter((x) => !x.immediate).length,
    )
    return lines.map((l, i) =>
      l.immediate ? true : ordinal[i] < revealedAnimated,
    )
  }, [lines, revealedAnimated])

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label={t('terminal.ariaOutput')}
      className="flex flex-col gap-0 whitespace-pre-wrap wrap-break-word text-sm leading-6 sm:text-[15px]"
    >
      {lines.map((l, i) => {
        if (!visibilities[i]) return null
        return (
          <div
            key={l.id}
            data-testid="output-line"
            className="min-h-6 font-mono"
          >
            {l.prompt && (
              <span className="mr-2 text-accent glow-accent">{l.prompt}</span>
            )}
            {l.segments.map((s, idx) => (
              <Segment key={idx} segment={s} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
