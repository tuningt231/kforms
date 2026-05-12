import { describe, it, expect } from 'vitest'
import { TextAreaField } from '../src/fieldTypes/TextAreaField.js'

class T extends TextAreaField {
  set(v: string | null) { this.setValue(v) }
}

describe('TextAreaField — minLength', () => {
  it('пропускает значение соответствующее минимуму', () => {
    const f = new T('Bio')
    f.minLength(5)
    f.set('hello')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение короче минимума', () => {
    const f = new T('Bio')
    f.minLength(10)
    f.set('Short')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextAreaField — maxLength', () => {
  it('пропускает значение в пределах максимума', () => {
    const f = new T('Bio')
    f.maxLength(20)
    f.set('Just right')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение превышающее максимум', () => {
    const f = new T('Bio')
    f.maxLength(5)
    f.set('Way too long string')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextAreaField — notBlank', () => {
  it('пропускает непустую строку', () => {
    const f = new T('Bio')
    f.notBlank()
    f.set('Some content')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует строку только из пробелов', () => {
    const f = new T('Bio')
    f.notBlank()
    f.set('   \n\t  ')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextAreaField — minWords', () => {
  it('пропускает когда количество слов соответствует минимуму', () => {
    const f = new T('Bio')
    f.minWords(3)
    f.set('one two three')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает когда слов больше минимума', () => {
    const f = new T('Bio')
    f.minWords(2)
    f.set('one two three four')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует когда слов меньше минимума', () => {
    const f = new T('Bio')
    f.minWords(3)
    f.set('one two')
    expect(f.runAllChecks()).toBe(false)
  })

  it('корректно считает слова с множественными пробелами', () => {
    const f = new T('Bio')
    f.minWords(2)
    f.set('word1   word2')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует одно слово при минимуме 2', () => {
    const f = new T('Bio')
    f.minWords(2)
    f.set('одно')
    expect(f.runAllChecks()).toBe(false)
  })
})
