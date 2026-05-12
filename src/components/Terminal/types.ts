/** 可选的终端配色主题 */
export type TerminalTheme = 'green' | 'amber' | 'matrix'

/** 语言；默认 en */
export type Locale = 'en' | 'zh'

/** 一行终端输出由若干段组成；段可以是普通文字、强调文字或外链 */
export interface OutputSegment {
  /** 段内显示的文本 */
  text: string
  /** 视觉色调，默认沿用 foreground */
  tone?: 'default' | 'accent' | 'muted' | 'danger' | 'warn'
  /** 若提供则渲染为外部链接（带 rel="noreferrer noopener"） */
  href?: string
}

/** 一行终端输出 */
export interface OutputLine {
  /** React key 用 */
  id: string
  /** 渲染为前缀（例如 echo 用户输入命令时的提示符） */
  prompt?: string
  /** 文本段 */
  segments: OutputSegment[]
  /** 立即显示，不参与 staggered reveal（一般用于 echo 用户输入） */
  immediate?: boolean
}

/** 命令运行时可使用的副作用入口 */
export interface CommandContext {
  /** 切换主题 */
  setTheme: (theme: TerminalTheme) => void
  /** 清屏 */
  clear: () => void
  /** 切换到 GUI 兜底界面 */
  switchToGui: () => void
  /** 当前语言 */
  locale: Locale
  /** 切换语言 */
  setLocale: (locale: Locale) => void
}

/** 命令的标准化执行结果 */
export interface CommandResult {
  /** 追加到输出区的文本行（不带 id，注入时由调用方分配） */
  lines: Omit<OutputLine, 'id'>[]
}

/** 命令定义 */
export interface CommandDef {
  /** 用户输入的命令字符串（小写、可包含空格，如 "ls projects"） */
  name: string
  /** help 中显示的简介对应的 i18n 键（如 "summaries.help"） */
  summaryKey: string
  /** 可选用法提示 */
  usage?: string
  /** 执行命令 */
  run: (args: string[], ctx: CommandContext) => CommandResult
}
