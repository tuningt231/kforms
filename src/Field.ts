
/**
 * Тип для валидационных колбэков
 * Возвращает кортеж: [успех, сообщение об ошибке (опционально)]
 */
export type ValidatorFunction<T> = (value: T) => {isValid: boolean, message?: string};

export type DefaultValidatorFunction<T> = (value: T) => boolean;

/**
 * Тип для требующих валидационных колбэков (required)
 * Возвращает кортеж: [успех, сообщение об ошибке (опционально)]
 */
export type RequiredFunction = () => {isRequired: boolean, message?: string};

export type DefaultRequiredFunction = () => boolean;

/**
 * Тип для колбэков трансформации
 */
export type TransformFunction<T, R> = (value: T) => R;

/**
 * Базовый класс для полей формы
 */
export class Field<T> {
    protected _value: T | undefined;
    protected _label: string;
    protected _fieldType: string = 'text';
    protected _errors: string[] = [];

    // DOM элементы
    protected wrapperElement: HTMLElement | null = null;
    protected inputElement: HTMLInputElement | null = null;
    protected errorElement: HTMLElement | null = null;

    /**
     * Массивы колбэков
     */
    protected requiredCallbacks: RequiredFunction[] = [];
    protected validationCallbacks: ValidatorFunction<T>[] = [];
    protected transformCallbacks: TransformFunction<any, any>[] = [];

    constructor(label: string, fieldType: string = 'text') {
        this._label = label;
        this._fieldType = fieldType;
    }

    /**
     * Проверяет, пустое ли поле
     * @returns true если поле пустое (undefined, null или пустая строка)
     */
    isEmpty(): boolean {
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
                const {isRequired, message} = callback();
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
        for (const callback of this.validationCallbacks) {
            const {isValid, message}  = callback(this._value as T);
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
        let result: any = this._value;

        for (const transform of this.transformCallbacks) {
            result = transform(result);
        }

        return result;
    }

    /**
     * Создает и возвращает DOM-элемент поля
     * @returns HTMLElement с полем формы
     */
    renderElement(): HTMLElement {
        // Создаем обертку
        this.wrapperElement = document.createElement('div');
        this.wrapperElement.className = 'kform-field';

        // Создаем label
        const label = document.createElement('label');
        label.className = 'kform-label';
        label.textContent = this._label;

        // Создаем input
        this.inputElement = this.createInput();

        // Привязываем обработчик изменений
        this.inputElement.addEventListener('input', (e) => {
            this.handleInputChange(e);
        });

        // Создаем контейнер для ошибок
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'kform-error';
        this.errorElement.style.display = 'none';

        // Собираем элемент
        this.wrapperElement.appendChild(label);
        this.wrapperElement.appendChild(this.inputElement);
        this.wrapperElement.appendChild(this.errorElement);

        return this.wrapperElement;
    }

    /**
     * Создает input элемент
     * Может быть переопределен в подклассах
     */
    protected createInput(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = this._fieldType;

        if (this._value !== undefined) {
            input.value = String(this._value);
        }

        return input;
    }

    /**
     * Обработчик изменения значения input
     */
    protected handleInputChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this._value = target.value as any;
        this._errors = []; // Сбрасываем ошибки при изменении
        this.updateDisplayedErrors();
    }

    /**
     * Обновляет отображение ошибок в DOM
     */
    protected updateDisplayedErrors(): void {
        if (!this.errorElement) return;

        if (this._errors.length > 0) {
            this.errorElement.textContent = this._errors.join(', ');
            this.errorElement.style.display = 'block';
        } else {
            this.errorElement.textContent = '';
            this.errorElement.style.display = 'none';
        }
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
                return {isRequired};
            }
            return isRequired;
        }
        this.requiredCallbacks.push(normalizedFunc);
        return this;
    }

    required(message?: string): this {
        if (message === undefined)
            return this.requiredWhen(() => true);
        return this.requiredWhen(() => ({isRequired: true, message}));
    }

    transform(func: TransformFunction<any, any>): this {
        this.transformCallbacks.push(func);
        return this;
    }

}
