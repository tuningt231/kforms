import { TextField } from './TextField.js';

/**
 * Поле ввода пароля
 */
export class PasswordField extends TextField {
    constructor(label: string) {
        super(label, 'password');
    }


    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.setupDefaultInputElement(fieldName)!;
        return base;
    }
}
