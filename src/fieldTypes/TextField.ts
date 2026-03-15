import { Field } from '../Field.js';

/**
 * Текстовое поле ввода
 */
export class TextField extends Field<string> {
    constructor(label: string, fieldType: string = 'text') {
        super(label, fieldType);
    }

    /**
	 * Привязывает поле к дом-дереву, находит `<input>` и навешивает обработчик события `input`. 
	 */
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('TextField input not found');
        }
        this.bindDomListener(input, 'input', () => {
            this.fieldChanged(input);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    /**
	 * Обновляет значение поля при каждом событии `input`. 
	 */
    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        this.setValue((sender as HTMLInputElement).value);
    }

    /**
     * Валидация минимальной длины строки.
     * @param min - минимальное число символов
     * @param message - переопределение сообщения об ошибке
     */
    minLength(min: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length >= min,
            message: message || `Минимум ${min} символов`
        }));
    }

    /**
     * Валидация максимальной длины строки.
     * @param max - максимальное число символов
     * @param message - переопределение сообщения об ошибке
     */
    maxLength(max: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length <= max,
            message: message || `Максимум ${max} символов`
        }));
    }

    /**
     * Валидация точной длины строки.
     * @param len - ожидаемое количество символов
     * @param message - переопределение сообщения об ошибке
     */
    length(len: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length === len,
            message: message || `Длина должна быть ${len} символов`
        }));
    }

    /**
     * Валидация по регулярному выражению.
     * @param pattern - регулярное выражение для проверки
     * @param message - переопределение сообщения об ошибке
     */
    match(pattern: RegExp, message?: string): this {
        return this.validate(value => ({
            isValid: pattern.test(value),
            message: message || 'Неверный формат'
        }));
    }

    /**
     * Алиас для `match`.
     * @param pattern - регулярное выражение для проверки
     * @param message - переопределение сообщения об ошибке
     */
    pattern(pattern: RegExp, message?: string): this {
        return this.match(pattern, message);
    }

    /**
     * Проверяет, что строка не состоит только из пробелов.
     * @param message - переопределение сообщения об ошибке
     */
    notBlank(message?: string): this {
        return this.validate(value => ({
            isValid: value.trim().length > 0,
            message: message || 'Поле не должно быть пустым'
        }));
    }

    /**
     * Проверяет, что строка содержит заданную подстроку.
     * @param substring - ожидаемая подстрока
     * @param message - переопределение сообщения об ошибке
     */
    contains(substring: string, message?: string): this {
        return this.validate(value => ({
            isValid: value.includes(substring),
            message: message || `Должно содержать "${substring}"`
        }));
    }

    /**
     * Проверяет, что строка начинается с заданного префикса.
     * @param prefix - ожидаемый префикс
     * @param message - переопределение сообщения об ошибке
     */
    startsWith(prefix: string, message?: string): this {
        return this.validate(value => ({
            isValid: value.startsWith(prefix),
            message: message || `Должно начинаться с "${prefix}"`
        }));
    }

    /**
     * Проверяет, что строка заканчивается заданным суффиксом.
     * @param suffix - ожидаемый суффикс
     * @param message - переопределение сообщения об ошибке
     */
    endsWith(suffix: string, message?: string): this {
        return this.validate(value => ({
            isValid: value.endsWith(suffix),
            message: message || `Должно заканчиваться на "${suffix}"`
        }));
    }

    /**
     * Проверяет, что строка содержит только цифры.
     * @param message - переопределение сообщения об ошибке
     */
    numeric(message?: string): this {
        return this.match(/^[0-9]+$/, message || 'Только цифры');
    }
}
