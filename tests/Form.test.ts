import { describe, it, expect, vi } from 'vitest'
import { Form } from '../src/Form.js'
import { TextField } from '../src/fieldTypes/TextField.js'
import { NumberField } from '../src/fieldTypes/NumberField.js'

class TText extends TextField {
  set(v: string | null) { this.setValue(v) }
}
class TNumber extends NumberField {
  set(v: number | null) { this.setValue(v) }
}

// Простая форма без обязательных полей
class SimpleForm extends Form {
  name = new TText('Name')
  age = new TNumber('Age')
}

// Форма с валидацией
class ValidatedForm extends Form {
  name = new TText('Name').required('Имя обязательно').minLength(2)
}

// Форма с условной видимостью
class HiddenForm extends Form {
  type = new TText('Type')
  extra = new TText('Extra')

  constructor() {
    super()
    const type = this.type
    this.extra
      .required('Заполните extra')
      .hiddenWhen(() => type.value !== 'detailed')
      .dependsOn(this.type)
  }
}

describe('Form — validateAll', () => {
  it('возвращает true когда все поля валидны', () => {
    const form = new ValidatedForm()
    form.name.set('Alice')
    expect(form.validateAll()).toBe(true)
  })

  it('возвращает false когда обязательное поле пустое', () => {
    const form = new ValidatedForm()
    form.name.set(null)
    expect(form.validateAll()).toBe(false)
  })

  it('возвращает false когда поле не проходит валидатор', () => {
    const form = new ValidatedForm()
    form.name.set('A') // minLength(2) — слишком коротко
    expect(form.validateAll()).toBe(false)
  })

  it('форма без правил валидации всегда проходит', () => {
    const form = new SimpleForm()
    expect(form.validateAll()).toBe(true)
  })

  it('скрытые поля пропускаются при валидации', () => {
    const form = new HiddenForm()
    form.type.set('simple')  // extra скрыто
    form.extra.set(null)     // пустое, но скрытое — не должно блокировать
    expect(form.validateAll()).toBe(true)
  })

  it('видимые поля проходят валидацию', () => {
    const form = new HiddenForm()
    form.type.set('detailed')  // extra видимо
    form.extra.set('заполнено')
    expect(form.validateAll()).toBe(true)
  })

  it('видимое обязательное поле блокирует submit', () => {
    const form = new HiddenForm()
    form.type.set('detailed')  // extra видимо
    form.extra.set(null)       // пустое — должно блокировать
    expect(form.validateAll()).toBe(false)
  })
})

describe('Form — getValues', () => {
  it('возвращает значения всех полей', () => {
    const form = new SimpleForm()
    form.name.set('Bob')
    form.age.set(30)
    const values = form.getValues()
    expect(values['name']).toBe('Bob')
    expect(values['age']).toBe(30)
  })

  it('возвращает null для скрытых полей', () => {
    const form = new HiddenForm()
    form.type.set('simple')
    form.extra.set('some value')
    expect(form.getValues()['extra']).toBeNull()
  })

  it('возвращает значение для видимых полей', () => {
    const form = new HiddenForm()
    form.type.set('detailed')
    form.extra.set('some value')
    expect(form.getValues()['extra']).toBe('some value')
  })

  it('возвращает null для незаполненных полей', () => {
    const form = new SimpleForm()
    const values = form.getValues()
    expect(values['name']).toBeNull()
    expect(values['age']).toBeNull()
  })

  it('применяет трансформацию к значению', () => {
    class FormWithTransform extends Form {
      name = new TText('Name').transform(v => (v as string | null)?.trim() ?? null)
    }
    const form = new FormWithTransform()
    form.name.set('  Alice  ')
    expect(form.getValues()['name']).toBe('Alice')
  })
})

describe('Form — onSubmit', () => {
  it('вызывает onSubmit с правильными значениями при успешной валидации', () => {
    const form = new ValidatedForm()
    const spy = vi.spyOn(form, 'onSubmit')
    form.name.set('Alice')

    if (form.validateAll()) {
      form.onSubmit(form.getValues())
    }

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }))
  })

  it('не вызывает onSubmit при провале валидации', () => {
    const form = new ValidatedForm()
    const spy = vi.spyOn(form, 'onSubmit')
    form.name.set(null)

    if (form.validateAll()) {
      form.onSubmit(form.getValues())
    }

    expect(spy).not.toHaveBeenCalled()
  })
})

describe('Form — attach (DOM)', () => {
  it('render создаёт форму с полями и кнопкой submit', () => {
    class AttachForm extends Form {
      username = new TText('Username')
    }
    const form = new AttachForm()
    const el = form.render()

    expect(el.querySelector('.kform-field')).not.toBeNull()
    expect(
      el.querySelector('input[type="submit"], button[type="submit"]')
    ).not.toBeNull()
  })

  it('attach идемпотентен — повторный вызов не дублирует поля', () => {
    class AttachForm extends Form {
      username = new TText('Username')
    }
    const form = new AttachForm()
    const htmlForm = document.createElement('form')
    form.attach(htmlForm)
    form.attach(htmlForm)

    expect(htmlForm.querySelectorAll('.kform-field')).toHaveLength(1)
  })

  it('для каждого поля формы создаётся отдельный .kform-field', () => {
    const form = new SimpleForm()
    const el = form.render()
    expect(el.querySelectorAll('.kform-field')).toHaveLength(2)
  })

  it('поле скрывается в DOM когда hiddenWhen = true', () => {
    const form = new HiddenForm()
    form.type.set('simple')
    const el = form.render()

    const extraField = el.querySelector<HTMLElement>('[data-field-name="extra"]')
    expect(extraField).not.toBeNull()
    expect(extraField?.style.display).toBe('none')
  })

  it('поле отображается в DOM когда hiddenWhen = false', () => {
    const form = new HiddenForm()
    form.type.set('detailed')
    const el = form.render()

    const extraField = el.querySelector<HTMLElement>('[data-field-name="extra"]')
    expect(extraField?.style.display).not.toBe('none')
  })

  it('submit событие вызывает onSubmit при валидной форме', () => {
    class AttachForm extends Form {
      username = new TText('Username')
    }
    const form = new AttachForm()
    const spy = vi.spyOn(form, 'onSubmit')
    const el = form.render()

    el.dispatchEvent(new Event('submit', { bubbles: true }))

    expect(spy).toHaveBeenCalledOnce()
  })

  it('submit событие не вызывает onSubmit при невалидной форме', () => {
    class AttachForm extends Form {
      username = new TText('Username').required()
    }
    const form = new AttachForm()
    const spy = vi.spyOn(form, 'onSubmit')
    const el = form.render()

    el.dispatchEvent(new Event('submit', { bubbles: true }))

    expect(spy).not.toHaveBeenCalled()
  })
})
