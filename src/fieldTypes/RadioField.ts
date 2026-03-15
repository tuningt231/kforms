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

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.createInputArray(this.fieldContainer!, fieldName, this._inputType, this._options);
        this.addUnfocusChecks(this.fieldContainer!);
        return base;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        if (data && 'option' in data && (sender as HTMLInputElement).checked) {
            this.setValue((data.option as FieldOption<T>).value);
        }
    }
}
