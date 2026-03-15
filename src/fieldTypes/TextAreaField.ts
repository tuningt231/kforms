import { Field } from '../Field.js';

/**
 * Многострочное текстовое поле
 */
export class TextAreaField extends Field<string> {
    constructor(label: string) {
        super(label, 'textarea');
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        const input = this.createTextArea(this.fieldContainer!, fieldName, this._label);
        this.addUnfocusChecks(input);
        return base;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        this.setValue((sender as HTMLInputElement).value);
    }

    /**
     * Валидация минимальной длины
     */
    minLength(min: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length >= min,
            message: message || `Минимум ${min} символов`
        }));
    }

    /**
     * Валидация максимальной длины
     */
    maxLength(max: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length <= max,
            message: message || `Максимум ${max} символов`
        }));
    }

    /**
     * Проверка что текст не пустой
     */
    notBlank(message?: string): this {
        return this.validate(value => ({
            isValid: value.trim().length > 0,
            message: message || 'Поле не должно быть пустым'
        }));
    }

    /**
     * Валидация минимального количества слов
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

    private createTextArea(container: HTMLElement, name: string, label: string): HTMLElement {
        const input = document.createElement('textarea');
        input.className = 'kform-control';

        input.addEventListener('input', () => {
            this.fieldChanged(input);
        });

        const labelTag = document.createElement('label');
        labelTag.innerText = label;

        if (name !== undefined) {
            input.name = name;
            input.id = name;
            labelTag.htmlFor = name;
        }

        container.appendChild(labelTag);
        container.appendChild(input);
        return input;
    }


}
