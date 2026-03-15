import { TextField } from './TextField.js';

/**
 * Email поле с валидацией
 */
export class EmailField extends TextField {
    constructor(label: string, message?: string) {
        super(label, 'email');
        this.validateEmail(message);
    }

    private validateEmail(message?: string): this {
        return this.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message || 'Неверный формат email');
    }
}
