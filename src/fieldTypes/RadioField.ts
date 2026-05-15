import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

type OptionsSource<T> = FieldOption<T>[] | T[] | (() => FieldOption<T>[] | T[]);

/**
 * Radio поле (одиночный выбор)
 */
export class RadioField<T> extends Field<T> {
    private _optionsCallback: (() => FieldOption<T>[] | T[]) | null = null;

    constructor(label: string) {
        super(label, 'radio');
    }

    /**
     * Устанавливает список вариантов выбора.
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
        this.rebuildChoiceDom();
    }

    private rebuildChoiceDom(): void {
        if (!this._fieldContainer || !this._baseElement) return;

        const fieldName = this._baseElement.getAttribute('data-field-name') ?? '';

        for (const el of Array.from(this._fieldContainer.querySelectorAll('[data-role="option"]'))) {
            el.remove();
        }

        this._options.forEach((option, idx) => {
            const container = document.createElement('div');
            container.className = 'kform-option';
            container.setAttribute('data-role', 'option');
            container.setAttribute('data-option-index', String(idx));

            const input = document.createElement('input');
            input.className = 'kform-control';
            input.setAttribute('data-role', 'control');
            input.type = 'radio';
            input.name = fieldName;
            input.id = `${fieldName}-${idx}`;
            input.setAttribute('data-option-index', String(idx));
            input.setAttribute('data-option-value', String(option.value));
            input.value = String(option.value);

            const label = document.createElement('label');
            label.className = 'kform-option-label';
            label.setAttribute('data-role', 'option-label');
            label.htmlFor = input.id;
            label.innerText = option.label;

            container.appendChild(input);
            container.appendChild(label);
            this._fieldContainer!.appendChild(container);

            this.bindDomListener(input, 'change', () => {
                const opt = this.resolveOption(input);
                if (opt) this.fieldChanged(input, { option: opt });
            });
        });
    }

    /**
	 * Привязывает поле к дом-дереву, находит все `<input type="radio">` и навешивает обработчики. 
	 */
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

    /**
	 * Находит объект `FieldOption` для переданного `<input>`: сначала по `data-option-index`, затем по значению. 
	 */
    private resolveOption(input: HTMLInputElement): FieldOption<T> | undefined {
        const indexRaw = input.getAttribute('data-option-index');
        if (indexRaw !== null) {
            const byIndex = this._options[Number(indexRaw)];
            if (byIndex) return byIndex;
        }

        const valueRaw = input.getAttribute('data-option-value') ?? input.value;
        return this._options.find(option => String(option.value) === valueRaw);
    }

    /**
	 * Устанавливает значение выбранной опции. 
	 */
    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        if (data && 'option' in data && (sender as HTMLInputElement).checked) {
            this.setValue((data.option as FieldOption<T>).value);
        } else {
            this.setValue(null);
        }
    }
}
