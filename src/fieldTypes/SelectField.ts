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

    /**
     * Устанавливает список опций выпадающего списка.
     * @param opts - массив опций (можно передавать примитивные значения или объекты `FieldOption`)
     */
    options(opts: FieldOption<T>[] | T[]): this {
        return super.setOptionsInternal(opts);
    }

    /**
	 * Привязывает поле к дом-дереву, находит `<select>` и навешивает обработчик. 
	 */
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

    /**
	 * Находит опцию по значению `<select>` и обновляет значение поля; пустое выбранное значение устанавливает `null`. 
	 */
    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        const value = (sender as HTMLSelectElement).value;
        if (value === '') {
            this.setValue(null);
            return;
        }

        const selectedOption = this._options.find(option => String(option.value) === value);
        if (selectedOption) {
            this.setValue(selectedOption.value);
        } else {
            this.setValue(null);
        }
    }

}
