import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

type OptionsSource<T> = FieldOption<T>[] | T[] | (() => FieldOption<T>[] | T[]);

/**
 * Select поле (выпадающий список)
 */
export class SelectField<T> extends Field<T> {
    protected _options: FieldOption<T>[] = [];
    private _optionsCallback: (() => FieldOption<T>[] | T[]) | null = null;

    constructor(label: string) {
        super(label, 'select');
    }

    /**
     * Устанавливает список опций выпадающего списка.
     * @param opts - статический массив или колбэк, пересчитываемый при изменении зависимых полей
     */
    options(opts: OptionsSource<T>): this {
        if (typeof opts === 'function') {
            this._optionsCallback = opts;
            return super.setOptionsInternal(opts());
        }
        return super.setOptionsInternal(opts);
    }

    protected override refreshOptions(): void {
        if (!this._optionsCallback) return;
        super.setOptionsInternal(this._optionsCallback());
        if (this._value !== null) {
            const stillValid = this._options.some(opt => String(opt.value) === String(this._value));
            if (!stillValid) this.setValue(null);
        }
        this.rebuildSelectOptions();
    }

    private rebuildSelectOptions(): void {
        const select = this._fieldContainer?.querySelector('select.kform-control');
        if (!(select instanceof HTMLSelectElement)) return;

        while (select.options.length > 1) select.remove(1);

        for (const opt of this._options) {
            const el = document.createElement('option');
            el.value = String(opt.value);
            el.textContent = opt.label;
            select.appendChild(el);
        }
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
