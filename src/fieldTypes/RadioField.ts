import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

/**
 * Radio поле (одиночный выбор)
 */
export class RadioField<T> extends Field<T> {
    constructor(label: string) {
        super(label, 'radio');
    }

    options(opts: FieldOption<T>[] | T[]): this {
        return super.setOptionsInternal(opts);
    }

    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const inputs = Array.from(base.querySelectorAll('input.kform-control[type="radio"]'));
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

    private resolveOption(input: HTMLInputElement): FieldOption<T> | undefined {
        const indexRaw = input.getAttribute('data-option-index');
        if (indexRaw !== null) {
            const byIndex = this._options[Number(indexRaw)];
            if (byIndex) return byIndex;
        }

        const valueRaw = input.getAttribute('data-option-value') ?? input.value;
        return this._options.find(option => String(option.value) === valueRaw);
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        if (data && 'option' in data && (sender as HTMLInputElement).checked) {
            this.setValue((data.option as FieldOption<T>).value);
        }
    }
}
