import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Locale } from '@/components/Terminal/types'

/** GuiMode 的 Props */
interface GuiModeProps {
  /** 用户点击「返回终端」时回调 */
  onBackToTerminal: () => void
  /** 当前语言；默认 en */
  locale?: Locale
  /** 切换语言回调 */
  onLocaleChange?: (next: Locale) => void
}

/** 单条技能块 */
interface SkillGroup {
  /** 分组标题（小写、单词） */
  title: string
  /** 该分组下的具体条目 */
  items: string[]
}

/** 与终端 skills 命令同步的技能（技术名词无需翻译） */
const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'frontend',
    items: ['React', 'TypeScript', 'Vite', 'HTML / CSS', 'Tailwind · shadcn/ui'],
  },
  { title: 'web3', items: ['wagmi · viem', 'RainbowKit'] },
  {
    title: 'contracts',
    items: [
      'Solidity · Hardhat 3',
      'OpenZeppelin',
      'ERC-20 / 721 / 1155 · EIP-712',
    ],
  },
  { title: 'backend', items: ['Node.js · Express', 'REST API'] },
  { title: 'ai', items: ['Vercel AI SDK'] },
]

/** 项目卡片的外链（语言无关） */
const AYE_LINKS = [
  { label: 'ETHGlobal', href: 'https://ethglobal.com/showcase/aye-qd03w' },
  { label: 'GitHub', href: 'https://github.com/ShadowSong-dev/Aye' },
  { label: 'Demo', href: 'https://showcase-aye.vercel.app' },
  {
    label: 'Video',
    href: 'https://drive.google.com/file/d/1pHM0H8khq0TWMnU6aFYXiG-zSO07hBBY/view',
  },
]
const CV_LINKS = [
  { label: 'GitHub', href: 'https://github.com/ShadowSong-dev/CV' },
  { label: 'Demo', href: 'https://raychen.vercel.app' },
]

/** 简洁的图形界面兜底，给非技术读者看 */
export function GuiMode({
  onBackToTerminal,
  locale = 'en',
  onLocaleChange,
}: GuiModeProps) {
  // 始终按显式传入的 locale 取翻译，避免和 i18n 自身检测的语言错位
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(locale)
  const aboutParas = t('gui.aboutParas', { returnObjects: true }) as string[]
  const ayeDesc = t('gui.ayeProject.description', { returnObjects: true }) as string[]
  const cvDesc = t('gui.cvProject.description', { returnObjects: true }) as string[]

  const projects = [
    {
      title: t('gui.ayeProject.title'),
      subtitle: t('gui.ayeProject.subtitle'),
      description: ayeDesc,
      links: AYE_LINKS,
    },
    {
      title: t('gui.cvProject.title'),
      description: cvDesc,
      links: CV_LINKS,
    },
  ]

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header
        className={cn(
          'sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur sm:px-6',
        )}
      >
        <span className="font-mono text-sm text-accent-dim">{t('gui.brand')}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLocaleChange?.(locale === 'en' ? 'zh' : 'en')}
            className={cn(
              'rounded border border-border bg-surface-2 px-3 py-1.5 font-mono text-xs text-accent-dim transition-colors',
              'hover:border-accent hover:text-accent',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            )}
            aria-label={t('gui.langLabel')}
          >
            {t('gui.lang')}
          </button>
          <button
            type="button"
            onClick={onBackToTerminal}
            className={cn(
              'rounded border border-border bg-surface-2 px-3 py-1.5 font-mono text-xs text-accent-dim transition-colors',
              'hover:border-accent hover:text-accent',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            )}
            aria-label={t('gui.backLabel')}
          >
            {t('gui.back')}
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-12 sm:py-16">
        <section aria-labelledby="gui-name">
          <h1
            id="gui-name"
            className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            {t('gui.name')}
          </h1>
          <p className="mt-2 font-mono text-sm text-muted">{t('gui.tagline')}</p>
          <p className="mt-1 font-mono text-xs text-muted">{t('gui.education')}</p>
        </section>

        <section aria-labelledby="gui-bio" className="flex flex-col gap-3">
          <h2
            id="gui-bio"
            className="font-mono text-sm uppercase tracking-widest text-accent"
          >
            {t('gui.aboutTitle')}
          </h2>
          {aboutParas.map((p, i) => (
            <p
              key={i}
              className={cn(
                'font-mono leading-relaxed',
                i === 0 ? 'text-base text-foreground' : 'text-sm text-muted',
              )}
            >
              {p}
            </p>
          ))}
        </section>

        <section aria-labelledby="gui-skills" className="flex flex-col gap-3">
          <h2
            id="gui-skills"
            className="font-mono text-sm uppercase tracking-widest text-accent"
          >
            {t('gui.skillsTitle')}
          </h2>
          <ul className="grid gap-3 font-mono text-sm text-foreground sm:grid-cols-2">
            {SKILL_GROUPS.map((g) => (
              <li
                key={g.title}
                className="rounded border border-border bg-surface p-3"
              >
                <p className="text-xs uppercase tracking-widest text-accent-dim">
                  {g.title}
                </p>
                <ul className="mt-1 flex flex-col gap-1 text-foreground">
                  {g.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="gui-projects" className="flex flex-col gap-3">
          <h2
            id="gui-projects"
            className="font-mono text-sm uppercase tracking-widest text-accent"
          >
            {t('gui.projectsTitle')}
          </h2>
          <div className="flex flex-col gap-4">
            {projects.map((p) => (
              <article
                key={p.title}
                className="rounded border border-border bg-surface p-4"
              >
                <h3 className="font-mono text-base font-semibold text-foreground">
                  {p.title}
                </h3>
                {p.subtitle && (
                  <p className="mt-0.5 font-mono text-xs text-accent-dim">
                    {p.subtitle}
                  </p>
                )}
                {p.description.map((para, i) => (
                  <p
                    key={i}
                    className="mt-2 font-mono text-sm leading-relaxed text-muted"
                  >
                    {para}
                  </p>
                ))}
                <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs">
                  {p.links.map((l) => (
                    <a
                      key={l.href}
                      className="text-accent underline decoration-dotted underline-offset-4 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="gui-contact" className="flex flex-col gap-3">
          <h2
            id="gui-contact"
            className="font-mono text-sm uppercase tracking-widest text-accent"
          >
            {t('gui.contactTitle')}
          </h2>
          <ul className="flex flex-col gap-1 font-mono text-sm">
            <li>
              <span className="text-muted">{t('gui.emailLabel')}&nbsp;&nbsp;&nbsp;</span>
              <a
                className="text-accent underline decoration-dotted underline-offset-4"
                href="mailto:shadowsong.dev@gmail.com"
              >
                shadowsong.dev@gmail.com
              </a>
            </li>
            <li>
              <span className="text-muted">{t('gui.githubLabel')}&nbsp;&nbsp;</span>
              <a
                className="text-accent underline decoration-dotted underline-offset-4"
                href="https://github.com/ShadowSong-dev"
                target="_blank"
                rel="noreferrer noopener"
              >
                github.com/ShadowSong-dev
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
