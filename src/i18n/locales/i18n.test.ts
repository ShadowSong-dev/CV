import { describe, it, expect } from 'vitest'
import en from './en.json'
import zh from './zh.json'

type AnyObj = Record<string, unknown>

/** 把任意嵌套的 i18n 资源对象拍平成 "a.b.c" 路径 → 叶子值 */
function flatten(value: unknown, prefix = ''): Record<string, unknown> {
  // 数组与字符串/数字一样视为叶子节点（不深入），其它对象继续递归
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return { [prefix]: value }
  }
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(value as AnyObj)) {
    const child = (value as AnyObj)[k]
    const next = prefix ? `${prefix}.${k}` : k
    Object.assign(out, flatten(child, next))
  }
  return out
}

/** 叶子节点的类型标识 */
function leafType(v: unknown): 'string' | 'array' | 'other' {
  if (typeof v === 'string') return 'string'
  if (Array.isArray(v)) return 'array'
  return 'other'
}

/** 提取字符串中所有的 {{name}} 插值占位符（去重 + 排序） */
function placeholders(s: string): string[] {
  const set = new Set<string>()
  for (const m of s.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
    set.add(m[1])
  }
  return [...set].sort()
}

const enFlat = flatten(en)
const zhFlat = flatten(zh)

describe('i18n 双语对照', () => {
  it('en 与 zh 的键路径集合完全一致', () => {
    const enKeys = Object.keys(enFlat).sort()
    const zhKeys = Object.keys(zhFlat).sort()
    const onlyInEn = enKeys.filter((k) => !zhKeys.includes(k))
    const onlyInZh = zhKeys.filter((k) => !enKeys.includes(k))
    expect({ onlyInEn, onlyInZh }).toEqual({ onlyInEn: [], onlyInZh: [] })
  })

  it('对应键的值类型一致 (string vs array)', () => {
    const mismatches: { key: string; en: string; zh: string }[] = []
    for (const key of Object.keys(enFlat)) {
      const a = leafType(enFlat[key])
      const b = leafType(zhFlat[key])
      if (a !== b) mismatches.push({ key, en: a, zh: b })
    }
    expect(mismatches).toEqual([])
  })

  it('两种语言均无 "other" 类型 (只允许 string 或 string[])', () => {
    const bad: { key: string; lang: 'en' | 'zh'; type: string }[] = []
    for (const [key, v] of Object.entries(enFlat)) {
      if (leafType(v) === 'other') bad.push({ key, lang: 'en', type: typeof v })
    }
    for (const [key, v] of Object.entries(zhFlat)) {
      if (leafType(v) === 'other') bad.push({ key, lang: 'zh', type: typeof v })
    }
    expect(bad).toEqual([])
  })

  it('字符串数组里的每一项都是字符串', () => {
    const bad: { key: string; lang: 'en' | 'zh'; idx: number }[] = []
    const check = (src: Record<string, unknown>, lang: 'en' | 'zh') => {
      for (const [key, v] of Object.entries(src)) {
        if (!Array.isArray(v)) continue
        v.forEach((item, idx) => {
          if (typeof item !== 'string') bad.push({ key, lang, idx })
        })
      }
    }
    check(enFlat, 'en')
    check(zhFlat, 'zh')
    expect(bad).toEqual([])
  })

  it('字符串叶子的 {{占位符}} 在两种语言下集合一致', () => {
    const mismatches: { key: string; en: string[]; zh: string[] }[] = []
    for (const [key, eVal] of Object.entries(enFlat)) {
      const zVal = zhFlat[key]
      if (typeof eVal !== 'string' || typeof zVal !== 'string') continue
      const a = placeholders(eVal)
      const b = placeholders(zVal)
      if (a.join('|') !== b.join('|')) mismatches.push({ key, en: a, zh: b })
    }
    expect(mismatches).toEqual([])
  })

  it('两种语言下都不存在空字符串 / 仅空白的叶子', () => {
    const empties: { key: string; lang: 'en' | 'zh' }[] = []
    const visit = (src: Record<string, unknown>, lang: 'en' | 'zh') => {
      for (const [key, v] of Object.entries(src)) {
        if (typeof v === 'string' && v.trim() === '') empties.push({ key, lang })
        if (Array.isArray(v)) {
          v.forEach((item) => {
            if (typeof item === 'string' && item.trim() === '')
              empties.push({ key, lang })
          })
        }
      }
    }
    visit(enFlat, 'en')
    visit(zhFlat, 'zh')
    expect(empties).toEqual([])
  })
})
