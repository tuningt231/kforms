import { describe, it, expect, vi } from 'vitest'
import { TextField } from '../src/fieldTypes/TextField.js'

// Открываем protected setValue для тестирования логики без DOM
class T extends TextField {
  set(v: string | null) { this.setValue(v) }
}

describe('Field — required / requiredWhen', () => {
  it('блокирует пустое поле с required()', () => {
    const f = new T('Name')
    f.required('Обязательно')
    f.set(null)
    expect(f.runAllChecks()).toBe(false)
  })

  it('пропускает непустое обязательное поле', () => {
    const f = new T('Name')
    f.required()
    f.set('Alice')
    expect(f.runAllChecks()).toBe(true)
  })

  it('пропускает пустое необязательное поле', () => {
    const f = new T('Name')
    f.set(null)
    expect(f.runAllChecks()).toBe(true)
  })

  it('requiredWhen переоценивается при каждой проверке', () => {
    let condition = false
    const f = new T('Name')
    f.requiredWhen(() => condition)
    f.set(null)

    expect(f.runAllChecks()).toBe(true)
    condition = true
    expect(f.runAllChecks()).toBe(false)
  })

  it('несколько requiredWhen — все должны выполняться', () => {
    const f = new T('Name')
    f.requiredWhen(() => false)
    f.requiredWhen(() => true)
    f.set(null)
    expect(f.runAllChecks()).toBe(false)
  })
})

describe('Field — validate', () => {
  it('принимает валидатор возвращающий boolean', () => {
    const f = new T('Name')
    f.validate(v => v.length > 2)
    f.set('ab')
    expect(f.runAllChecks()).toBe(false)
    f.set('abc')
    expect(f.runAllChecks()).toBe(true)
  })

  it('принимает валидатор возвращающий объект {isValid, message}', () => {
    const f = new T('Name')
    f.validate(v => ({ isValid: v.length > 2, message: 'Слишком коротко' }))
    f.set('ab')
    expect(f.runAllChecks()).toBe(false)
  })

  it('цепочка валидаторов останавливается на первой ошибке', () => {
    const second = vi.fn(() => true)
    const f = new T('Name')
    f.validate(() => false).validate(second)
    f.set('abc')
    f.runAllChecks()
    expect(second).not.toHaveBeenCalled()
  })

  it('валидаторы не вызываются для пустого значения', () => {
    const validator = vi.fn(() => true)
    const f = new T('Name')
    f.validate(validator)
    f.set(null)
    f.runAllChecks()
    expect(validator).not.toHaveBeenCalled()
  })
})

describe('Field — transform', () => {
  it('применяет одну трансформацию в runTransforms', () => {
    const f = new T('Name')
    f.transform(v => (v as string).trim())
    f.set('  hello  ')
    expect(f.runTransforms()).toBe('hello')
  })

  it('применяет цепочку трансформаций по порядку', () => {
    const f = new T('Name')
    f.transform(v => (v as string).trim())
      .transform(v => (v as string).toUpperCase())
    f.set('  hello  ')
    expect(f.runTransforms()).toBe('HELLO')
  })

  it('без трансформаций возвращает исходное значение', () => {
    const f = new T('Name')
    f.set('hello')
    expect(f.runTransforms()).toBe('hello')
  })
})

describe('Field — dependsOn', () => {
  it('вызывает runAllChecks при изменении зависимости', () => {
    const source = new T('Source')
    const dependent = new T('Dependent')
    dependent.dependsOn(source)

    const spy = vi.spyOn(dependent, 'runAllChecks')
    source.set('changed')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('поддерживает несколько зависимостей', () => {
    const a = new T('A')
    const b = new T('B')
    const dependent = new T('Dep')
    dependent.dependsOn(a, b)

    const spy = vi.spyOn(dependent, 'runAllChecks')
    a.set('x')
    b.set('y')
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('переоценивает условный required при смене зависимости', () => {
    const source = new T('Source')
    const dependent = new T('Dependent')
    dependent.requiredWhen(() => source.value === 'trigger')
    dependent.dependsOn(source)
    dependent.set(null)

    expect(dependent.runAllChecks()).toBe(true)
    source.set('trigger')
    expect(dependent.runAllChecks()).toBe(false)
  })
})

describe('Field — hiddenWhen / isHidden', () => {
  it('isHidden по умолчанию false', () => {
    const f = new T('F')
    expect(f.isHidden()).toBe(false)
  })

  it('isHidden возвращает true когда колбэк вернул true', () => {
    const f = new T('F')
    f.hiddenWhen(() => true)
    expect(f.isHidden()).toBe(true)
  })

  it('isHidden возвращает false когда колбэк вернул false', () => {
    const f = new T('F')
    f.hiddenWhen(() => false)
    expect(f.isHidden()).toBe(false)
  })

  it('несколько hiddenWhen — логика OR', () => {
    const f = new T('F')
    f.hiddenWhen(() => false).hiddenWhen(() => true)
    expect(f.isHidden()).toBe(true)
  })

  it('runAllChecks пропускает валидацию скрытого поля', () => {
    const f = new T('F')
    f.required('Заполни!').hiddenWhen(() => true)
    f.set(null)
    expect(f.runAllChecks()).toBe(true)
  })

  it('runAllChecks валидирует когда поле видимо', () => {
    const f = new T('F')
    f.required('Заполни!').hiddenWhen(() => false)
    f.set(null)
    expect(f.runAllChecks()).toBe(false)
  })

  it('hiddenWhen + dependsOn: видимость реагирует на изменение зависимости', () => {
    const toggle = new T('Toggle')
    const f = new T('F')
    f.required('Заполни!')
    f.hiddenWhen(() => toggle.value === 'hide')
    f.dependsOn(toggle)
    f.set(null)

    expect(f.runAllChecks()).toBe(false) // видимо, обязательно, пусто

    toggle.set('hide')
    expect(f.runAllChecks()).toBe(true)  // скрыто — пропускаем
  })
})

describe('Field — isEmpty', () => {
  it('null считается пустым', () => {
    const f = new T('F')
    f.set(null)
    expect(f.isEmpty()).toBe(true)
  })

  it('пустая строка считается пустой', () => {
    const f = new T('F')
    f.set('')
    expect(f.isEmpty()).toBe(true)
  })

  it('строка из пробелов НЕ считается пустой (notBlank — отдельный валидатор)', () => {
    const f = new T('F')
    f.set('   ')
    expect(f.isEmpty()).toBe(false)
  })

  it('непустая строка не является пустой', () => {
    const f = new T('F')
    f.set('x')
    expect(f.isEmpty()).toBe(false)
  })
})

describe('Field — addUpdateListener', () => {
  it('вызывает слушателя при установке значения', () => {
    const f = new T('F')
    const listener = vi.fn()
    f.addUpdateListener(listener)
    f.set('hello')
    expect(listener).toHaveBeenCalledOnce()
  })

  it('вызывает несколько слушателей', () => {
    const f = new T('F')
    const l1 = vi.fn()
    const l2 = vi.fn()
    f.addUpdateListener(l1).addUpdateListener(l2)
    f.set('x')
    expect(l1).toHaveBeenCalledOnce()
    expect(l2).toHaveBeenCalledOnce()
  })

  it('каждый вызов set триггерит слушателей', () => {
    const f = new T('F')
    const listener = vi.fn()
    f.addUpdateListener(listener)
    f.set('a')
    f.set('b')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
