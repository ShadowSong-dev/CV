import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n from '@/i18n'
import {
  COMMANDS,
  COMPLETIONS,
  THEMES,
  LOCALES,
  complete,
  parseInput,
  runCommand,
  welcomeLines,
} from './commands'
import type { CommandContext, OutputLine } from './types'

/** 把多行输出拍平成单个字符串，便于断言「包含某段文字」 */
function joinText(lines: Omit<OutputLine, 'id'>[]): string {
  return lines.flatMap((l) => l.segments.map((s) => s.text)).join(' ')
}

/** 构造一个带 spy 的 ctx，方便断言副作用 */
function makeCtx(locale: 'en' | 'zh' = 'en') {
  const setTheme = vi.fn()
  const clear = vi.fn()
  const switchToGui = vi.fn()
  const setLocale = vi.fn()
  const ctx: CommandContext = {
    setTheme,
    clear,
    switchToGui,
    locale,
    setLocale,
  }
  return { ctx, setTheme, clear, switchToGui, setLocale }
}

beforeEach(() => {
  // 让基于 useTranslation 的组件在不同测试间不串台
  void i18n.changeLanguage('en')
})

describe('commands · 常量', () => {
  it('THEMES 与 LOCALES 内容稳定', () => {
    expect(THEMES).toEqual(['green', 'amber', 'matrix'])
    expect(LOCALES).toEqual(['en', 'zh'])
  })

  it('COMPLETIONS 列出全部 14 个候选', () => {
    expect(COMPLETIONS).toHaveLength(14)
    expect(COMPLETIONS).toContain('help')
    expect(COMPLETIONS).toContain('ls projects')
    expect(COMPLETIONS).toContain('cat aye.md')
  })

  it('每个命令都有 summaryKey 且能从 i18n 取到非空文案', () => {
    for (const c of COMMANDS) {
      const enS = i18n.getFixedT('en')(c.summaryKey)
      const zhS = i18n.getFixedT('zh')(c.summaryKey)
      expect(enS, `${c.name} 在 en 下缺失`).not.toBe(c.summaryKey)
      expect(zhS, `${c.name} 在 zh 下缺失`).not.toBe(c.summaryKey)
      expect(enS.length).toBeGreaterThan(0)
      expect(zhS.length).toBeGreaterThan(0)
    }
  })
})

describe('parseInput', () => {
  it('空输入返回 def: null', () => {
    const r = parseInput('')
    expect(r.def).toBeNull()
  })

  it('单词命令', () => {
    const r = parseInput('help')
    if (r.def === null) throw new Error('expected match')
    expect(r.def.name).toBe('help')
    expect(r.args).toEqual([])
  })

  it('大小写无关 & 前后空白容错', () => {
    const r = parseInput('   HELP  ')
    expect(r.def?.name).toBe('help')
  })

  it('多词命令优先匹配 (ls projects)', () => {
    const r = parseInput('ls projects')
    if (r.def === null) throw new Error('expected match')
    expect(r.def.name).toBe('ls projects')
    expect(r.args).toEqual([])
  })

  it('多词命令 + 多余 args 时仍然命中并把剩余作为 args', () => {
    const r = parseInput('ls projects foo bar')
    if (r.def === null) throw new Error('expected match')
    expect(r.def.name).toBe('ls projects')
    expect(r.args).toEqual(['foo', 'bar'])
  })

  it('带参数命令: theme green', () => {
    const r = parseInput('theme green')
    if (r.def === null) throw new Error('expected match')
    expect(r.def.name).toBe('theme')
    expect(r.args).toEqual(['green'])
  })

  it('未知命令返回 def: null + raw', () => {
    const r = parseInput('nope')
    expect(r.def).toBeNull()
    if (r.def === null) expect(r.raw).toBe('nope')
  })
})

describe('complete (Tab 补全)', () => {
  it('唯一前缀直接补全到完整词', () => {
    const r = complete('hel')
    expect(r.completed).toBe('help')
    expect(r.candidates).toEqual([])
  })

  it('多个匹配项返回最长公共前缀 + 候选列表', () => {
    const r = complete('la')
    expect(r.completed.startsWith('lang')).toBe(true)
    expect(r.candidates).toEqual(['lang en', 'lang zh'])
  })

  it('无匹配返回原输入', () => {
    const r = complete('xxxxxx')
    expect(r.completed).toBe('xxxxxx')
    expect(r.candidates).toEqual([])
  })
})

describe('runCommand · 各分支', () => {
  it('空字符串不产出任何输出', () => {
    const { ctx } = makeCtx()
    const r = runCommand('   ', ctx)
    expect(r.lines).toEqual([])
  })

  it('未知命令在 en 下输出 "command not found" + "type \\"help\\""', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('xyz', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('command not found: xyz')
    expect(txt).toContain('type "help"')
  })

  it('未知命令在 zh 下使用中文提示', () => {
    const { ctx } = makeCtx('zh')
    const r = runCommand('xyz', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('命令未找到')
    expect(txt).toContain('xyz')
  })

  it('help 列出所有命令名 (按 padded name 出现)', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('help', ctx)
    const txt = joinText(r.lines)
    for (const c of COMMANDS) {
      const left = (c.usage ?? c.name).padEnd(22, ' ')
      expect(txt).toContain(left)
    }
  })

  it('whoami 在 en 下包含 "Ray Chen"', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('whoami', ctx)
    expect(joinText(r.lines)).toContain('Ray Chen')
  })

  it('whoami 在 zh 下包含 "陈瑞泰"', () => {
    const { ctx } = makeCtx('zh')
    const r = runCommand('whoami', ctx)
    expect(joinText(r.lines)).toContain('陈瑞泰')
  })

  it('ls projects 列出 aye.md 与 cv.md', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('ls projects', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('aye.md')
    expect(txt).toContain('cv.md')
  })

  it('cat aye.md 包含 ETHGlobal 链接 + summary 句', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('cat aye.md', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('ETHGlobal')
    expect(txt).toContain('safety layer')
  })

  it('cat cv.md 包含 React + Vite 描述', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('cat cv.md', ctx)
    expect(joinText(r.lines)).toContain('React + Vite')
  })

  it('skills 输出树形结构 (frontend/web3/contracts/...)', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('skills', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('frontend/')
    expect(txt).toContain('web3/')
    expect(txt).toContain('contracts/')
    expect(txt).toContain('ai/')
  })

  it('contact 输出 email 与 github 链接', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('contact', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('shadowsong.dev@gmail.com')
    expect(txt).toContain('github.com/ShadowSong-dev')
  })

  it('clear 调用 ctx.clear() 且无输出行', () => {
    const { ctx, clear } = makeCtx()
    const r = runCommand('clear', ctx)
    expect(clear).toHaveBeenCalledTimes(1)
    expect(r.lines).toEqual([])
  })

  it('theme (无参) 输出 usage', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('theme', ctx)
    expect(joinText(r.lines)).toContain('theme [green|amber|matrix]')
  })

  it('theme green 切换主题并回显 "theme → green"', () => {
    const { ctx, setTheme } = makeCtx('en')
    const r = runCommand('theme green', ctx)
    expect(setTheme).toHaveBeenCalledWith('green')
    expect(joinText(r.lines)).toContain('theme → green')
  })

  it('theme 未知值 → 不调用 setTheme 且报错', () => {
    const { ctx, setTheme } = makeCtx('en')
    const r = runCommand('theme blue', ctx)
    expect(setTheme).not.toHaveBeenCalled()
    expect(joinText(r.lines)).toContain('unknown theme: blue')
  })

  it('lang (无参) 在 en 下显示 usage + current: en', () => {
    const { ctx } = makeCtx('en')
    const r = runCommand('lang', ctx)
    const txt = joinText(r.lines)
    expect(txt).toContain('lang [en|zh]')
    expect(txt).toContain('en')
  })

  it('lang zh 调用 setLocale + 用「目标语言」回显', () => {
    const { ctx, setLocale } = makeCtx('en')
    const r = runCommand('lang zh', ctx)
    expect(setLocale).toHaveBeenCalledWith('zh')
    // 回显应使用 zh 的模板：「语言 → zh」
    expect(joinText(r.lines)).toContain('语言 → zh')
  })

  it('lang en 在 zh 上下文调用 setLocale + 用 en 回显', () => {
    const { ctx, setLocale } = makeCtx('zh')
    const r = runCommand('lang en', ctx)
    expect(setLocale).toHaveBeenCalledWith('en')
    expect(joinText(r.lines)).toContain('language → en')
  })

  it('lang 未知值 → 不调用 setLocale 且报错', () => {
    const { ctx, setLocale } = makeCtx('en')
    const r = runCommand('lang fr', ctx)
    expect(setLocale).not.toHaveBeenCalled()
    expect(joinText(r.lines)).toContain('unknown language: fr')
  })

  it('gui 调用 ctx.switchToGui 且回显进入提示', () => {
    const { ctx, switchToGui } = makeCtx('en')
    const r = runCommand('gui', ctx)
    expect(switchToGui).toHaveBeenCalledTimes(1)
    expect(joinText(r.lines)).toContain('launching')
  })
})

describe('welcomeLines', () => {
  it('en 下包含 CLI 标题与英文 greeting', () => {
    const txt = joinText(welcomeLines('en'))
    expect(txt).toContain('RayChen CLI v1.0.0')
    expect(txt).toContain('Welcome')
  })

  it('zh 下包含中文 CLI 标题与中文欢迎语', () => {
    const txt = joinText(welcomeLines('zh'))
    expect(txt).toContain('Ray CLI v1.0.0')
    expect(txt).toContain('欢迎')
  })

  it('提示行包含与当前语言相反的 lang 命令', () => {
    expect(joinText(welcomeLines('en'))).toContain('lang zh')
    expect(joinText(welcomeLines('zh'))).toContain('lang en')
  })
})
