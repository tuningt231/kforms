import { TextField } from './fieldTypes/TextField.js';
import { EmailField } from './fieldTypes/EmailField.js';
import { PasswordField } from './fieldTypes/PasswordField.js';
import { UrlField } from './fieldTypes/UrlField.js';
import { TelField } from './fieldTypes/TelField.js';
import { TextAreaField } from './fieldTypes/TextAreaField.js';
import { NumberField } from './fieldTypes/NumberField.js';
import { DateField } from './fieldTypes/DateField.js';
import { TimeField } from './fieldTypes/TimeField.js';
import { DateTimeField } from './fieldTypes/DateTimeField.js';
import { RadioField } from './fieldTypes/RadioField.js';
import { CheckboxField } from './fieldTypes/CheckboxField.js';
import { SelectField } from './fieldTypes/SelectField.js';
import { FileField } from './fieldTypes/FileField.js';
import { ColorField } from './fieldTypes/ColorField.js';

/**
 * Фабрика для создания полей формы
 * Использование: field.textInput('Label'), field.email('Email'), и т.д.
 */
export const field = {
    /**
     * Текстовое поле ввода
     */
    textInput(label: string): TextField {
        return new TextField(label, 'text');
    },

    /**
     * Email поле
     */
    email(label: string, message?: string): EmailField {
        return new EmailField(label, message);
    },

    /**
     * Поле ввода пароля
     */
    password(label: string): PasswordField {
        return new PasswordField(label);
    },

    /**
     * Поле ввода URL
     */
    url(label: string, message?: string): UrlField {
        return new UrlField(label, message);
    },

    /**
     * Поле ввода телефона
     */
    tel(label: string): TelField {
        return new TelField(label);
    },

    /**
     * Многострочное текстовое поле
     */
    textArea(label: string): TextAreaField {
        return new TextAreaField(label);
    },

    /**
     * Числовое поле
     */
    number(label: string): NumberField {
        return new NumberField(label);
    },

    /**
     * Поле выбора даты
     */
    date(label: string): DateField {
        return new DateField(label);
    },

    /**
     * Поле выбора времени
     */
    time(label: string): TimeField {
        return new TimeField(label);
    },

    /**
     * Поле выбора даты и времени
     */
    datetime(label: string): DateTimeField {
        return new DateTimeField(label);
    },

    /**
     * Radio поле (одиночный выбор)
     */
    radio<T = string>(label: string): RadioField<T> {
        return new RadioField<T>(label);
    },

    /**
     * Checkbox поле (множественный выбор)
     */
    checkbox<T = string>(label: string): CheckboxField<T> {
        return new CheckboxField<T>(label);
    },

    /**
     * Select поле (выпадающий список)
     */
    select<T = string>(label: string): SelectField<T> {
        return new SelectField<T>(label);
    },

    /**
     * File поле (загрузка файлов)
     */
    file(label: string): FileField {
        return new FileField(label);
    },

    /**
     * Поле выбора цвета
     */
    color(label: string, message?: string): ColorField {
        return new ColorField(label, message);
    },

    // todo: maybe add hidden field
};

