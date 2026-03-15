import { TextField } from './TextField.js';

/**
 * Поле ввода URL
 */
export class UrlField extends TextField {
    constructor(label: string, message?: string) {
        super(label, 'url');
        this.validateUrl(message || 'Неверный формат URL');
    }

    private validateUrl(message: string): this {
        return this.validate(value => {
            try {
                new URL(value);
                return { isValid: true };
            } catch {
                return { isValid: false, message: message };
            }
        });
    }
}
