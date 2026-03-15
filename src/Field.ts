import type { FieldOption } from "./fieldTypes/FieldOption.js";

/**
 * Тип для валидационных колбэков
 * Возвращает кортеж: [успех, сообщение об ошибке (опционально)]
 */
export type ValidatorFunction<T> = (value: T) => { isValid: boolean, message?: string };

export type DefaultValidatorFunction<T> = (value: T) => boolean;

/**
 * Тип для требующих валидационных колбэков (required)
 * Возвращает кортеж: [успех, сообщение об ошибке (опционально)]
 */
export type RequiredFunction = () => { isRequired: boolean, message?: string };

export type DefaultRequiredFunction = () => boolean;

/**
 * Тип для колбэков трансформации
 */
export type TransformFunction<T, R> = (value: T) => R;

/**
 * Базовый класс для полей формы
 */
export abstract class Field<T> {
    protected _value: T | null = null;
    protected _label: string;
    protected _inputType: string = 'text';
    protected _errors: string[] = [];

    protected _options: FieldOption<T>[] = [];

    protected errorContainer: HTMLElement | null = null;
    protected fieldContainer: HTMLElement | null = null;
    protected baseElement: HTMLElement | null = null;

    protected requiredCallbacks: RequiredFunction[] = [];
    protected validationCallbacks: ValidatorFunction<T>[] = [];
    protected transformCallbacks: TransformFunction<any, any>[] = [];

    protected updateListeners: Array<() => void> = [];

    constructor(label: string, fieldType: string = 'text') {
        this._label = label;
        this._inputType = fieldType;
    }

    /**
     * Получить преобразованное значение поля
     * Может быть переопределено в подклассах для преобразования типов
     * @returns значение поля в правильном типе
     */
    get value(): T | null {
        return this._value;
    }

    /**
     * Проверяет, пустое ли поле
     * @returns true если поле пустое (undefined, null или пустая строка)
     */
    isEmpty(): boolean {
        if (Array.isArray(this._value)) return this._value.length === 0;
        return this._value === undefined || this._value === null || this._value === '';
    }

    /**
     * Запускает все проверки
     * @returns true если значение поля принято
     */
    runAllChecks(): boolean {
        this._errors = [];

        if (this.isEmpty()) {
            for (const callback of this.requiredCallbacks) {
                const { isRequired, message } = callback();
                if (isRequired) {
                    this._errors.push(message || 'Required');
                    this.updateDisplayedErrors();
                    return false; // required but empty
                }
            }
            this.updateDisplayedErrors();
            return true; // not required and empty, so it's automatically valid
        }

        // not empty, so no matter if it is required or not
        const value = this._value;
        for (const callback of this.validationCallbacks) {
            const { isValid, message } = callback(value as T);
            if (!isValid) {
                this._errors.push(message || 'Invalid value');
                this.updateDisplayedErrors();
                return false;
            }
        }

        this.updateDisplayedErrors();
        return true;
    }

    /**
     * Запускает трансформации значения
     * @returns трансформированное значение
     */
    runTransforms(): any {
        let result = this._value;
        for (const transform of this.transformCallbacks) {
            result = transform(result);
        }
        return result;
    }

    /**
     * Создает и возвращает DOM-элемент поля
     * @param fieldName имя поля (совпадает с именем свойства в классе Form),
     *             устанавливается как атрибуты id и name на элементе управления
     * @returns HTMLElement с полем формы
     */
    abstract renderElement(fieldName: string): HTMLElement;

    /**
     * Колбэк, вызываемый при изменении элемента ввода
     */
    protected abstract fieldChanged(sender: HTMLElement, data?: object): void;


    protected createInput(container: HTMLElement, name: string, type: string, label: string): HTMLInputElement {
        const input = document.createElement('input');
        input.className = 'kform-control';
        input.type = type;

        input.addEventListener('input', (e) => {
            this.fieldChanged(input);
        });

        const labelTag = document.createElement('label');
        labelTag.innerText = label;

        if (name !== undefined) {
            input.name = name;
            input.id = name;
            labelTag.htmlFor = name;
        }

        container.appendChild(labelTag);
        container.appendChild(input);
        return input;
    }


    protected createInputArray(container: HTMLElement, name: string, type: string, options: FieldOption<T>[]): HTMLInputElement[] {
        const ret: HTMLInputElement[] = [];
        options.forEach((option, idx) => {
            const input = document.createElement('input');
            input.className = 'kform-control';
            input.type = type;

            input.addEventListener('change', () => {
                this.fieldChanged(input, {option: option});
            });

            const label = document.createElement('label');
            label.innerText = option.label;

            if (name !== undefined) {
                input.name = name;
                input.id = name + '-' + idx;
                label.htmlFor = name + '-' + idx;
            }

            container.appendChild(label);
            container.appendChild(input);
            ret.push(input);
        });
        return ret;
    }


    protected setupDefaultHtmlStructure(): HTMLElement {
        this.baseElement = document.createElement('div');
        this.fieldContainer = document.createElement('div');
        this.errorContainer = document.createElement('div');
        this.baseElement.className = 'kform-field';
        this.fieldContainer.className = 'kform-input-container';
        this.errorContainer.className = 'kform-error-container';
        this.baseElement.appendChild(this.fieldContainer);
        this.baseElement.appendChild(this.errorContainer);
        return this.baseElement;
    }

    protected setupDefaultInputElement(inputName: string): HTMLInputElement | undefined {
        if (!this.fieldContainer) return undefined;
        const input = this.createInput(this.fieldContainer, inputName, this._inputType, this._label);
        this.addUnfocusChecks(this.fieldContainer);
        return input;
    }

    protected addUnfocusChecks(node: HTMLElement): void {
        node.addEventListener('focusout', (e) => {
            const relatedTarget = (e as FocusEvent).relatedTarget as Node | null;
            if (relatedTarget && node?.contains(relatedTarget)) return;
            this.runAllChecks();
        });
    }


    /**
     * Обработчик изменения значения input
     */
    protected setValue(value: T): void {
        console.log("Set value: " + value);
        
        this._value = value;
        this._errors = []; // Сбрасываем ошибки при изменении
        this.updateDisplayedErrors();
        for (const callback of this.updateListeners) {
            callback();
        }
    }

    /**
     * Обновляет отображение ошибок в DOM
     */
    protected updateDisplayedErrors(): void {
        if (!this.errorContainer) return;

        if (this._errors.length > 0) {
            this.errorContainer.textContent = this._errors.join(', ');
            // this.errorContainer.style.display = 'block';
        } else {
            this.errorContainer.textContent = '';
            // this.errorContainer.style.display = 'none';
        }
    }

    protected setOptionsInternal(opts: FieldOption<T>[] | T[]): this {
        this._options = opts.map(opt => {
            if (typeof opt === 'object' && opt !== null && 'value' in opt) {
                return {value: opt.value, label: opt.label || String(opt.value)};
            }
            return { value: opt, label: String(opt) };
        });
        return this;
    }

    /**
     * Подписаться на изменение значения поля
     */
    addUpdateListener(callback: () => void): this {
        this.updateListeners.push(callback);
        return this;
    }

    dependsOn(...fields: Field<any>[]): this {
        for (const field of fields) {
            field.addUpdateListener(() => {
                this.runAllChecks();
            });
        }
        return this;
    }

    validate(func: ValidatorFunction<T> | DefaultValidatorFunction<T>): this {
        const normalizedFunc: ValidatorFunction<T> = (value: T) => {
            const result = func(value);
            if (typeof result === 'boolean') {
                return { isValid: result };
            }
            return result;
        };
        this.validationCallbacks.push(normalizedFunc);
        return this;
    }

    requiredWhen(func: RequiredFunction | DefaultRequiredFunction): this {
        const normalizedFunc: RequiredFunction = () => {
            const isRequired = func();
            if (typeof isRequired === 'boolean') {
                return { isRequired };
            }
            return isRequired;
        }
        this.requiredCallbacks.push(normalizedFunc);
        return this;
    }

    required(message?: string): this {
        if (message === undefined)
            return this.requiredWhen(() => true);
        return this.requiredWhen(() => ({ isRequired: true, message }));
    }

    transform(func: TransformFunction<any, any>): this {
        this.transformCallbacks.push(func);
        return this;
    }

}
