import { Field } from '../Field.js';

/**
 * File поле (загрузка файлов)
 */
export class FileField extends Field<File | File[]> {

    private _multiple: boolean = false; // todo:

    constructor(label: string) {
        super(label, 'file');
    }

    override attachElement(base: HTMLElement): void {
        const fieldContainer = this.bindBaseElements(base);
        const input = base.querySelector('input.kform-control[type="file"]');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('FileField input not found');
        }

        input.multiple = this._multiple;
        this.bindDomListener(input, 'change', () => {
            this.fieldChanged(input);
        });
        this.addUnfocusChecks(fieldContainer);
    }

    protected fieldChanged(sender: HTMLElement, data?: object): void {
        const files = (sender as HTMLInputElement).files;
        if (!files || files.length === 0) {
            this.setValue(null);
            return;
        }

        if (this._multiple) {
            this.setValue(Array.from(files));
            return;
        }

        this.setValue(files[0] as File);
    }

    /**
     * Разрешить выбор нескольких файлов
     */
    multiple(): this {
        this._multiple = true;
        return this;
    }

    isMultiple(): boolean {
        return this._multiple;
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
}
