import { Field } from '../Field.js';
import type { FieldOption } from './FieldOption.js';

/**
 * Radio поле (одиночный выбор)
 */
export class RadioField<T> extends Field<T> {
    constructor(label: string) {
        super(label, 'radio');
    }

    /**
     * Устанавливает список вариантов выбора.
     * @param opts - массив опций (можно передавать примитивные значения или объекты `FieldOption`)
     */
    options(opts: FieldOption<T>[] | T[]): this {
        return super.setOptionsInternal(opts);
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
