import { Field } from './Field.js';

/**
 * Базовый класс для создания форм
 */
export class Form {
    protected formElement: HTMLFormElement | null = null;

    /**
     * Рендерит форму и возвращает DOM-элемент
     * @returns HTMLFormElement с формой
     */
    render(form?: HTMLFormElement): HTMLFormElement {
        this.formElement = form || document.createElement('form');

        // Привязываем обработчик submit
        this.formElement.addEventListener('submit', e => {
            e.preventDefault();
            if (this.validateAll()) {
                const values = this.getValues();
                this.onSubmit(values);
            }
        });

        // Рендерим все поля формы
        for (const key of Object.keys(this)) {
            const field = (this as any)[key];
            if (field instanceof Field) {
                const fieldElement = field.renderElement();
                this.formElement.appendChild(fieldElement);
            }
        }

        // Добавить submit кнопку
        const submitButton = document.createElement('input');
        submitButton.setAttribute('type', 'submit');
        this.formElement.appendChild(submitButton);

        return this.formElement;
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
