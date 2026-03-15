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

    /**
	 * Привязывает поле к дом-дереву, находит `<input type="number">` и навешивает обработчик. 
	 */
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('NumberField input not found');
        }
        this.bindDomListener(input, 'input', () => {
            this.fieldChanged(input);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    /**
	 * Преобразует строковое значение в число и обновляет поле; пустая строка или нечисловое значение игнорируются. 
	 */
    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const val = (sender as HTMLInputElement).value;
        if (val.trim() !== '' && Number.isFinite(Number(val))) {
            this.setValue(Number(val));
        } else {
            this.setValue(null);
        }
    }

    /**
     * Валидация минимального значения.
     * @param minValue - минимально допустимое число
     * @param message - переопределение сообщения об ошибке
     */
    min(minValue: number, message?: string): this {
        return this.validate(value => ({
            isValid: value >= minValue,
            message: message || `Минимум ${minValue}`
        }));
    }

    /**
     * Валидация максимального значения.
     * @param maxValue - максимально допустимое число
     * @param message - переопределение сообщения об ошибке
     */
    max(maxValue: number, message?: string): this {
        return this.validate(value => ({
            isValid: value <= maxValue,
            message: message || `Максимум ${maxValue}`
        }));
    }

    /**
     * Валидация диапазона значений.
     * @param minValue - нижняя граница диапазона
     * @param maxValue - верхняя граница диапазона
     * @param message - переопределение сообщения об ошибке
     */
    between(minValue: number, maxValue: number, message?: string): this {
        return this.validate(value => ({
            isValid: value >= minValue && value <= maxValue,
            message: message || `Значение должно быть от ${minValue} до ${maxValue}`
        }));
    }

    /**
     * Валидация положительного числа (> 0).
     * @param message - переопределение сообщения об ошибке
     */
    positive(message?: string): this {
        return this.validate(value => ({
            isValid: value > 0,
            message: message || 'Число должно быть положительным'
        }));
    }

    /**
     * Валидация отрицательного числа (< 0).
     * @param message - переопределение сообщения об ошибке
     */
    negative(message?: string): this {
        return this.validate(value => ({
            isValid: value < 0,
            message: message || 'Число должно быть отрицательным'
        }));
    }

    /**
     * Валидация целого числа.
     * @param message - переопределение сообщения об ошибке
     */
    integer(message?: string): this {
        return this.validate(value => ({
            isValid: Number.isInteger(value),
            message: message || 'Число должно быть целым'
        }));
    }
}
