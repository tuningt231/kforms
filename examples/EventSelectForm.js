import { Form, field } from '../dist/index.js';

/**
 * Пример 4: Выбор непересекающихся мероприятий
 * Выбрать расписание уроков не пересекающиеся по времени, минимум один урок
 */
const lessons = [
    {
        id: 1,
        name: 'Математика',
        beginsAt: new Date('2026-10-10T10:00:00'),
        endsAt: new Date('2026-10-10T10:45:00')
    }, {
        id: 2,
        name: 'Физика',
        beginsAt: new Date('2026-10-10T10:30:00'),
        endsAt: new Date('2026-10-10T11:15:00')
    }, {
        id: 3,
        name: 'Информатика',
        beginsAt: new Date('2026-10-10T11:00:00'),
        endsAt: new Date('2026-10-10T11:45:00')
    }, {
        id: 4,
        name: 'География',
        beginsAt: new Date('2026-10-10T10:30:00'),
        endsAt: new Date('2026-10-10T11:15:00')
    }
];

export class EventSelectForm extends Form {

    events = field.checkbox('Выберите непересекающиеся мероприятия')
        .options(lessons.map(el => ({
            value: el,
            label: el.name
        })))
        .required()
        .validate(selected => {
            const sorted = [...selected].sort((a, b) => a.beginsAt - b.beginsAt);
            for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i].endsAt > sorted[i+1].beginsAt) {
                    return {
                        isValid: false,
                        message: `Пересекаются ${sorted[i].name} и ${sorted[i+1].name}`
                    };
                }
            }
            return { isValid: true };
        })
        .transform(value => value.map(v => v.id))

    onSubmit(values) {
        console.log('Event Select Form submitted:', values);
        alert('Мероприятия выбраны!\n' + JSON.stringify(values, null, 2));
    }
}
