import { Field } from './Field.js';

export class DefaultRenderer {
	static renderField(field: Field<any>, fieldName: string): HTMLElement {
		switch (field.inputType) {
			case 'textarea':
				return this.renderTextArea(fieldName, field.label);
			case 'select':
				return this.renderSelect(fieldName, field.label, field.rendererOptions);
			case 'radio':
				return this.renderRadio(fieldName, field.label, field.rendererOptions);
			case 'checkbox':
				return this.renderCheckbox(fieldName, field.label, field.rendererOptions);
			case 'file':
				return this.renderFile(fieldName, field.label, Boolean((field as any).isMultiple?.()));
			default:
				return this.renderInput(fieldName, field.inputType, field.label);
		}
	}

	static renderInput(fieldName: string, inputType: string, label: string): HTMLElement {
		const { base, fieldContainer } = this.renderBase();

		const labelTag = document.createElement('label');
		labelTag.className = 'kform-label';
		labelTag.setAttribute('data-role', 'label');
		labelTag.innerText = label;
		labelTag.htmlFor = fieldName;

		const input = document.createElement('input');
		input.className = 'kform-control';
		input.setAttribute('data-role', 'control');
		input.type = inputType;
		input.name = fieldName;
		input.id = fieldName;

		fieldContainer.appendChild(labelTag);
		fieldContainer.appendChild(input);
		return base;
	}

	static renderTextArea(fieldName: string, label: string): HTMLElement {
		const { base, fieldContainer } = this.renderBase();

		const labelTag = document.createElement('label');
		labelTag.className = 'kform-label';
		labelTag.setAttribute('data-role', 'label');
		labelTag.innerText = label;
		labelTag.htmlFor = fieldName;

		const textarea = document.createElement('textarea');
		textarea.className = 'kform-control';
		textarea.setAttribute('data-role', 'control');
		textarea.name = fieldName;
		textarea.id = fieldName;

		fieldContainer.appendChild(labelTag);
		fieldContainer.appendChild(textarea);
		return base;
	}

	static renderSelect<T>(fieldName: string, label: string, options: Array<{ value: T, label: string }>): HTMLElement {
		const { base, fieldContainer } = this.renderBase();

		const labelTag = document.createElement('label');
		labelTag.className = 'kform-label';
		labelTag.setAttribute('data-role', 'label');
		labelTag.innerText = label;
		labelTag.htmlFor = fieldName;

		const select = document.createElement('select');
		select.className = 'kform-control';
		select.setAttribute('data-role', 'control');
		select.name = fieldName;
		select.id = fieldName;

		const emptyOption = document.createElement('option');
		emptyOption.value = '';
		emptyOption.textContent = '';
		select.appendChild(emptyOption);

		options.forEach((option) => {
			const optionTag = document.createElement('option');
			optionTag.value = String(option.value);
			optionTag.textContent = option.label;
			select.appendChild(optionTag);
		});

		fieldContainer.appendChild(labelTag);
		fieldContainer.appendChild(select);
		return base;
	}

	static renderRadio<T>(fieldName: string, label: string, options: Array<{ value: T, label: string }>): HTMLElement {
		return this.renderChoiceInput('radio', fieldName, label, options);
	}

	static renderCheckbox<T>(fieldName: string, label: string, options: Array<{ value: T, label: string }>): HTMLElement {
		return this.renderChoiceInput('checkbox', fieldName, label, options);
	}

	static renderFile(fieldName: string, label: string, multiple: boolean): HTMLElement {
		const base = this.renderInput(fieldName, 'file', label);
		const input = base.querySelector('input.kform-control[type="file"]');
		if (input instanceof HTMLInputElement) {
			input.multiple = multiple;
		}
		return base;
	}

	private static renderChoiceInput<T>(
		inputType: 'radio' | 'checkbox',
		fieldName: string,
		label: string,
		options: Array<{ value: T, label: string }>
	): HTMLElement {
		const { base, fieldContainer } = this.renderBase();

		const groupLabel = document.createElement('label');
		groupLabel.className = 'kform-label';
		groupLabel.setAttribute('data-role', 'label');
		groupLabel.innerText = label;
		fieldContainer.appendChild(groupLabel);

		options.forEach((option, idx) => {
			const optionContainer = document.createElement('div');
			optionContainer.className = 'kform-option';
			optionContainer.setAttribute('data-role', 'option');
			optionContainer.setAttribute('data-option-index', String(idx));

			const input = document.createElement('input');
			input.className = 'kform-control';
			input.setAttribute('data-role', 'control');
			input.type = inputType;
			input.name = fieldName;
			input.id = `${fieldName}-${idx}`;
			input.setAttribute('data-option-index', String(idx));
			input.setAttribute('data-option-value', String(option.value));
			input.value = String(option.value);

			const optionLabel = document.createElement('label');
			optionLabel.className = 'kform-option-label';
			optionLabel.setAttribute('data-role', 'option-label');
			optionLabel.htmlFor = input.id;
			optionLabel.innerText = option.label;

			optionContainer.appendChild(input);
			optionContainer.appendChild(optionLabel);
			fieldContainer.appendChild(optionContainer);
		});

		return base;
	}

	private static renderBase(): {
		base: HTMLDivElement,
		fieldContainer: HTMLDivElement,
		errorContainer: HTMLDivElement,
	} {
		const base = document.createElement('div');
		base.className = 'kform-field';

		const fieldContainer = document.createElement('div');
		fieldContainer.className = 'kform-input-container';
		fieldContainer.setAttribute('data-slot', 'input');

		const errorContainer = document.createElement('div');
		errorContainer.className = 'kform-error-container';
		errorContainer.setAttribute('data-slot', 'error');

		base.appendChild(fieldContainer);
		base.appendChild(errorContainer);

		return { base, fieldContainer, errorContainer };
	}
}
