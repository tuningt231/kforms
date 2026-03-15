import { Field } from '../Field.js';

/**
 * Поле выбора даты и времени
 */
export class DateTimeField extends Field<Date> {
    constructor(label: string) {
        super(label, 'datetime-local');
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.setupDefaultInputElement(fieldName);
        return base;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const val = (sender as HTMLInputElement).value;
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            this.setValue(date);
        }
    }

    /**
     * Валидация минимальной даты и времени
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
     * Валидация максимальной даты и времени
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
     * Валидация что дата и время в будущем
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
     * Валидация что дата и время в прошлом
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
