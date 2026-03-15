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
     * Текстовое поле ввода.
     * @param label - текст метки
     */
    textInput(label: string): TextField {
        return new TextField(label, 'text');
    },

    /**
     * Email поле с встроенной валидацией формата.
     * @param label - текст метки
     * @param message - переопределение сообщения ошибки валидации
     */
    email(label: string, message?: string): EmailField {
        return new EmailField(label, message);
    },

    /**
     * Поле ввода пароля.
     * @param label - текст метки
     */
    password(label: string): PasswordField {
        return new PasswordField(label);
    },

    /**
     * Поле ввода URL со 0 встроенной валидацией формата.
     * @param label - текст метки
     * @param message - переопределение сообщения ошибки валидации
     */
    url(label: string, message?: string): UrlField {
        return new UrlField(label, message);
    },

    /**
     * Поле ввода телефона со 0 встроенной валидацией формата.
     * @param label - текст метки
     */
    tel(label: string): TelField {
        return new TelField(label);
    },

    /**
     * Многострочное текстовое поле.
     * @param label - текст метки
     */
    textArea(label: string): TextAreaField {
        return new TextAreaField(label);
    },

    /**
     * Числовое поле.
     * @param label - текст метки
     */
    number(label: string): NumberField {
        return new NumberField(label);
    },

    /**
     * Поле выбора даты.
     * @param label - текст метки
     */
    date(label: string): DateField {
        return new DateField(label);
    },

    /**
     * Поле выбора времени.
     * @param label - текст метки
     */
    time(label: string): TimeField {
        return new TimeField(label);
    },

    /**
     * Поле выбора даты и времени.
     * @param label - текст метки
     */
    datetime(label: string): DateTimeField {
        return new DateTimeField(label);
    },

    /**
     * Radio поле (одиночный выбор).
     * @param label - текст групповой метки
     */
    radio<T = string>(label: string): RadioField<T> {
        return new RadioField<T>(label);
    },

    /**
     * Checkbox поле (множественный выбор). Значение — массив выбранных элементов.
     * @param label - текст групповой метки
     */
    checkbox<T = string>(label: string): CheckboxField<T> {
        return new CheckboxField<T>(label);
    },

    /**
     * Select поле (выпадающий список).
     * @param label - текст метки
     */
    select<T = string>(label: string): SelectField<T> {
        return new SelectField<T>(label);
    },

    /**
     * File поле (загрузка файлов).
     * @param label - текст метки
     */
    file(label: string): FileField {
        return new FileField(label);
    },

    /**
     * Поле выбора цвета (HEX-формат).
     * @param label - текст метки
     * @param message - переопределение сообщения ошибки валидации
     */
    color(label: string, message?: string): ColorField {
        return new ColorField(label, message);
    },

    // todo: maybe add hidden field
};

