import { Form, field } from '../dist/index.js';

/**
 * Пример 3: Выбор даты доставки
 * Выбрать дату доставки (месяц, день) не ранее следующего дня, не позднее, чем через 4 дня
 */
export class DeliveryDateForm extends Form {

    date = field.date('Введите дату доставки')
        .required()
        .min(() => {
            let d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(0, 0, 0, 0); 
            return d;
        }, 'Дата должна быть в будущем')
        .max(() => {
            let d = new Date();
            d.setDate(d.getDate() + 4);
            d.setHours(23, 59, 59, 0);
            return d;
        }, 'Дата должна быть не позже, чем через 4 дня')

    onSubmit(values) {
        console.log('Delivery Date Form submitted:', values);
        alert('Дата доставки выбрана!\n' + JSON.stringify(values, null, 2));
    }
}
