import { describe, it, expect } from 'vitest'
import { SelectField } from '../src/fieldTypes/SelectField.js'
import { RadioField } from '../src/fieldTypes/RadioField.js'
import { CheckboxField } from '../src/fieldTypes/CheckboxField.js'

class TestSelect extends SelectField<string> {
  set(v: string | null) { this.setValue(v) }
}
class TestRadio extends RadioField<string> {
  set(v: string | null) { this.setValue(v) }
}
class TestCheckbox<T> extends CheckboxField<T> {
  set(v: T[]) { this.setValue(v) }
}

describe('SelectField — options', () => {
  it('принимает примитивные значения', () => {
    const f = new TestSelect('Select')
    f.options(['a', 'b', 'c'])
    expect(f.rendererOptions).toHaveLength(3)
    expect(f.rendererOptions[0]?.label).toBe('a')
    expect(f.rendererOptions[0]?.value).toBe('a')
  })

  it('принимает FieldOption объекты', () => {
    const f = new TestSelect('Select')
    f.options([{ value: 'a', label: 'Option A' }])
    expect(f.rendererOptions[0]?.value).toBe('a')
    expect(f.rendererOptions[0]?.label).toBe('Option A')
  })

  it('пропускает при установленном значении', () => {
    const f = new TestSelect('Select')
    f.options(['a', 'b'])
    f.set('a')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует обязательное поле без значения', () => {
    const f = new TestSelect('Select')
    f.options(['a', 'b']).required()
    f.set(null)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('RadioField — options', () => {
  it('принимает примитивные строковые значения', () => {
    const f = new TestRadio('Radio')
    f.options(['x', 'y'])
    expect(f.rendererOptions).toHaveLength(2)
    expect(f.rendererOptions[1]?.value).toBe('y')
  })

  it('принимает FieldOption объекты с кастомными метками', () => {
    const f = new TestRadio('Radio')
    f.options([{ value: 'yes', label: 'Да' }])
    expect(f.rendererOptions[0]?.label).toBe('Да')
  })

  it('пропускает обязательное поле при установленном значении', () => {
    const f = new TestRadio('Radio')
    f.options(['a', 'b']).required()
    f.set('a')
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует обязательное поле без значения', () => {
    const f = new TestRadio('Radio')
    f.options(['a', 'b']).required()
    f.set(null)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('CheckboxField — options', () => {
  it('принимает примитивные значения', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['x', 'y', 'z'])
    expect(f.rendererOptions).toHaveLength(3)
    expect(f.rendererOptions[0]?.label).toBe('x')
  })

  it('значение поля является массивом', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c'])
    f.set(['a', 'c'])
    expect(f.value).toEqual(['a', 'c'])
  })

  it('isEmpty возвращает true для пустого массива', () => {
    const f = new TestCheckbox<string>('CB')
    f.set([])
    expect(f.isEmpty()).toBe(true)
  })

  it('isEmpty возвращает false для непустого массива', () => {
    const f = new TestCheckbox<string>('CB')
    f.set(['a'])
    expect(f.isEmpty()).toBe(false)
  })
})

describe('CheckboxField — minSelected', () => {
  it('пропускает когда выбрано достаточно элементов', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).minSelected(2)
    f.set(['a', 'b'])
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает когда выбрано больше минимума', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).minSelected(2)
    f.set(['a', 'b', 'c'])
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует когда выбрано меньше минимума', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).minSelected(2)
    f.set(['a'])
    expect(f.runAllChecks()).toBe(false)
  })

  it('блокирует пустой массив при min > 0', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).minSelected(1)
    f.set([])
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('CheckboxField — maxSelected', () => {
  it('пропускает когда выбрано в пределах максимума', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).maxSelected(2)
    f.set(['a', 'b'])
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает когда выбрано меньше максимума', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).maxSelected(2)
    f.set(['a'])
    expect(f.runAllChecks()).toBe(true)
  })

  it('блокирует когда выбрано больше максимума', () => {
    const f = new TestCheckbox<string>('CB')
    f.options(['a', 'b', 'c']).maxSelected(2)
    f.set(['a', 'b', 'c'])
    expect(f.runAllChecks()).toBe(false)
  })
})
