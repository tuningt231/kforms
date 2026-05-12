import { describe, it, expect } from 'vitest'
import { EmailField } from '../src/fieldTypes/EmailField.js'
import { TelField } from '../src/fieldTypes/TelField.js'
import { UrlField } from '../src/fieldTypes/UrlField.js'
import { ColorField } from '../src/fieldTypes/ColorField.js'

class TestEmail extends EmailField {
  set(v: string | null) { this.setValue(v) }
}
class TestTel extends TelField {
  set(v: string | null) { this.setValue(v) }
}
class TestUrl extends UrlField {
  set(v: string | null) { this.setValue(v) }
}
class TestColor extends ColorField {
  set(v: string | null) { this.setValue(v) }
}

describe('EmailField', () => {
  it('пропускает корректный email', () => {
    const f = new TestEmail('Email')
    f.set('user@example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает email с поддоменом', () => {
    const f = new TestEmail('Email')
    f.set('user@mail.example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует email без @', () => {
    const f = new TestEmail('Email')
    f.set('userexample.com')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует email без домена после @', () => {
    const f = new TestEmail('Email')
    f.set('user@')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует email без TLD', () => {
    const f = new TestEmail('Email')
    f.set('user@example')
    expect(f.runAllChecks()).toBe(false)
  })

  it('пропускает пустое значение (валидация не запускается)', () => {
    const f = new TestEmail('Email')
    f.set(null)
    expect(f.runAllChecks()).toBe(true)
  })
})

describe('TelField', () => {
  it('пропускает номер с +, пробелами, скобками и дефисами', () => {
    const f = new TestTel('Phone')
    f.set('+7 (999) 123-45-67')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает номер только из цифр', () => {
    const f = new TestTel('Phone')
    f.set('89991234567')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует номер с буквами', () => {
    const f = new TestTel('Phone')
    f.set('abc123')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует номер с символами @', () => {
    const f = new TestTel('Phone')
    f.set('+7@999')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('UrlField', () => {
  it('пропускает корректный https URL', () => {
    const f = new TestUrl('URL')
    f.set('https://example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает URL с путём и параметрами', () => {
    const f = new TestUrl('URL')
    f.set('https://example.com/path?q=1&lang=ru')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает http URL', () => {
    const f = new TestUrl('URL')
    f.set('http://example.com')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует строку без протокола', () => {
    const f = new TestUrl('URL')
    f.set('example.com')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует произвольную строку', () => {
    const f = new TestUrl('URL')
    f.set('not-a-url')
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('ColorField', () => {
  it('пропускает 6-значный hex в нижнем регистре', () => {
    const f = new TestColor('Color')
    f.set('#1a2b3c')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает 6-значный hex в верхнем регистре', () => {
    const f = new TestColor('Color')
    f.set('#AABBCC')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует 3-значный сокращённый hex', () => {
    const f = new TestColor('Color')
    f.set('#abc')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует hex без #', () => {
    const f = new TestColor('Color')
    f.set('aabbcc')
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует не-hex символы', () => {
    const f = new TestColor('Color')
    f.set('#zzzzzz')
    expect(f.runAllChecks()).toBe(false)
  })
})
