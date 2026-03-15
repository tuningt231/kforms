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

    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const inputs = Array.from(base.querySelectorAll('input.kform-control[type="checkbox"]'));
        inputs.forEach(input => {
            if (!(input instanceof HTMLInputElement)) return;
            this.bindDomListener(input, 'change', () => {
                const option = this.resolveOption(input);
                if (option) {
                    this.fieldChanged(input, { option });
                }
            });
        });
        this.addUnfocusChecks(fieldContainer);
    }

    private resolveOption(input: HTMLInputElement): FieldOption<T[]> | undefined {
        const indexRaw = input.getAttribute('data-option-index');
        if (indexRaw !== null) {
            const byIndex = this._options[Number(indexRaw)];
            if (byIndex) return byIndex;
        }

        const valueRaw = input.getAttribute('data-option-value') ?? input.value;
        return this._options.find(option => String(option.value) === valueRaw);
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        if (data && 'option' in data) {
            let newVal = this.value;
            if (!Array.isArray(newVal)) {
                newVal = [];
            }
            if ((sender as HTMLInputElement).checked) {
                newVal.push(...(data.option as FieldOption<T[]>).value);
            } else {
                const optionValue = (data.option as FieldOption<T[]>).value[0];
                if (optionValue === undefined) {
                    this.setValue(newVal);
                    return;
                }
                const index = newVal.indexOf(optionValue);
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
        if (min > 0) {
            this.required(message || `Необходимо выбрать минимум ${min}`);
        }
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
