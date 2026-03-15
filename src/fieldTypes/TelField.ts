import { TextField } from './TextField.js';

/**
 * Поле ввода телефона
 */
export class TelField extends TextField {
    constructor(label: string, message?: string) {
        super(label, 'tel');
        this.validatePhone(message || 'Неверный формат телефона');
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.setupDefaultInputElement(fieldName);
        return base;
    }

    private validatePhone(message: string): this {
        return this.match(/^[\d\s\-\+\(\)]+$/, message);
    }
}
