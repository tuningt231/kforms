import { Field } from '../Field.js';

/**
 * File поле (загрузка файлов)
 */
export class FileField extends Field<File | File[]> {

    private _multiple: boolean = false; // todo:

    constructor(label: string) {
        super(label, 'file');
    }

    override renderElement(fieldName: string): HTMLElement {
        const base = this.setupDefaultHtmlStructure();
        this.setupDefaultInputElement(fieldName);
        return base;
    }

    protected fieldChanged(sender: HTMLElement, data?: object): void {
        throw new Error('Method not implemented.'); // todo:
    }

    /**
     * Разрешить выбор нескольких файлов
     */
    multiple(): this {
        this._multiple = true;
        return this;
    }

    /**
     * Валидация типа файлов
     */
    accept(mimeTypes: string[], message?: string): this {
        return this.validate(value => {
            const files = Array.isArray(value) ? value : [value];
            const allValid = files.every(file => 
                mimeTypes.some(type => file.type.match(type))
            );
            return {
                isValid: allValid,
                message: message || `Допустимые типы: ${mimeTypes.join(', ')}`
            };
        });
    }

    /**
     * Валидация максимального размера файла (в байтах)
     */
    maxSize(bytes: number, message?: string): this {
        return this.validate(value => {
            const files = Array.isArray(value) ? value : [value];
            const allValid = files.every(file => file.size <= bytes);
            const mb = (bytes / 1024 / 1024).toFixed(2);
            return {
                isValid: allValid,
                message: message || `Максимальный размер файла: ${mb} МБ`
            };
        });
    }

    // protected createInput(): HTMLInputElement {
    //     const input = document.createElement('input');
    //     input.className = 'kform-control';
    //     input.type = 'file';
        
    //     if (this._multiple) {
    //         input.multiple = true;
    //     }
        
    //     return input;
    // }

    /**
     * Получить значение поля - файл или массив файлов
     */
    // getValue(): File | File[] | undefined {
    //     if (!this.inputElement || !this.inputElement.files || this.inputElement.files.length === 0) {
    //         return undefined;
    //     }
    //     return this._multiple 
    //         ? Array.from(this.inputElement.files)
    //         : this.inputElement.files[0];
    // }

}
