import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

/**
 * Checkbox поле (множественный выбор)
 */
export class CheckboxField<T> extends Field<T[]> {

    constructor(label: string) {
        super(label, 'checkbox');
    }

    options(opts: FieldOption<T>[] | T[]): this {
        return super.setOptionsInternal(opts.map(opt => {
            if (typeof opt === 'object' && opt !== null && 'value' in opt) {
                return { value: [opt.value], label: opt.label || String(opt.value) };
            }
            return { value: [opt], label: String(opt) };
        }));
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.createInputArray(this.fieldContainer!, fieldName, this._inputType, this._options);
        this.addUnfocusChecks(this.fieldContainer!);
        return base;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        if (data && 'option' in data) {
            let newVal = this.value;
            if (!Array.isArray(newVal)) {
                newVal = [];
            }
            if ((sender as HTMLInputElement).checked) {
                newVal.push((data.option as FieldOption<T>).value);
            } else {
                const index = newVal.indexOf((data.option as FieldOption<T>).value);
                if (index > -1) {
                    newVal.splice(index, 1);
                }
            }
            this.setValue(newVal);
        }
    }

    /**
     * Валидация минимального количества выбранных элементов
     */
    minSelected(min: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length >= min,
            message: message || `Необходимо выбрать минимум ${min}`
        }));
    }

    /**
     * Валидация максимального количества выбранных элементов
     */
    maxSelected(max: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length <= max,
            message: message || `Можно выбрать максимум ${max}`
        }));
    }
}
