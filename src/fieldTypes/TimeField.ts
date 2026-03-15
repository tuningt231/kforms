import { Field } from '../Field.js';

/**
 * Поле выбора времени
 */
export class TimeField extends Field<string> {
    constructor(label: string) {
        super(label, 'time');
    }
    
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('TimeField input not found');
        }
        this.bindDomListener(input, 'input', () => {
            this.fieldChanged(input);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        this.setValue((sender as HTMLInputElement).value);
    }

    /**
     * Валидация минимального времени
     */
    min(minTime: string, message?: string): this {
        return this.validate(value => ({
            isValid: value >= minTime,
            message: message || `Время должно быть не ранее ${minTime}`
        }));
    }

    /**
     * Валидация максимального времени
     */
    max(maxTime: string, message?: string): this {
        return this.validate(value => ({
            isValid: value <= maxTime,
            message: message || `Время должно быть не позднее ${maxTime}`
        }));
    }

    /**
     * Валидация диапазона времени
     */
    between(minTime: string, maxTime: string, message?: string): this {
        return this.validate(value => ({
            isValid: value >= minTime && value <= maxTime,
            message: message || `Время должно быть между ${minTime} и ${maxTime}`
        }));
    }
}
