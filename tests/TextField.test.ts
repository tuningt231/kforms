import { describe, it, expect } from 'vitest'
import { TextField } from '../src/fieldTypes/TextField.js'

class T extends TextField {
  set(v: string | null) { this.setValue(v) }
}

describe('TextField — minLength', () => {
  it('пропускает значение соответствующее минимуму', () => {
    const f = new T('F')
    f.minLength(3)
    f.set('abc')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает значение длиннее минимума', () => {
    const f = new T('F')
    f.minLength(3)
    f.set('abcd')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение короче минимума', () => {
    const f = new T('F')
    f.minLength(3)
    f.set('ab')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — maxLength', () => {
  it('пропускает значение в пределах максимума', () => {
    const f = new T('F')
    f.maxLength(5)
    f.set('hello')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает значение короче максимума', () => {
    const f = new T('F')
    f.maxLength(5)
    f.set('hi')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение длиннее максимума', () => {
    const f = new T('F')
    f.maxLength(3)
    f.set('toolong')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — length', () => {
  it('пропускает точную длину', () => {
    const f = new T('F')
    f.length(4)
    f.set('abcd')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует строку короче нужной длины', () => {
    const f = new T('F')
    f.length(4)
    f.set('abc')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует строку длиннее нужной длины', () => {
    const f = new T('F')
    f.length(4)
    f.set('abcde')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — match / pattern', () => {
  it('пропускает значение совпадающее с regex', () => {
    const f = new T('F')
    f.match(/^\d+$/)
    f.set('12345')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует значение не совпадающее с regex', () => {
    const f = new T('F')
    f.match(/^\d+$/)
    f.set('12abc')
    expect(f.runAllChecks()).toBe(false)
  })

  it('pattern() является псевдонимом match()', () => {
    const f = new T('F')
    f.pattern(/^[A-Z]+$/)
    f.set('ABC')
    expect(f.runAllChecks()).toBe(true)
    f.set('abc')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — notBlank', () => {
  it('пропускает непустую строку', () => {
    const f = new T('F')
    f.notBlank()
    f.set('hello')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует строку только из пробелов', () => {
    const f = new T('F')
    f.notBlank()
    f.set('   ')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует строку из табуляций и переносов', () => {
    const f = new T('F')
    f.notBlank()
    f.set('\t\n')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — contains', () => {
  it('пропускает когда строка содержит подстроку', () => {
    const f = new T('F')
    f.contains('@')
    f.set('user@example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует когда строка не содержит подстроку', () => {
    const f = new T('F')
    f.contains('@')
    f.set('userexample.com')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — startsWith', () => {
  it('пропускает когда строка начинается с префикса', () => {
    const f = new T('F')
    f.startsWith('https')
    f.set('https://example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует когда строка не начинается с префикса', () => {
    const f = new T('F')
    f.startsWith('https')
    f.set('http://example.com')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — endsWith', () => {
  it('пропускает когда строка заканчивается суффиксом', () => {
    const f = new T('F')
    f.endsWith('.com')
    f.set('example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует когда строка не заканчивается суффиксом', () => {
    const f = new T('F')
    f.endsWith('.com')
    f.set('example.org')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('TextField — numeric', () => {
  it('пропускает строку только из цифр', () => {
    const f = new T('F')
    f.numeric()
    f.set('12345')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует строку с точкой', () => {
    const f = new T('F')
    f.numeric()
    f.set('123.45')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует строку с буквами', () => {
    const f = new T('F')
    f.numeric()
    f.set('abc123')
    expect(f.runAllChecks()).toBe(false)
  })
})
