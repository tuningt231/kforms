import { TextField } from './TextField.js';

/**
 * Поле ввода пароля
 */
export class PasswordField extends TextField {
    constructor(label: string) {
        super(label, 'password');
    }
}
