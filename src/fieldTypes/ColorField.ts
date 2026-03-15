import { Field } from '../Field.js';

/**
 * Поле выбора цвета
 */
export class ColorField extends Field<string> {
    constructor(label: string, message?: string) {
        super(label, 'color');
        this.validateHex(message || 'Неверный формат HEX цвета');
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.setupDefaultInputElement(fieldName);
        return base;
    }

    protected override fieldChanged(sender: HTMLElement, data?: object): void {
        this.setValue((sender as HTMLInputElement).value);
    }

    private validateHex(message: string): this {
        return this.validate(value => ({
            isValid: /^#[0-9A-Fa-f]{6}$/.test(value),
            message: message
        }));
    }

}
