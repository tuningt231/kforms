import { Field } from '../Field.js';

/**
 * Поле выбора даты
 */
export class DateField extends Field<Date> {
    constructor(label: string) {
        super(label, 'date');
    }
    
    /**
	 * Привязывает поле к дом-дереву, находит `<input type="date">` и навешивает обработчик. 
	 */
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('DateField input not found');
        }
        this.bindDomListener(input, 'input', () => {
            this.fieldChanged(input);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    /**
	 * Парсит входную строку в объект `Date` и обновляет значение поля. 
	 */
    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const val = (sender as HTMLInputElement).value;
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            this.setValue(date);
        } else {
            this.setValue(null);
        }
    }

    /**
     * Валидация минимальной даты.
     * @param minDate - нижняя граница даты (значение или фабрика для динамической вычисления)
     * @param message - переопределение сообщения об ошибке
     */
    min(minDate: Date | (() => Date), message?: string): this {
        return this.validate(value => {
            const min = typeof minDate === 'function' ? minDate() : minDate;
            return {
                isValid: value >= min,
                message: message || `Дата должна быть не ранее ${min.toLocaleDateString()}`
            };
        });
    }

    /**
     * Валидация максимальной даты.
     * @param maxDate - верхняя граница даты (значение или фабрика для динамической вычисления)
     * @param message - переопределение сообщения об ошибке
     */
    max(maxDate: Date | (() => Date), message?: string): this {
        return this.validate(value => {
            const max = typeof maxDate === 'function' ? maxDate() : maxDate;
            return {
                isValid: value <= max,
                message: message || `Дата должна быть не позднее ${max.toLocaleDateString()}`
            };
        });
    }

    /**
     * Валидация, что дата находится в будущем.
     * @param message - переопределение сообщения об ошибке
     */
    future(message?: string): this {
        return this.validate(value => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            return {
                isValid: value > now,
                message: message || 'Дата должна быть в будущем'
            };
        });
    }

    /**
     * Валидация, что дата находится в прошлом.
     * @param message - переопределение сообщения об ошибке
     */
    past(message?: string): this {
        return this.validate(value => {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            return {
                isValid: value < now,
                message: message || 'Дата должна быть в прошлом'
            };
        });
    }

}
