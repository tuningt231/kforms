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

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.createSelectElement(this.fieldContainer!, fieldName, this._label, this._options);
        this.addUnfocusChecks(this.fieldContainer!);
        return base;
    }

    private createSelectElement(container: HTMLElement, name: string, label: string, options: FieldOption<T>[]): HTMLSelectElement {
        const labelTag = document.createElement('label');
        labelTag.innerText = label;
        labelTag.htmlFor = name;

        const select = document.createElement('select');
        select.className = 'kform-control';
        select.name = name;
        select.id = name;

        select.addEventListener('input', (e) => {
            console.log(e);
            
            this.fieldChanged(select);
        });

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        select.appendChild(emptyOption);

        for (const option of options) {
            const optElement = document.createElement('option');
            optElement.value = String(option.value);
            optElement.textContent = option.label;
            select.appendChild(optElement);
        }

        container.appendChild(labelTag);
        container.appendChild(select);

        return select;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const value = (sender as HTMLSelectElement).value;
        if (value === '') {
            this.setValue(null as T);
            return;
        }

        console.log(sender);
        

        const selectedOption = this._options.find(option => String(option.value) === value);
        if (selectedOption) {
            this.setValue(selectedOption.value);
        }
    }

}
