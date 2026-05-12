import { Field } from './Field.js';
import { DefaultRenderer } from './DefaultRenderer.js';

/**
 * Базовый класс для создания форм
 */
export class Form {
    protected formElement: HTMLFormElement | null = null;

    /**
	 * Обработчик отправки формы: предотвращает дефолтное поведение, запускает валидацию и вызывает `onSubmit`. 
	 */
    private readonly onFormSubmit = (e: Event): void => {
        e.preventDefault();
        if (this.validateAll()) {
            const values = this.getValues();
            this.onSubmit(values);
        }
    };

    /**
     * Рендерит форму, Οбёртка над `attach`: если элемент не передан, создаёт новый `<form>`.
     * @param form - необязательный существующий `HTMLFormElement`
     * @returns рендерное DOM-дерево формы
     */
    render(form?: HTMLFormElement): HTMLFormElement {
        return this.attach(form || document.createElement('form'));
    }

    /**
     * Привязывает поля формы к существующей HTML-разметке, достраивая недостающие элементы. Назначение `render()` является алиасом этого метода.
     * @param form - `HTMLFormElement`, к которому привязывается форма
     * @returns тот же `HTMLFormElement` с привязанными полями
     */
    attach(form: HTMLFormElement): HTMLFormElement {
        this.formElement = form;
        this.bindSubmitHandler(this.formElement);

        for (const key of Object.keys(this)) {
            const field = (this as any)[key];
            if (!(field instanceof Field)) continue;

            const base = this.findOrCreateFieldBase(this.formElement, field, key);
            const preparedElement = this.ensureFieldMarkup(base, field, key);
            field.attachElement(preparedElement);
            field.updateVisibility();
        }

        this.ensureSubmitButton(this.formElement);

        return this.formElement;
    }

    /**
	 * Идемпотентно регистрирует обработчик `submit` на элементе формы. 
	 */
    private bindSubmitHandler(form: HTMLFormElement): void {
        form.removeEventListener('submit', this.onFormSubmit);
        form.addEventListener('submit', this.onFormSubmit);
    }

    /**
	 * Ищет корневой элемент `.kform-field` для указанного поля внутри формы. 
	 */
    private findFieldBaseElement(form: HTMLFormElement, fieldName: string): HTMLElement | null {
        const byDataFieldName = form.querySelector(`.kform-field[data-field-name="${fieldName}"]`);
        if (byDataFieldName instanceof HTMLElement) {
            return byDataFieldName;
        }

        const control = form.querySelector(`#${fieldName}`)
            || form.querySelector(`[name="${fieldName}"]`);

        if (!(control instanceof HTMLElement)) {
            return null;
        }

        const base = control.closest('.kform-field');
        if (base instanceof HTMLElement) {
            return base;
        }

        return null;
    }

    /**
	 * Возвращает существующий базовый элемент поля или, если он отсутствует, генерирует его через `DefaultRenderer` и добавляет в форму. 
	 */
    private findOrCreateFieldBase(form: HTMLFormElement, field: Field<any>, fieldName: string): HTMLElement {
        const existingBase = this.findFieldBaseElement(form, fieldName);
        if (existingBase instanceof HTMLElement) {
            return existingBase;
        }

        const generatedField = DefaultRenderer.renderField(field, fieldName);
        generatedField.setAttribute('data-field-name', fieldName);
        form.appendChild(generatedField);
        return generatedField;
    }

    /**
	 * Достраивает недостающие слоты и элементы внутри корневого элемента поля цвет шаблона `DefaultRenderer`. 
	 */
    private ensureFieldMarkup(base: HTMLElement, field: Field<any>, fieldName: string): HTMLElement {
        base.classList.add('kform-field');
        base.setAttribute('data-field-name', fieldName);

        const template = DefaultRenderer.renderField(field, fieldName);
        const templateInputContainer = template.querySelector('[data-slot="input"]');
        const templateErrorContainer = template.querySelector('[data-slot="error"]');

        if (!(templateInputContainer instanceof HTMLElement) || !(templateErrorContainer instanceof HTMLElement)) {
            return base;
        }

        let inputContainer = base.querySelector('[data-slot="input"]');
        if (!(inputContainer instanceof HTMLElement)) {
            inputContainer = templateInputContainer.cloneNode(true) as HTMLElement;
            base.appendChild(inputContainer);
        } else {
            this.mergeMissingChildren(inputContainer, templateInputContainer);
        }

        let errorContainer = base.querySelector('[data-slot="error"]');
        if (!(errorContainer instanceof HTMLElement)) {
            errorContainer = templateErrorContainer.cloneNode(true) as HTMLElement;
            base.appendChild(errorContainer);
        }

        return base;
    }

    /**
	 * Переносит из `source` в `target` дочерние элементы, аналоги которых в `target` отсутствуют. 
	 */
    private mergeMissingChildren(target: HTMLElement, source: HTMLElement): void {
        for (const sourceChild of Array.from(source.children)) {
            if (!(sourceChild instanceof HTMLElement)) continue;

            if (!this.hasEquivalentChild(target, sourceChild)) {
                target.appendChild(sourceChild.cloneNode(true));
            }
        }
    }

    /**
	 * Проверяет, есть ли в `container` элемент, эквивалентный `child` по атрибутам `data-role` и идентификаторам. 
	 */
    private hasEquivalentChild(container: HTMLElement, child: HTMLElement): boolean {
        const role = child.getAttribute('data-role');
        if (role === 'label') {
            return container.querySelector('[data-role="label"]') !== null;
        }

        if (role === 'control') {
            const optionIndex = child.getAttribute('data-option-index');
            if (optionIndex !== null) {
                return container.querySelector(`[data-role="control"][data-option-index="${optionIndex}"]`) !== null;
            }

            if (child.id) {
                return container.querySelector(`#${child.id}`) !== null;
            }

            const name = child.getAttribute('name');
            if (name) {
                return container.querySelector(`[data-role="control"][name="${name}"]`) !== null;
            }
        }

        if (role === 'option') {
            const optionIndex = child.getAttribute('data-option-index');
            if (optionIndex !== null) {
                return container.querySelector(`[data-role="option"][data-option-index="${optionIndex}"]`) !== null;
            }
        }

        if (child.id) {
            return container.querySelector(`#${child.id}`) !== null;
        }

        if (child.matches('input.kform-control, select.kform-control, textarea.kform-control')) {
            const tagName = child.tagName.toLowerCase();
            const name = child.getAttribute('name');
            const type = child.getAttribute('type');
            const typeQuery = type ? `[type="${type}"]` : '';
            const nameQuery = name ? `[name="${name}"]` : '';
            return container.querySelector(`${tagName}.kform-control${nameQuery}${typeQuery}`) !== null;
        }

        return false;
    }

    /**
	 * Добавляет кнопку отправки, если она ещё не присутствует в форме. 
	 */
    private ensureSubmitButton(form: HTMLFormElement): void {
        const hasSubmit = form.querySelector('input[type="submit"], button[type="submit"]') !== null;
        if (hasSubmit) return;

        const submitButton = document.createElement('input');
        submitButton.className = 'kform-submit';
        submitButton.type = 'submit';
        form.appendChild(submitButton);
    }


    /**
     * Вызывается после успешной валидации при отправке формы. Может быть переопределён в подклассе.
     * @param values - плоский объект со значениями всех полей ({fieldName: value})
     */
    onSubmit(values: Record<string, any>) {
        console.log(values);
    }


    /**
     * Валидирует все поля формы.
     * @returns `true`, если все поля прошли валидацию
     */
    validateAll(): boolean {
        let isAllValid = true;

        for (const key of Object.keys(this)) {
            const field = (this as any)[key];
            if (field instanceof Field) {
                const isValid = field.runAllChecks();
                if (!isValid)
                    isAllValid = false;
            }
        }

        return isAllValid;
    }

    /**
     * Собирает значения всех полей формы с применением трансформаций.
     * @returns объект `{ fieldName: transformedValue }`
     */
    getValues(): Record<string, any> {
        const values: Record<string, any> = {};

        for (const key of Object.keys(this)) {
            const field = (this as any)[key];
            if (field instanceof Field) {
                values[key] = field.isHidden() ? null : field.runTransforms();
            }
        }

        return values;
    }
}
