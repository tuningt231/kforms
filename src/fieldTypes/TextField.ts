import { Field } from '../Field.js';

/**
 * Текстовое поле ввода
 */
export class TextField extends Field<string> {
    constructor(label: string, fieldType: string = 'text') {
        super(label, fieldType);
    }

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

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        this.setValue((sender as HTMLInputElement).value);
    }

    /**
     * Валидация минимальной длины строки
     */
    minLength(min: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length >= min,
            message: message || `Минимум ${min} символов`
        }));
    }

    /**
     * Валидация максимальной длины строки
     */
    maxLength(max: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length <= max,
            message: message || `Максимум ${max} символов`
        }));
    }

    /**
     * Валидация точной длины строки
     */
    length(len: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length === len,
            message: message || `Длина должна быть ${len} символов`
        }));
    }

    /**
     * Валидация по регулярному выражению
     */
    match(pattern: RegExp, message?: string): this {
        return this.validate(value => ({
            isValid: pattern.test(value),
            message: message || 'Неверный формат'
        }));
    }

    /**
     * Alias для match
     */
    pattern(pattern: RegExp, message?: string): this {
        return this.match(pattern, message);
    }

    /**
     * Проверка что строка не пустая (не только пробелы)
     */
    notBlank(message?: string): this {
        return this.validate(value => ({
            isValid: value.trim().length > 0,
            message: message || 'Поле не должно быть пустым'
        }));
    }

    /**
     * Проверка что строка содержит подстроку
     */
    contains(substring: string, message?: string): this {
        return this.validate(value => ({
            isValid: value.includes(substring),
            message: message || `Должно содержать "${substring}"`
        }));
    }

    /**
     * Проверка что строка начинается с подстроки
     */
    startsWith(prefix: string, message?: string): this {
        return this.validate(value => ({
            isValid: value.startsWith(prefix),
            message: message || `Должно начинаться с "${prefix}"`
        }));
    }

    /**
     * Проверка что строка заканчивается подстрокой
     */
    endsWith(suffix: string, message?: string): this {
        return this.validate(value => ({
            isValid: value.endsWith(suffix),
            message: message || `Должно заканчиваться на "${suffix}"`
        }));
    }

    /**
     * Проверка что строка содержит только цифры
     */
    numeric(message?: string): this {
        return this.match(/^[0-9]+$/, message || 'Только цифры');
    }
}
