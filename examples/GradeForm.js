import { Form, field } from '../dist/index.js';

/**
 * Пример 5: Оценка с комментарием
 * Выбрать оценку от 1 до 5, если оценка меньше 4, то обязательно оставить комментарий
 */
export class GradeForm extends Form {
    
    grade = field.number('Поставьте оценку')
        .required()
        .min(1)
        .max(5)
    
    comment = field.textInput('Комментарий')
        .requiredWhen(() => this.grade.value < 4)
        .notBlank()

    onSubmit(values) {
        console.log('Grade Form submitted:', values);
        alert('Оценка отправлена!\n' + JSON.stringify(values, null, 2));
    }
}
