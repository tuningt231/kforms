import { describe, it, expect } from 'vitest'
import { FileField } from '../src/fieldTypes/FileField.js'

class T extends FileField {
  setFile(v: File | File[] | null) { this.setValue(v) }
}

const makeFile = (name: string, type: string, sizeBytes: number): File => {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}

describe('FileField — multiple', () => {
  it('isMultiple возвращает false по умолчанию', () => {
    const f = new T('File')
    expect(f.isMultiple()).toBe(false)
  })

  it('isMultiple возвращает true после вызова multiple()', () => {
    const f = new T('File')
    f.multiple()
    expect(f.isMultiple()).toBe(true)
  })
})

describe('FileField — accept', () => {
  it('пропускает файл с допустимым MIME-типом', () => {
    const f = new T('File')
    f.accept(['image/png', 'image/jpeg'])
    f.setFile(makeFile('photo.png', 'image/png', 100))
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает второй допустимый тип', () => {
    const f = new T('File')
    f.accept(['image/png', 'image/jpeg'])
    f.setFile(makeFile('photo.jpg', 'image/jpeg', 100))
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует файл с недопустимым MIME-типом', () => {
    const f = new T('File')
    f.accept(['image/png'])
    f.setFile(makeFile('doc.pdf', 'application/pdf', 100))
    expect(f.runAllChecks()).toBe(false)
  })

  it('пропускает несколько файлов с допустимыми типами', () => {
    const f = new T('File')
    f.multiple().accept(['image/png', 'image/jpeg'])
    f.setFile([
      makeFile('a.png', 'image/png', 100),
      makeFile('b.jpg', 'image/jpeg', 200),
    ])
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует если хотя бы один файл из нескольких недопустимого типа', () => {
    const f = new T('File')
    f.multiple().accept(['image/png'])
    f.setFile([
      makeFile('a.png', 'image/png', 100),
      makeFile('b.pdf', 'application/pdf', 200),
    ])
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('FileField — maxSize', () => {
  it('пропускает файл в пределах лимита', () => {
    const f = new T('File')
    f.maxSize(1000)
    f.setFile(makeFile('small.txt', 'text/plain', 500))
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает файл точно на границе лимита', () => {
    const f = new T('File')
    f.maxSize(1000)
    f.setFile(makeFile('exact.txt', 'text/plain', 1000))
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует файл превышающий лимит', () => {
    const f = new T('File')
    f.maxSize(1000)
    f.setFile(makeFile('large.txt', 'text/plain', 1001))
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует если хотя бы один из нескольких файлов превышает лимит', () => {
    const f = new T('File')
    f.multiple().maxSize(500)
    f.setFile([
      makeFile('ok.txt', 'text/plain', 400),
      makeFile('big.txt', 'text/plain', 600),
    ])
    expect(f.runAllChecks()).toBe(false)
  })
})
