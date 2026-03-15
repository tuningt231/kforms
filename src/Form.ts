import { Field } from './Field.js';
import { DefaultRenderer } from './DefaultRenderer.js';

/**
 * Базовый класс для создания форм
 */
export class Form {
    protected formElement: HTMLFormElement | null = null;

    private readonly onFormSubmit = (e: Event): void => {
        e.preventDefault();
        if (this.validateAll()) {
            const values = this.getValues();
            this.onSubmit(values);
        }
    };

    /**
     * Рендерит форму и возвращает DOM-элемент
     * @returns HTMLFormElement с формой
     */
    render(form?: HTMLFormElement): HTMLFormElement {
        return this.attach(form || document.createElement('form'));
    }

    /**
     * Привязывает форму к существующей HTML-разметке
     * @param form существующий HTMLFormElement
     * @returns HTMLFormElement с привязанными полями
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
        }

        this.ensureSubmitButton(this.formElement);

        return this.formElement;
    }

    private bindSubmitHandler(form: HTMLFormElement): void {
        form.removeEventListener('submit', this.onFormSubmit);
        form.addEventListener('submit', this.onFormSubmit);
    }

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

    private mergeMissingChildren(target: HTMLElement, source: HTMLElement): void {
        for (const sourceChild of Array.from(source.children)) {
            if (!(sourceChild instanceof HTMLElement)) continue;

            if (!this.hasEquivalentChild(target, sourceChild)) {
                target.appendChild(sourceChild.cloneNode(true));
            }
        }
    }

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

    private ensureSubmitButton(form: HTMLFormElement): void {
        const hasSubmit = form.querySelector('input[type="submit"], button[type="submit"]') !== null;
        if (hasSubmit) return;

        const submitButton = document.createElement('input');
        submitButton.className = 'kform-submit';
        submitButton.type = 'submit';
        form.appendChild(submitButton);
    }


    /**
     * Действие по умолчанию при отправке формы
     */
    onSubmit(values: Record<string, any>) {
        console.log(values);
    }


    /**
     * Валидирует все поля формы
     * @returns true если форма валидна, false иначе
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
     * Получает значения всех полей формы с применением трансформаций
     * @returns объект с значениями полей
     */
    getValues(): Record<string, any> {
        const values: Record<string, any> = {};

        for (const key of Object.keys(this)) {
            const field = (this as any)[key];
            if (field instanceof Field) {
                values[key] = field.runTransforms();
            }
        }

        return values;
    }
}
