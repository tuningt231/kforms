import { describe, it, expect } from 'vitest'
import { DateField } from '../src/fieldTypes/DateField.js'

class T extends DateField {
  set(v: Date | null) { this.setValue(v) }
}

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day)

const tomorrow = () => {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  t.setHours(0, 0, 0, 0)
  return t
}

const yesterday = () => {
  const t = new Date()
  t.setDate(t.getDate() - 1)
  t.setHours(0, 0, 0, 0)
  return t
}

describe('DateField — min', () => {
  it('пропускает дату на границе минимума', () => {
    const f = new T('D')
    f.min(d(2020, 1, 1))
    f.set(d(2020, 1, 1))
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает дату после минимума', () => {
    const f = new T('D')
    f.min(d(2020, 1, 1))
    f.set(d(2025, 6, 15))
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует дату до минимума', () => {
    const f = new T('D')
    f.min(d(2020, 1, 1))
    f.set(d(2019, 12, 31))
    expect(f.runAllChecks()).toBe(false)
  })

  it('поддерживает динамический min через функцию', () => {
    let boundary = d(2020, 6, 1)
    const f = new T('D')
    f.min(() => boundary)
    f.set(d(2020, 1, 1))
    expect(f.runAllChecks()).toBe(false)

    boundary = d(2019, 1, 1)
    expect(f.runAllChecks()).toBe(true)
  })
})

describe('DateField — max', () => {
  it('пропускает дату на границе максимума', () => {
    const f = new T('D')
    f.max(d(2030, 12, 31))
    f.set(d(2030, 12, 31))
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает дату до максимума', () => {
    const f = new T('D')
    f.max(d(2030, 12, 31))
    f.set(d(2025, 1, 1))
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует дату после максимума', () => {
    const f = new T('D')
    f.max(d(2025, 1, 1))
    f.set(d(2026, 1, 1))
    expect(f.runAllChecks()).toBe(false)
  })

  it('поддерживает динамический max через функцию', () => {
    let boundary = d(2025, 1, 1)
    const f = new T('D')
    f.max(() => boundary)
    f.set(d(2026, 1, 1))
    expect(f.runAllChecks()).toBe(false)

    boundary = d(2027, 1, 1)
    expect(f.runAllChecks()).toBe(true)
  })
})

describe('DateField — future', () => {
  it('пропускает дату в будущем', () => {
    const f = new T('D')
    f.future()
    f.set(tomorrow())
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует дату в прошлом', () => {
    const f = new T('D')
    f.future()
    f.set(yesterday())
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('DateField — past', () => {
  it('пропускает дату в прошлом', () => {
    const f = new T('D')
    f.past()
    f.set(yesterday())
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует дату в будущем', () => {
    const f = new T('D')
    f.past()
    f.set(tomorrow())
    expect(f.runAllChecks()).toBe(false)
  })
})
