import { describe, it, expect } from 'vitest'
import { NumberField } from '../src/fieldTypes/NumberField.js'

class T extends NumberField {
  set(v: number | null) { this.setValue(v) }
}

describe('NumberField — min', () => {
  it('пропускает значение на границе минимума', () => {
    const f = new T('N')
    f.min(0)
    f.set(0)
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает значение выше минимума', () => {
    const f = new T('N')
    f.min(0)
    f.set(5)
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение ниже минимума', () => {
    const f = new T('N')
    f.min(0)
    f.set(-1)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('NumberField — max', () => {
  it('пропускает значение на границе максимума', () => {
    const f = new T('N')
    f.max(100)
    f.set(100)
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает значение ниже максимума', () => {
    const f = new T('N')
    f.max(100)
    f.set(99)
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение выше максимума', () => {
    const f = new T('N')
    f.max(100)
    f.set(101)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('NumberField — between', () => {
  it('пропускает значение внутри диапазона', () => {
    const f = new T('N')
    f.between(1, 10)
    f.set(5)
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает значение на нижней границе', () => {
    const f = new T('N')
    f.between(1, 10)
    f.set(1)
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает значение на верхней границе', () => {
    const f = new T('N')
    f.between(1, 10)
    f.set(10)
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение ниже нижней границы', () => {
    const f = new T('N')
    f.between(1, 10)
    f.set(0)
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует значение выше верхней границы', () => {
    const f = new T('N')
    f.between(1, 10)
    f.set(11)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('NumberField — positive', () => {
  it('пропускает положительное значение', () => {
    const f = new T('N')
    f.positive()
    f.set(1)
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует ноль', () => {
    const f = new T('N')
    f.positive()
    f.set(0)
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует отрицательное значение', () => {
    const f = new T('N')
    f.positive()
    f.set(-5)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('NumberField — negative', () => {
  it('пропускает отрицательное значение', () => {
    const f = new T('N')
    f.negative()
    f.set(-1)
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует ноль', () => {
    const f = new T('N')
    f.negative()
    f.set(0)
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует положительное значение', () => {
    const f = new T('N')
    f.negative()
    f.set(5)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('NumberField — integer', () => {
  it('пропускает целое число', () => {
    const f = new T('N')
    f.integer()
    f.set(42)
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает отрицательное целое', () => {
    const f = new T('N')
    f.integer()
    f.set(-7)
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает ноль', () => {
    const f = new T('N')
    f.integer()
    f.set(0)
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует дробное число', () => {
    const f = new T('N')
    f.integer()
    f.set(3.14)
    expect(f.runAllChecks()).toBe(false)
  })
})
