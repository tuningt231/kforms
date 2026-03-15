import { Field } from '../Field.js';

/**
 * Многострочное текстовое поле
 */
export class TextAreaField extends Field<string> {
    constructor(label: string) {
        super(label, 'textarea');
    }

    /**
	 * Привязывает поле к дом-дереву, находит `<textarea>` и навешивает обработчик события `input`. 
	 */
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('textarea.kform-control');
        if (!(input instanceof HTMLTextAreaElement)) {
            throw new Error('TextAreaField textarea not found');
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
     * Валидация минимальной длины.
     * @param min - минимальное количество символов
     * @param message - переопределение сообщения об ошибке
     */
    minLength(min: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length >= min,
            message: message || `Минимум ${min} символов`
        }));
    }

    /**
     * Валидация максимальной длины.
     * @param max - максимальное количество символов
     * @param message - переопределение сообщения об ошибке
     */
    maxLength(max: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length <= max,
            message: message || `Максимум ${max} символов`
        }));
    }

    /**
     * Проверяет, что текст не состоит только из пробелов.
     * @param message - переопределение сообщения об ошибке
     */
    notBlank(message?: string): this {
        return this.validate(value => ({
            isValid: value.trim().length > 0,
            message: message || 'Поле не должно быть пустым'
        }));
    }

    /**
     * Проверяет минимальное количество слов в тексте.
     * @param min - минимальное количество слов
     * @param message - переопределение сообщения об ошибке
     */
    minWords(min: number, message?: string): this {
        return this.validate(value => {
            const wordCount = value.trim().split(/\s+/).filter(w => w.length > 0).length;
            return {
                isValid: wordCount >= min,
                message: message || `Минимум ${min} слов`
            };
        });
    }

}
