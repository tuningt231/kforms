import { Form, field } from '../dist/index.js';

/**
 * Пример 2: Форма обратной связи
 * Оценка от 0 до 5 (обязательная), сообщение (опциональное, но если есть, то хотя бы из 3 слов), 
 * согласие на обработку персональных данных и политикой компании со ссылками на соглашения
 */
export class FeedbackForm extends Form {

    rating = field.radio('Оценка')
        .options(['0', '1', '2', '3', '4', '5'])
        .required()

    message = field.textArea('Сообщение')
        .minWords(3, 'В сообщении должно быть хотя бы 3 слова')

    agreement = field.checkbox('Согласие на обработку персональных данных')
        .options([
            {
                value: 'agree-privacy',
                label: 'Я согласен с политикой обработки персональных данных'
            }, {
                value: 'agree-policy',
                label: 'Я согласен с политикой компании'
            }
        ])
        .minSelected(2, 'Необходимо согласие со всеми пунктами')

    onSubmit(values) {
        console.log('Feedback Form submitted:', values);
        alert('Форма обратной связи отправлена!\n' + JSON.stringify(values, null, 2));
    }
}
