import { Field } from '../Field.js';

/**
 * Поле выбора цвета
 */
export class ColorField extends Field<string> {
    constructor(label: string, message?: string) {
        super(label, 'color');
        this.validateHex(message || 'Неверный формат HEX цвета');
    }

    /**
	 * Привязывает поле к дом-дереву, находит `<input type="color">` и навешивает обработчик. 
	 */
    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('ColorField input not found');
        }
        this.bindDomListener(input, 'input', () => {
            this.fieldChanged(input);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    /**
	 * Обновляет значение поля HEX-строкой цвета. 
	 */
    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        this.setValue((sender as HTMLInputElement).value);
    }

    /**
	 * Внутренняя валидация формата HEX-цвета. 
	 */
    private validateHex(message: string): this {
        return this.validate(value => ({
            isValid: /^#[0-9A-Fa-f]{6}$/.test(value),
            message: message
        }));
    }

}
