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

    protected _errorContainer: HTMLElement | null = null;
    protected _fieldContainer: HTMLElement | null = null;
    protected _baseElement: HTMLElement | null = null;

    private _requiredCallbacks: RequiredFunction[] = [];
    private _validationCallbacks: ValidatorFunction<T>[] = [];
    private _transformCallbacks: TransformFunction<any, any>[] = [];

    private _updateListeners: Array<() => void> = [];
    private _domUnbinders: Array<() => void> = [];

    constructor(label: string, fieldType: string = 'text') {
        this._label = label;
        this._inputType = fieldType;
    }

    get label(): string {
        return this._label;
    }

    get inputType(): string {
        return this._inputType;
    }

    get rendererOptions(): FieldOption<T>[] {
        return this._options;
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
            for (const callback of this._requiredCallbacks) {
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
        for (const callback of this._validationCallbacks) {
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
        for (const transform of this._transformCallbacks) {
            result = transform(result);
        }
        return result;
    }

    abstract attachElement(base: HTMLElement): void;

    /**
     * Колбэк, вызываемый при изменении элемента ввода
     */
    protected abstract fieldChanged(sender: HTMLElement, data?: object): void;


    protected addUnfocusChecks(node: HTMLElement): void {
        this.bindDomListener(node, 'focusout', (e) => {
            const relatedTarget = (e as FocusEvent).relatedTarget as Node | null;
            if (relatedTarget && node?.contains(relatedTarget)) return;
            this.runAllChecks();
        });
    }

    protected bindBaseElements(base: HTMLElement): HTMLElement {
        this.resetDomBindings();

        this._baseElement = base;
        this._fieldContainer = base.querySelector('.kform-input-container');
        this._errorContainer = base.querySelector('.kform-error-container');

        if (!this._fieldContainer) {
            this._fieldContainer = document.createElement('div');
            this._fieldContainer.className = 'kform-input-container';
            this._fieldContainer.setAttribute('data-slot', 'input');
            base.appendChild(this._fieldContainer);
        }

        if (!this._errorContainer) {
            this._errorContainer = document.createElement('div');
            this._errorContainer.className = 'kform-error-container';
            this._errorContainer.setAttribute('data-slot', 'error');
            base.appendChild(this._errorContainer);
        }

        return this._fieldContainer;
    }

    protected bindDomListener(target: EventTarget, type: string, listener: EventListener): void {
        target.addEventListener(type, listener);
        this._domUnbinders.push(() => target.removeEventListener(type, listener));
    }

    private resetDomBindings(): void {
        this._domUnbinders.forEach(unbind => unbind());
        this._domUnbinders = [];
    }


    /**
     * Обработчик изменения значения input
     */
    protected setValue(value: T | null): void {
        this._value = value;
        this._errors = []; // Сбрасываем ошибки при изменении
        this.updateDisplayedErrors();
        for (const callback of this._updateListeners) {
            callback();
        }
    }

    /**
     * Обновляет отображение ошибок в DOM
     */
    protected updateDisplayedErrors(): void {
        if (!this._errorContainer) return;

        if (this._errors.length > 0) {
            this._errorContainer.textContent = this._errors.join(', ');
            // this.errorContainer.style.display = 'block';
        } else {
            this._errorContainer.textContent = '';
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
        this._updateListeners.push(callback);
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
        this._validationCallbacks.push(normalizedFunc);
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
        this._requiredCallbacks.push(normalizedFunc);
        return this;
    }

    required(message?: string): this {
        if (message === undefined)
            return this.requiredWhen(() => true);
        return this.requiredWhen(() => ({ isRequired: true, message }));
    }

    transform(func: TransformFunction<any, any>): this {
        this._transformCallbacks.push(func);
        return this;
    }

}
