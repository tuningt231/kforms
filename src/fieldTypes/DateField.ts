import { Field } from '../Field.js';

/**
 * Поле выбора даты
 */
export class DateField extends Field<Date> {
    constructor(label: string) {
        super(label, 'date');
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
     * Валидация минимальной даты
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
     * Валидация максимальной даты
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
     * Валидация что дата в будущем
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
     * Валидация что дата в прошлом
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
