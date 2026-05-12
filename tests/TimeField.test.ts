import { describe, it, expect } from 'vitest'
import { TimeField } from '../src/fieldTypes/TimeField.js'

class T extends TimeField {
  set(v: string | null) { this.setValue(v) }
}

describe('TimeField — min', () => {
  it('пропускает время на границе минимума', () => {
    const f = new T('Time')
    f.min('09:00')
    f.set('09:00')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает время после минимума', () => {
    const f = new T('Time')
    f.min('09:00')
    f.set('12:30')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует время до минимума', () => {
    const f = new T('Time')
    f.min('09:00')
    f.set('08:59')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TimeField — max', () => {
  it('пропускает время на границе максимума', () => {
    const f = new T('Time')
    f.max('18:00')
    f.set('18:00')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает время до максимума', () => {
    const f = new T('Time')
    f.max('18:00')
    f.set('12:00')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует время после максимума', () => {
    const f = new T('Time')
    f.max('18:00')
    f.set('18:01')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TimeField — between', () => {
  it('пропускает время внутри диапазона', () => {
    const f = new T('Time')
    f.between('09:00', '18:00')
    f.set('12:00')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает время на нижней границе', () => {
    const f = new T('Time')
    f.between('09:00', '18:00')
    f.set('09:00')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает время на верхней границе', () => {
    const f = new T('Time')
    f.between('09:00', '18:00')
    f.set('18:00')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует время до нижней границы', () => {
    const f = new T('Time')
    f.between('09:00', '18:00')
    f.set('08:59')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует время после верхней границы', () => {
    const f = new T('Time')
    f.between('09:00', '18:00')
    f.set('18:01')
    expect(f.runAllChecks()).toBe(false)
  })
})
