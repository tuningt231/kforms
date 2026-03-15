import { Field } from '../Field.js';

/**
 * Поле выбора даты и времени
 */
export class DateTimeField extends Field<Date> {
    constructor(label: string) {
        super(label, 'datetime-local');
    }

    /**
	 * Привязывает поле к дом-дереву, находит `<input type="datetime-local">` и навешивает обработчик. 
	 */
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('DateTimeField input not found');
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
     * Валидация минимальной даты и времени.
     * @param minDateTime - нижняя граница (значение или фабрика)
     * @param message - переопределение сообщения об ошибке
     */
    min(minDateTime: Date | (() => Date), message?: string): this {
        return this.validate(value => {
            const min = typeof minDateTime === 'function' ? minDateTime() : minDateTime;
            return {
                isValid: value >= min,
                message: message || `Дата и время должны быть не ранее ${min.toLocaleString()}`
            };
        });
    }

    /**
     * Валидация максимальной даты и времени.
     * @param maxDateTime - верхняя граница (значение или фабрика)
     * @param message - переопределение сообщения об ошибке
     */
    max(maxDateTime: Date | (() => Date), message?: string): this {
        return this.validate(value => {
            const max = typeof maxDateTime === 'function' ? maxDateTime() : maxDateTime;
            return {
                isValid: value <= max,
                message: message || `Дата и время должны быть не позднее ${max.toLocaleString()}`
            };
        });
    }

    /**
     * Валидация, что дата и время находятся в будущем.
     * @param message - переопределение сообщения об ошибке
     */
    future(message?: string): this {
        return this.validate(value => {
            const now = new Date();
            return {
                isValid: value > now,
                message: message || 'Дата и время должны быть в будущем'
            };
        });
    }

    /**
     * Валидация, что дата и время находятся в прошлом.
     * @param message - переопределение сообщения об ошибке
     */
    past(message?: string): this {
        return this.validate(value => {
            const now = new Date();
            return {
                isValid: value < now,
                message: message || 'Дата и время должны быть в прошлом'
            };
        });
    }
}
