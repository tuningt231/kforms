import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

/**
 * Select поле (выпадающий список)
 */
export class SelectField<T> extends Field<T> {
    protected _options: FieldOption<T>[] = [];

    constructor(label: string) {
        super(label, 'select');
    }

    options(opts: FieldOption<T>[] | T[]): this {
        return super.setOptionsInternal(opts);
    }

    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const select = base.querySelector('select.kform-control');
        if (!(select instanceof HTMLSelectElement)) {
            throw new Error('SelectField select not found');
        }

        this.bindDomListener(select, 'input', () => {
            this.fieldChanged(select);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const value = (sender as HTMLSelectElement).value;
        if (value === '') {
            this.setValue(null);
            return;
        }

        const selectedOption = this._options.find(option => String(option.value) === value);
        if (selectedOption) {
            this.setValue(selectedOption.value);
        }
    }

}
