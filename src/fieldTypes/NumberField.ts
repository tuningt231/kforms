import { Field } from '../Field.js';

/**
 * Числовое поле
 * 
 * ВНИМАНИЕ: Использует JavaScript Number, который имеет ограничения:
 * - Максимальное безопасное целое: ±9007199254740991 (Number.MAX_SAFE_INTEGER)
 * - Числа больше этого значения теряют точность
 * - Экстремально большие числа превращаются в Infinity
 * 
 * Для работы с очень большими числами (например, ID, номера счетов)
 * рекомендуется использовать TextField с валидацией по регулярному выражению:
 * 
 * @example
 * // Вместо NumberField для больших ID:
 * const bigId = field.textInput('ID').numeric();
 */
export class NumberField extends Field<number> {
    constructor(label: string) {
        super(label, 'number');
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.setupDefaultInputElement(fieldName);
        return base;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const val = (sender as HTMLInputElement).value;
        if (val.trim() !== '' && Number.isFinite(Number(val))) {
            this.setValue(Number(val));
        }
    }

    /**
     * Валидация минимального значения
     */
    min(minValue: number, message?: string): this {
        return this.validate(value => ({
            isValid: value >= minValue,
            message: message || `Минимум ${minValue}`
        }));
    }

    /**
     * Валидация максимального значения
     */
    max(maxValue: number, message?: string): this {
        return this.validate(value => ({
            isValid: value <= maxValue,
            message: message || `Максимум ${maxValue}`
        }));
    }

    /**
     * Валидация диапазона значений
     */
    between(minValue: number, maxValue: number, message?: string): this {
        return this.validate(value => ({
            isValid: value >= minValue && value <= maxValue,
            message: message || `Значение должно быть от ${minValue} до ${maxValue}`
        }));
    }

    /**
     * Валидация положительного числа
     */
    positive(message?: string): this {
        return this.validate(value => ({
            isValid: value > 0,
            message: message || 'Число должно быть положительным'
        }));
    }

    /**
     * Валидация отрицательного числа
     */
    negative(message?: string): this {
        return this.validate(value => ({
            isValid: value < 0,
            message: message || 'Число должно быть отрицательным'
        }));
    }

    /**
     * Валидация целого числа
     */
    integer(message?: string): this {
        return this.validate(value => ({
            isValid: Number.isInteger(value),
            message: message || 'Число должно быть целым'
        }));
    }
}
