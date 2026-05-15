import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

type OptionsSource<T> = FieldOption<T>[] | T[] | (() => FieldOption<T>[] | T[]);

/**
 * Checkbox поле (множественный выбор)
 */
export class CheckboxField<T> extends Field<T[]> {
    private _optionsCallback: (() => FieldOption<T>[] | T[]) | null = null;

    constructor(label: string) {
        super(label, 'checkbox');
    }

    /**
     * Устанавливает список вариантов выбора.
     * @param opts - статический массив или колбэк, пересчитываемый при изменении зависимых полей
     */
    options(opts: OptionsSource<T>): this {
        if (typeof opts === 'function') {
            this._optionsCallback = opts;
            return this.applyOptions(opts());
        }
        return this.applyOptions(opts);
    }

    private applyOptions(opts: FieldOption<T>[] | T[]): this {
        return super.setOptionsInternal(opts.map(opt => {
            if (typeof opt === 'object' && opt !== null && 'value' in opt) {
                return { value: [opt.value], label: opt.label || String(opt.value) };
            }
            return { value: [opt], label: String(opt) };
        }));
    }

    protected override refreshOptions(): void {
        if (!this._optionsCallback) return;
        this.applyOptions(this._optionsCallback());
        const current = this._value;
        if (Array.isArray(current) && current.length > 0) {
            const validValues = new Set(this._options.map(opt => String(opt.value[0])));
            const filtered = current.filter(v => validValues.has(String(v)));
            if (filtered.length !== current.length) this.setValue(filtered);
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
            input.type = 'checkbox';
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
	 * Привязывает поле к дом-дереву, находит все `<input type="checkbox">` и навешивает обработчики. 
	 */
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

    /**
	 * Находит объект `FieldOption` для переданного `<input>`: сначала по `data-option-index`, затем по значению. 
	 */
    private resolveOption(input: HTMLInputElement): FieldOption<T[]> | undefined {
        const indexRaw = input.getAttribute('data-option-index');
        if (indexRaw !== null) {
            const byIndex = this._options[Number(indexRaw)];
            if (byIndex) return byIndex;
        }

        const valueRaw = input.getAttribute('data-option-value') ?? input.value;
        return this._options.find(option => String(option.value) === valueRaw);
    }

    /**
	 * Колбэк изменения значения поля. 
	 */
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
     * Валидация минимального количества выбранных элементов.
     * @param min - минимальное число выбранных чекбоксов
     * @param message - переопределение сообщения об ошибке
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
     * Валидация максимального количества выбранных элементов.
     * @param max - максимальное число выбранных чекбоксов
     * @param message - переопределение сообщения об ошибке
     */
    maxSelected(max: number, message?: string): this {
        return this.validate(value => ({
            isValid: value.length <= max,
            message: message || `Можно выбрать максимум ${max}`
        }));
    }
}
