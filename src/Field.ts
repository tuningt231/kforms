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
    private _hiddenCallbacks: Array<() => boolean> = [];

    private _updateListeners: Array<() => void> = [];
    private _domUnbinders: Array<() => void> = [];

    constructor(label: string, fieldType: string = 'text') {
        this._label = label;
        this._inputType = fieldType;
    }

    /**
     * Метка поля, отображаемая в разметке. 
     */
    get label(): string {
        return this._label;
    }

    /**
     * Тип HTML-ввода поля (например, "text", "email", "select"). 
     */
    get inputType(): string {
        return this._inputType;
    }

    /**
     * Список опций поля, используемый рендерером. 
     */
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

        if (this.isHidden()) {
            this.updateDisplayedErrors();
            return true;
        }

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

    /**
     * Привязывает поле к существующему DOM-элементу, находя вложенные элементы управления и навешивая обработчики.
     * @param base - корневой элемент поля (`.kform-field`)
     */
    abstract attachElement(base: HTMLElement): void;

    /**
     * Вызывается при изменении элемента ввода; обновляет значение поля. 
     */
    protected abstract fieldChanged(sender: HTMLElement, data?: object): void;


    /**
     * Навешивает проверку валидации при потере фокуса на указанный элемент. 
     */
    protected addUnfocusChecks(node: HTMLElement): void {
        this.bindDomListener(node, 'focusout', (e) => {
            const relatedTarget = (e as FocusEvent).relatedTarget as Node | null;
            if (relatedTarget && node?.contains(relatedTarget)) return;
            this.runAllChecks();
        });
    }

    /**
     * Связывает базовый элемент поля с внутренними ссылками; при необходимости создаёт недостающие контейнеры. 
     */
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

    /**
     * Добавляет DOM-обработчик и сохраняет функцию для его последующего удаления (идемпотентность). 
     */
    protected bindDomListener(target: EventTarget, type: string, listener: EventListener): void {
        target.addEventListener(type, listener);
        this._domUnbinders.push(() => target.removeEventListener(type, listener));
    }

    /**
     * Снимает все ранее зарегистрированные DOM-обработчики и очищает список отписок. 
     */
    private resetDomBindings(): void {
        this._domUnbinders.forEach(unbind => unbind());
        this._domUnbinders = [];
    }


    /**
     * Устанавливает новое значение поля, сбрасывает ошибки и уведомляет подписчиков. 
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

    /**
     * Нормализует и сохраняет список опций выбора, приводя примитивные значения к формату `FieldOption`. 
     */
    protected setOptionsInternal(opts: FieldOption<T>[] | T[]): this {
        this._options = opts.map(opt => {
            if (typeof opt === 'object' && opt !== null && 'value' in opt) {
                return { value: opt.value, label: opt.label || String(opt.value) };
            }
            return { value: opt, label: String(opt) };
        });
        return this;
    }

    /**
     * Подписывает колбэк на изменение значения поля.
     * @param callback - функция, вызываемая при каждом обновлении значения
     */
    addUpdateListener(callback: () => void): this {
        this._updateListeners.push(callback);
        return this;
    }

    /**
     * Перезапускает валидацию текущего поля при изменении любого из переданных полей.
     * @param fields - поля, от которых зависит данное поле
     */
    dependsOn(...fields: Field<any>[]): this {
        for (const field of fields) {
            field.addUpdateListener(() => {
                this.refreshOptions();
                this.updateVisibility();
                this.runAllChecks();
            });
        }
        return this;
    }

    /**
     * Хук для пересчёта динамических опций при изменении зависимых полей.
     * Переопределяется в SelectField, RadioField, CheckboxField.
     */
    protected refreshOptions(): void {}

    /**
     * Скрывает поле, когда переданная функция возвращает `true`.
     * Скрытое поле пропускает валидацию и возвращает `null` в `getValues()`.
     * @param func - условие скрытия поля
     */
    hiddenWhen(func: () => boolean): this {
        this._hiddenCallbacks.push(func);
        return this;
    }

    /**
     * Возвращает `true`, если хотя бы один колбэк `hiddenWhen` вернул `true`.
     */
    isHidden(): boolean {
        return this._hiddenCallbacks.some(cb => cb());
    }

    /**
     * Обновляет видимость базового элемента поля в DOM согласно `isHidden()`.
     * Вызывается автоматически при привязке и при изменении зависимых полей.
     */
    updateVisibility(): void {
        if (!this._baseElement) return;
        this._baseElement.style.display = this.isHidden() ? 'none' : '';
    }

    /**
     * Добавляет функцию валидации значения поля.
     * @param func - валидатор; может возвращать `boolean` или объект `{ isValid, message? }`
     */
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

    /**
     * Делает поле обязательным, когда переданная функция возвращает истину.
     * @param func - условие обязательности; может возвращать `boolean` или объект `{ isRequired, message? }`
     */
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

    /**
     * Делает поле безусловно обязательным.
     * @param message - сообщение об ошибке при пустом значении
     */
    required(message?: string): this {
        if (message === undefined)
            return this.requiredWhen(() => true);
        return this.requiredWhen(() => ({ isRequired: true, message }));
    }

    /**
     * Добавляет функцию трансформации, применяемую к значению при вызове `runTransforms()`.
     * @param func - функция преобразования значения
     */
    transform(func: TransformFunction<any, any>): this {
        this._transformCallbacks.push(func);
        return this;
    }

}
