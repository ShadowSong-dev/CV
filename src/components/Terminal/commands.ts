import i18n from '@/i18n'
import type {
  CommandContext,
  CommandDef,
  CommandResult,
  Locale,
  OutputLine,
  OutputSegment,
  TerminalTheme,
} from './types'

/** 主题白名单，单一来源 */
export const THEMES: TerminalTheme[] = ['green', 'amber', 'matrix']

/** 支持的语言白名单 */
export const LOCALES: Locale[] = ['en', 'zh']

/** 简化构造一行输出 */
function line(
  segments: OutputSegment[] | string,
  opts: Partial<Omit<OutputLine, 'id' | 'segments'>> = {},
): Omit<OutputLine, 'id'> {
  const segs: OutputSegment[] =
    typeof segments === 'string' ? [{ text: segments }] : segments
  return { segments: segs, ...opts }
}

/** 单纯空行，用于排版 */
const blank = (): Omit<OutputLine, 'id'> => line('')

/** 取得 locale 固定的 t 函数；i18n 在 main.tsx 已同步初始化 */
function tFor(locale: Locale) {
  return i18n.getFixedT(locale)
}

/** 读取数组型 i18n 资源 */
function tArr(locale: Locale, key: string): string[] {
  return tFor(locale)(key, { returnObjects: true }) as unknown as string[]
}

/** help 命令 */
const helpCommand: CommandDef = {
  name: 'help',
  summaryKey: 'summaries.help',
  run: (_args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    const rows = COMMANDS.map((c) => {
      const left = c.usage ?? c.name
      return line([
        { text: '  ' },
        { text: left.padEnd(22, ' '), tone: 'accent' },
        { text: t(c.summaryKey), tone: 'muted' },
      ])
    })
    const tip = [
      { text: t('help.tipPrefix'), tone: 'muted' as const },
      { text: '↑/↓ ', tone: 'accent' as const },
      { text: t('help.tipHistory'), tone: 'muted' as const },
      { text: 'Tab ', tone: 'accent' as const },
      { text: t('help.tipComplete'), tone: 'muted' as const },
      { text: 'Enter ', tone: 'accent' as const },
      { text: t('help.tipRun'), tone: 'muted' as const },
    ]
    return {
      lines: [
        line([{ text: t('help.header'), tone: 'accent' }]),
        ...rows,
        blank(),
        line(tip),
      ],
    }
  },
}

/** whoami — 个人简介 */
const whoamiCommand: CommandDef = {
  name: 'whoami',
  summaryKey: 'summaries.whoami',
  run: (_args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    const bio = tArr(ctx.locale, 'whoami.bio')
    return {
      lines: [
        line([{ text: t('whoami.name'), tone: 'accent' }]),
        line([{ text: t('whoami.role'), tone: 'muted' }]),
        blank(),
        line(t('whoami.education')),
        line(t('whoami.experience')),
        blank(),
        ...bio.map((s) => line(s)),
        blank(),
        line([
          { text: t('whoami.englishLabel'), tone: 'muted' },
          { text: t('whoami.englishValue'), tone: 'accent' },
        ]),
      ],
    }
  },
}

/** ls projects 命令 */
const lsCommand: CommandDef = {
  name: 'ls projects',
  summaryKey: 'summaries.lsProjects',
  usage: 'ls projects',
  run: (_args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    const hint = [
      { text: t('ls.hintPrefix'), tone: 'muted' as const },
      { text: t('ls.hintCmd'), tone: 'accent' as const },
      { text: t('ls.hintSuffix'), tone: 'muted' as const },
    ]
    return {
      lines: [
        line([
          { text: 'aye.md', tone: 'accent' },
          { text: '   ', tone: 'muted' },
          { text: t('ls.ayeDesc'), tone: 'muted' },
        ]),
        line([
          { text: 'cv.md ', tone: 'accent' },
          { text: '   ', tone: 'muted' },
          { text: t('ls.cvDesc'), tone: 'muted' },
        ]),
        blank(),
        line(hint),
      ],
    }
  },
}

/** Aye 项目的外链 — 语言无关 */
const AYE_LINKS: Omit<OutputLine, 'id'>[] = [
  line([
    { text: '  · ETHGlobal  ', tone: 'muted' },
    {
      text: 'https://ethglobal.com/showcase/aye-qd03w',
      href: 'https://ethglobal.com/showcase/aye-qd03w',
    },
  ]),
  line([
    { text: '  · GitHub    ', tone: 'muted' },
    {
      text: 'github.com/ShadowSong-dev/Aye',
      href: 'https://github.com/ShadowSong-dev/Aye',
    },
  ]),
  line([
    { text: '  · Demo      ', tone: 'muted' },
    {
      text: 'showcase-aye.vercel.app',
      href: 'https://showcase-aye.vercel.app',
    },
  ]),
  line([
    { text: '  · Video     ', tone: 'muted' },
    {
      text: 'drive.google.com/.../view',
      href: 'https://drive.google.com/file/d/1pHM0H8khq0TWMnU6aFYXiG-zSO07hBBY/view',
    },
  ]),
]

/** CV 项目的外链 — 语言无关 */
const CV_LINKS: Omit<OutputLine, 'id'>[] = [
  line([
    { text: '  · GitHub  ', tone: 'muted' },
    {
      text: 'github.com/ShadowSong-dev/CV',
      href: 'https://github.com/ShadowSong-dev/CV',
    },
  ]),
  line([
    { text: '  · Demo    ', tone: 'muted' },
    {
      text: 'raychen.vercel.app',
      href: 'https://raychen.vercel.app',
    },
  ]),
]

/** cat aye.md 命令 */
const catAyeCommand: CommandDef = {
  name: 'cat aye.md',
  summaryKey: 'summaries.catAye',
  usage: 'cat aye.md',
  run: (_args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    const intro = tArr(ctx.locale, 'aye.introLines')
    const coreLines = tArr(ctx.locale, 'aye.coreLines')
    const frontendLines = tArr(ctx.locale, 'aye.frontendLines')

    // 把多行说明以「首行带前缀点」「后续行缩进」的结构组合
    const coreBlock: Omit<OutputLine, 'id'>[] = [
      line([
        { text: '  · ', tone: 'muted' },
        { text: t('aye.coreLabel'), tone: 'accent' },
        { text: coreLines[0] ?? '', tone: 'muted' },
      ]),
      ...coreLines.slice(1).map((s) =>
        line([{ text: s, tone: 'muted' }]),
      ),
    ]

    const frontendBlock: Omit<OutputLine, 'id'>[] = [
      line([
        { text: '  · ', tone: 'muted' },
        { text: t('aye.frontendLabel'), tone: 'accent' },
        { text: frontendLines[0] ?? '', tone: 'muted' },
      ]),
      ...frontendLines.slice(1).map((s) =>
        line([{ text: s, tone: 'muted' }]),
      ),
    ]

    return {
      lines: [
        line([{ text: t('aye.title'), tone: 'accent' }]),
        line([{ text: t('aye.subtitle'), tone: 'muted' }]),
        blank(),
        ...intro.map((s) => line(s)),
        blank(),
        ...coreBlock,
        line([
          { text: '  · ', tone: 'muted' },
          { text: t('aye.contractsLabel'), tone: 'accent' },
          { text: t('aye.contractsSuffix'), tone: 'muted' },
        ]),
        ...frontendBlock,
        blank(),
        line([{ text: t('aye.summary'), tone: 'accent' }]),
        blank(),
        line([{ text: t('aye.linksHeading'), tone: 'accent' }]),
        ...AYE_LINKS,
      ],
    }
  },
}

/** cat cv.md 命令 */
const catCvCommand: CommandDef = {
  name: 'cat cv.md',
  summaryKey: 'summaries.catCv',
  usage: 'cat cv.md',
  run: (_args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    return {
      lines: [
        line([{ text: t('cv.title'), tone: 'accent' }]),
        blank(),
        line(t('cv.body')),
        blank(),
        line([{ text: t('cv.linksHeading'), tone: 'accent' }]),
        ...CV_LINKS,
      ],
    }
  },
}

/** skills — 树状显示技术栈（专有名词无需翻译） */
const skillsCommand: CommandDef = {
  name: 'skills',
  summaryKey: 'summaries.skills',
  run: (): CommandResult => ({
    lines: [
      line([{ text: 'skills/', tone: 'accent' }]),
      line('├── frontend/'),
      line('│   ├── React · TypeScript'),
      line('│   ├── Vite · HTML · CSS'),
      line('│   └── Tailwind · shadcn/ui'),
      line('├── web3/'),
      line('│   ├── wagmi · viem'),
      line('│   └── RainbowKit'),
      line('├── contracts/'),
      line('│   ├── Solidity · Hardhat 3'),
      line('│   ├── OpenZeppelin'),
      line('│   └── ERC-20 / 721 / 1155 · EIP-712'),
      line('├── backend/'),
      line('│   ├── Node.js · Express'),
      line('│   └── REST API'),
      line('└── ai/'),
      line('    └── Vercel AI SDK'),
    ],
  }),
}

/** contact 命令 */
const contactCommand: CommandDef = {
  name: 'contact',
  summaryKey: 'summaries.contact',
  run: (): CommandResult => ({
    lines: [
      line([
        { text: 'email   ', tone: 'muted' },
        {
          text: 'shadowsong.dev@gmail.com',
          href: 'mailto:shadowsong.dev@gmail.com',
        },
      ]),
      line([
        { text: 'github  ', tone: 'muted' },
        {
          text: 'github.com/ShadowSong-dev',
          href: 'https://github.com/ShadowSong-dev',
        },
      ]),
    ],
  }),
}

/** clear 命令 — 副作用清空缓冲区 */
const clearCommand: CommandDef = {
  name: 'clear',
  summaryKey: 'summaries.clear',
  run: (_args, ctx): CommandResult => {
    ctx.clear()
    return { lines: [] }
  },
}

/** theme 命令 */
const themeCommand: CommandDef = {
  name: 'theme',
  summaryKey: 'summaries.theme',
  usage: 'theme [green|amber|matrix]',
  run: (args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    const next = args[0] as TerminalTheme | undefined
    if (!next) {
      return {
        lines: [
          line([
            { text: t('theme.usagePrefix'), tone: 'muted' },
            { text: t('theme.usageCmd'), tone: 'accent' },
          ]),
        ],
      }
    }
    if (!THEMES.includes(next)) {
      return {
        lines: [
          line([
            { text: `${t('theme.unknownPrefix')}${next}`, tone: 'danger' },
            { text: '   ', tone: 'muted' },
            { text: t('theme.options'), tone: 'muted' },
          ]),
        ],
      }
    }
    ctx.setTheme(next)
    return {
      lines: [
        line([
          { text: t('theme.confirm', { target: next }), tone: 'accent' },
        ]),
      ],
    }
  },
}

/** lang 命令 — 切换 UI 语言 */
const langCommand: CommandDef = {
  name: 'lang',
  summaryKey: 'summaries.lang',
  usage: 'lang [en|zh]',
  run: (args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    const raw = args[0]?.toLowerCase()
    if (!raw) {
      return {
        lines: [
          line([
            { text: t('lang.usagePrefix'), tone: 'muted' },
            { text: t('lang.usageCmd'), tone: 'accent' },
          ]),
          line([
            { text: t('lang.currentPrefix'), tone: 'muted' },
            { text: ctx.locale, tone: 'accent' },
          ]),
        ],
      }
    }
    if (!LOCALES.includes(raw as Locale)) {
      return {
        lines: [
          line([
            { text: `${t('lang.unknownPrefix')}${raw}`, tone: 'danger' },
            { text: '   ', tone: 'muted' },
            { text: t('lang.options'), tone: 'muted' },
          ]),
        ],
      }
    }
    const next = raw as Locale
    ctx.setLocale(next)
    // 用目标语言显示确认信息，让切换的反馈与新语言一致
    const tNext = tFor(next)
    return {
      lines: [
        line([
          { text: tNext('lang.confirm', { target: next }), tone: 'accent' },
        ]),
      ],
    }
  },
}

/** gui 命令 — 切换到图形界面兜底模式 */
const guiCommand: CommandDef = {
  name: 'gui',
  summaryKey: 'summaries.gui',
  run: (_args, ctx): CommandResult => {
    const t = tFor(ctx.locale)
    ctx.switchToGui()
    return {
      lines: [
        line([{ text: t('guiCommand.launching'), tone: 'accent' }]),
      ],
    }
  },
}

/** 命令注册表 — 顺序即 help 中的展示顺序 */
export const COMMANDS: CommandDef[] = [
  helpCommand,
  whoamiCommand,
  lsCommand,
  catAyeCommand,
  catCvCommand,
  skillsCommand,
  contactCommand,
  clearCommand,
  themeCommand,
  langCommand,
  guiCommand,
]

/** 用于 Tab 补全的完整候选项 */
export const COMPLETIONS: string[] = [
  'help',
  'whoami',
  'ls projects',
  'cat aye.md',
  'cat cv.md',
  'skills',
  'contact',
  'clear',
  'theme green',
  'theme amber',
  'theme matrix',
  'lang en',
  'lang zh',
  'gui',
]

/** 解析输入行；返回匹配的命令与 args；不区分大小写、首尾空白 */
export function parseInput(
  raw: string,
): { def: CommandDef; args: string[] } | { def: null; raw: string } {
  const trimmed = raw.trim().replace(/\s+/g, ' ').toLowerCase()
  if (!trimmed) return { def: null, raw }
  // 优先匹配带空格的多词命令（如 "ls projects" / "cat aye.md"）
  const multi = COMMANDS.filter((c) => c.name.includes(' ')).find((c) =>
    trimmed === c.name || trimmed.startsWith(`${c.name} `),
  )
  if (multi) {
    const rest = trimmed.slice(multi.name.length).trim()
    return { def: multi, args: rest ? rest.split(' ') : [] }
  }
  const [head, ...rest] = trimmed.split(' ')
  const def = COMMANDS.find((c) => !c.name.includes(' ') && c.name === head)
  if (!def) return { def: null, raw }
  return { def, args: rest }
}

/** 执行单条命令并返回输出 */
export function runCommand(raw: string, ctx: CommandContext): CommandResult {
  const parsed = parseInput(raw)
  if (parsed.def === null) {
    if (!raw.trim()) return { lines: [] }
    const t = tFor(ctx.locale)
    return {
      lines: [
        line([
          { text: `${t('errors.notFound')}${parsed.raw.trim()}`, tone: 'danger' },
          { text: '   ', tone: 'muted' },
          { text: t('errors.typeHelp'), tone: 'muted' },
        ]),
      ],
    }
  }
  return parsed.def.run(parsed.args, ctx)
}

/**
 * Tab 补全：返回最长公共前缀及候选项列表
 * - 如果有唯一匹配，返回 { completed: full, candidates: [] }
 * - 多个匹配，返回 { completed: longestCommonPrefix, candidates: [...] }
 * - 无匹配返回原值
 */
export function complete(
  input: string,
): { completed: string; candidates: string[] } {
  const lower = input.toLowerCase()
  const matches = COMPLETIONS.filter((c) => c.startsWith(lower))
  if (matches.length === 0) return { completed: input, candidates: [] }
  if (matches.length === 1) return { completed: matches[0], candidates: [] }
  // 多个匹配 — 计算最长公共前缀
  let prefix = matches[0]
  for (const m of matches) {
    while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1)
    if (!prefix) break
  }
  return {
    completed: prefix.length > input.length ? prefix : input,
    candidates: matches,
  }
}

/** 欢迎语（按当前语言）— 在 Terminal 启动时注入 */
export function welcomeLines(locale: Locale = 'en'): Omit<OutputLine, 'id'>[] {
  const t = tFor(locale)
  return [
    line([{ text: t('welcome.cliTitle'), tone: 'accent' }]),
    blank(),
    line(t('welcome.greeting')),
    line([
      { text: t('welcome.tipType'), tone: 'muted' },
      { text: 'help', tone: 'accent' },
      { text: t('welcome.tipForAll'), tone: 'muted' },
      { text: 'whoami', tone: 'accent' },
      { text: t('welcome.tipForBio'), tone: 'muted' },
      { text: t('welcome.tipLangCmd'), tone: 'accent' },
      { text: t('welcome.tipLangSuffix'), tone: 'muted' },
    ]),
    blank(),
  ]
}
