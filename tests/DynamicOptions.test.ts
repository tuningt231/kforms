import { describe, it, expect } from 'vitest'
import { SelectField } from '../src/fieldTypes/SelectField.js'
import { RadioField } from '../src/fieldTypes/RadioField.js'
import { CheckboxField } from '../src/fieldTypes/CheckboxField.js'
import { TextField } from '../src/fieldTypes/TextField.js'
import { Form } from '../src/Form.js'

class TSelect extends SelectField<string> {
  set(v: string | null) { this.setValue(v) }
}
class TRadio extends RadioField<string> {
  set(v: string | null) { this.setValue(v) }
}
class TCheckbox extends CheckboxField<string> {
  set(v: string[]) { this.setValue(v) }
}
class TText extends TextField {
  set(v: string | null) { this.setValue(v) }
}

// ─── SelectField ──────────────────────────────────────────────────────────────

describe('SelectField — динамические опции', () => {
  it('принимает статический массив без изменений', () => {
    const f = new TSelect('S')
    f.options(['a', 'b', 'c'])
    expect(f.rendererOptions).toHaveLength(3)
  })

  it('принимает колбэк и вычисляет опции сразу', () => {
    const f = new TSelect('S')
    f.options(() => ['x', 'y'])
    expect(f.rendererOptions).toHaveLength(2)
    expect(f.rendererOptions[0]?.value).toBe('x')
  })

  it('пересчитывает опции при изменении зависимого поля', () => {
    const source = new TText('Source')
    source.set('group-a')

    const f = new TSelect('S')
    f.options(() => source.value === 'group-a' ? ['a1', 'a2'] : ['b1', 'b2'])
    f.dependsOn(source)

    expect(f.rendererOptions.map(o => o.value)).toEqual(['a1', 'a2'])

    source.set('group-b')
    expect(f.rendererOptions.map(o => o.value)).toEqual(['b1', 'b2'])
  })

  it('сбрасывает текущее значение если оно больше не в опциях', () => {
    const source = new TText('Source')
    source.set('group-a')

    const f = new TSelect('S')
    f.options(() => source.value === 'group-a' ? ['a1', 'a2'] : ['b1', 'b2'])
    f.dependsOn(source)
    f.set('a1')

    expect(f.value).toBe('a1')
    source.set('group-b') // 'a1' пропадает из опций
    expect(f.value).toBeNull()
  })

  it('сохраняет текущее значение если оно осталось в новых опциях', () => {
    const source = new TText('Source')
    source.set('short')

    const f = new TSelect('S')
    f.options(() => source.value === 'short' ? ['common', 'x'] : ['common', 'y'])
    f.dependsOn(source)
    f.set('common')

    source.set('long')
    expect(f.value).toBe('common')
  })
})

// ─── SelectField DOM ──────────────────────────────────────────────────────────

describe('SelectField — обновление DOM при смене опций', () => {
  it('обновляет <option> элементы в <select>', () => {
    class DynForm extends Form {
      category = new TText('Category')
      item = new TSelect('Item')
      constructor() {
        super()
        const cat = this.category
        this.item
          .options(() => cat.value === 'fruit' ? ['apple', 'banana'] : ['car', 'bus'])
          .dependsOn(this.category)
      }
    }

    const form = new DynForm()
    form.category.set('fruit')
    const el = form.render()

    const select = el.querySelector('select.kform-control') as HTMLSelectElement
    expect(select).not.toBeNull()
    // Пустая опция + 2 фруктовых
    expect(select.options).toHaveLength(3)
    expect(select.options[1]?.value).toBe('apple')

    form.category.set('transport')
    expect(select.options).toHaveLength(3)
    expect(select.options[1]?.value).toBe('car')
    expect(select.options[2]?.value).toBe('bus')
  })
})

// ─── RadioField ───────────────────────────────────────────────────────────────

describe('RadioField — динамические опции', () => {
  it('принимает колбэк и вычисляет опции сразу', () => {
    const f = new TRadio('R')
    f.options(() => ['yes', 'no'])
    expect(f.rendererOptions).toHaveLength(2)
  })

  it('пересчитывает опции при изменении зависимого поля', () => {
    const source = new TText('Source')
    source.set('a')

    const f = new TRadio('R')
    f.options(() => source.value === 'a' ? ['a1', 'a2'] : ['b1'])
    f.dependsOn(source)

    expect(f.rendererOptions).toHaveLength(2)
    source.set('b')
    expect(f.rendererOptions).toHaveLength(1)
    expect(f.rendererOptions[0]?.value).toBe('b1')
  })

  it('сбрасывает значение если оно больше не в опциях', () => {
    const source = new TText('Source')
    source.set('a')

    const f = new TRadio('R')
    f.options(() => source.value === 'a' ? ['a1', 'a2'] : ['b1'])
    f.dependsOn(source)
    f.set('a1')

    source.set('b')
    expect(f.value).toBeNull()
  })
})

describe('RadioField — обновление DOM при смене опций', () => {
  it('перестраивает radio-кнопки в DOM', () => {
    class DynForm extends Form {
      type = new TText('Type')
      choice = new TRadio('Choice')
      constructor() {
        super()
        const t = this.type
        this.choice
          .options(() => t.value === 'colors' ? ['red', 'blue'] : ['dog', 'cat', 'fish'])
          .dependsOn(this.type)
      }
    }

    const form = new DynForm()
    form.type.set('colors')
    const el = form.render()

    let radios = el.querySelectorAll('input[type="radio"].kform-control')
    expect(radios).toHaveLength(2)

    form.type.set('animals')
    radios = el.querySelectorAll('input[type="radio"].kform-control')
    expect(radios).toHaveLength(3)
    expect((radios[2] as HTMLInputElement).value).toBe('fish')
  })
})

// ─── CheckboxField ────────────────────────────────────────────────────────────

describe('CheckboxField — динамические опции', () => {
  it('принимает колбэк и вычисляет опции сразу', () => {
    const f = new TCheckbox('CB')
    f.options(() => ['x', 'y', 'z'])
    expect(f.rendererOptions).toHaveLength(3)
  })

  it('пересчитывает опции при изменении зависимого поля', () => {
    const source = new TText('Source')
    source.set('small')

    const f = new TCheckbox('CB')
    f.options(() => source.value === 'small' ? ['a'] : ['a', 'b', 'c'])
    f.dependsOn(source)

    expect(f.rendererOptions).toHaveLength(1)
    source.set('large')
    expect(f.rendererOptions).toHaveLength(3)
  })

  it('фильтрует текущие значения при смене опций', () => {
    const source = new TText('Source')
    source.set('full')

    const f = new TCheckbox('CB')
    f.options(() => source.value === 'full' ? ['a', 'b', 'c'] : ['a'])
    f.dependsOn(source)
    f.set(['a', 'b', 'c'])

    source.set('limited') // 'b' и 'c' пропадают
    expect(f.value).toEqual(['a'])
  })

  it('сохраняет значения которые остались в новых опциях', () => {
    const source = new TText('Source')
    source.set('v1')

    const f = new TCheckbox('CB')
    f.options(() => source.value === 'v1' ? ['a', 'b'] : ['a', 'c'])
    f.dependsOn(source)
    f.set(['a', 'b'])

    source.set('v2') // 'b' пропадает, 'a' остаётся
    expect(f.value).toEqual(['a'])
  })
})

describe('CheckboxField — обновление DOM при смене опций', () => {
  it('перестраивает чекбоксы в DOM', () => {
    class DynForm extends Form {
      type = new TText('Type')
      tags = new TCheckbox('Tags')
      constructor() {
        super()
        const t = this.type
        this.tags
          .options(() => t.value === 'tech' ? ['js', 'ts'] : ['red', 'green', 'blue'])
          .dependsOn(this.type)
      }
    }

    const form = new DynForm()
    form.type.set('tech')
    const el = form.render()

    let boxes = el.querySelectorAll('input[type="checkbox"].kform-control')
    expect(boxes).toHaveLength(2)

    form.type.set('colors')
    boxes = el.querySelectorAll('input[type="checkbox"].kform-control')
    expect(boxes).toHaveLength(3)
    expect((boxes[2] as HTMLInputElement).value).toBe('blue')
  })
})
