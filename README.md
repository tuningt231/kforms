# kforms

TypeScript-библиотека для декларативного описания HTML-форм с валидацией, условной видимостью и динамическим поведением.


## Использование

Создайте класс формы, опишите поля и присоедините к элементу страницы:

```typescript
import { Form, field } from 'kforms';

class MyForm extends Form {
  name = field.textInput('Имя').required()

  onSubmit(values) {
    console.log(values);
  }
}

new MyForm().attach(document.querySelector('form'));
```

---

## Примеры

### Регистрация пользователя

Форма с валидацией email, пароля (длина, буквы и цифры) и проверкой совпадения паролей.

```javascript
class LoginForm extends Form {
  email = field.email('Электронная почта')
    .required('Введите email')

  password = field.password('Пароль')
    .required('Придумайте пароль')
    .minLength(8, 'Минимум 8 символов')
    .match(/[A-Za-z]/, 'Нужна хотя бы одна буква')
    .match(/[0-9]/, 'Нужна хотя бы одна цифра')

  passwordConfirm = field.password('Подтверждение пароля')
    .dependsOn(this.password)
    .validate(value => ({
      isValid: value === this.password.value,
      message: 'Пароли не совпадают'
    }))

  onSubmit(values) {
    console.log(values);
  }
}
```

---

### Форма обратной связи

Форма с обязательной оценкой через radio, опциональным текстовым сообщением и чекбоксами согласий.

```javascript
class FeedbackForm extends Form {
  rating = field.radio('Оценка')
    .options(['0', '1', '2', '3', '4', '5'])
    .required()

  message = field.textArea('Сообщение')
    .minWords(3, 'В сообщении должно быть хотя бы 3 слова')

  agreement = field.checkbox('Согласие')
    .options([
      { value: 'agree-privacy', label: 'Согласен с политикой обработки персональных данных' },
      { value: 'agree-policy',  label: 'Согласен с политикой компании' }
    ])
    .minSelected(2, 'Необходимо согласие со всеми пунктами')

  onSubmit(values) {
    console.log(values);
  }
}
```

---

### Выбор даты доставки

Форма с датой, которая должна быть не раньше завтрашнего дня и не позже, чем через 4 дня.

```javascript
class DeliveryDateForm extends Form {
  date = field.date('Дата доставки')
    .required()
    .min(() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    }, 'Дата должна быть в будущем')
    .max(() => {
      const d = new Date();
      d.setDate(d.getDate() + 4);
      return d;
    }, 'Дата должна быть не позже, чем через 4 дня')

  onSubmit(values) {
    console.log(values);
  }
}
```

---

### Выбор непересекающихся мероприятий

Форма с мультивыбором, где кастомный валидатор запрещает выбирать уроки с пересекающимся временем.

```javascript
const lessons = [
  { id: 1, name: 'Математика',  beginsAt: new Date('2026-10-10T10:00'), endsAt: new Date('2026-10-10T10:45') },
  { id: 2, name: 'Физика',      beginsAt: new Date('2026-10-10T10:30'), endsAt: new Date('2026-10-10T11:15') },
  { id: 3, name: 'Информатика', beginsAt: new Date('2026-10-10T11:00'), endsAt: new Date('2026-10-10T11:45') },
  { id: 4, name: 'География',   beginsAt: new Date('2026-10-10T10:30'), endsAt: new Date('2026-10-10T11:15') },
];

class EventSelectForm extends Form {
  events = field.checkbox('Мероприятия')
    .options(lessons.map(l => ({ value: l, label: l.name })))
    .required()
    .validate(selected => {
      const sorted = [...selected].sort((a, b) => a.beginsAt - b.beginsAt);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].endsAt > sorted[i + 1].beginsAt) {
          return { isValid: false, message: `Пересекаются ${sorted[i].name} и ${sorted[i + 1].name}` };
        }
      }
      return { isValid: true };
    })
    .transform(value => value.map(v => v.id))

  onSubmit(values) {
    console.log(values);
  }
}
```

---

### Оценка с комментарием

Форма, в которой комментарий становится обязательным, если оценка ниже 4.

```javascript
class GradeForm extends Form {
  grade = field.number('Оценка')
    .required()
    .min(1)
    .max(5)

  comment = field.textInput('Комментарий')
    .requiredWhen(() => this.grade.value < 4)
    .notBlank()
    .dependsOn(this.grade)

  onSubmit(values) {
    console.log(values);
  }
}
```

---

### Все типы полей

Демонстрационная форма, показывающая все поддерживаемые типы ввода.

```javascript
class TestForm extends Form {
  textInput = field.textInput('Text').required()
  email     = field.email('Email').required()
  password  = field.password('Password').required()
  url       = field.url('URL').required()
  tel       = field.tel('Phone').required()
  textArea  = field.textArea('Textarea').required()
  number    = field.number('Number').required()
  date      = field.date('Date').required()
  time      = field.time('Time').required()
  datetime  = field.datetime('Date & Time').required()
  radio     = field.radio('Radio').options(['Option A', 'Option B', 'Option C']).required()
  checkbox  = field.checkbox('Checkbox').options(['Choice 1', 'Choice 2', 'Choice 3']).required()
  select    = field.select('Select').options(['Apple', 'Banana', 'Cherry']).required()
  color     = field.color('Color').required()

  onSubmit(values) {
    console.log(values);
  }
}
```
