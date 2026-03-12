import { Form, Field } from '../dist/index.js';


export class TestForm extends Form {

    exampleField = new Field('Введите строку длиннее 5 символов')
        .required()
        .validate(val => ({isValid: val.length > 5, message: "Слишком короткая"}))
    

    onSubmit(values) {
        alert(JSON.stringify(values, null, 2));
    }
}

// todo: visibleWhen
// todo: fieldGroup.minRequired