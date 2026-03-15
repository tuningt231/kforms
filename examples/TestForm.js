import { Form, field } from '../dist/index.js';


export class TestForm extends Form {

    textInput    = field.textInput('Text').required();
    email        = field.email('Email').required();
    password     = field.password('Password').required();
    url          = field.url('URL').required();
    tel          = field.tel('Phone').required();
    textArea     = field.textArea('Textarea').required();
    number       = field.number('Number').required();
    date         = field.date('Date').required();
    time         = field.time('Time').required();
    datetime     = field.datetime('Date & Time').required();
    radio        = field.radio('Radio').options(['Option A', 'Option B', 'Option C']).required();
    checkbox     = field.checkbox('Checkbox').options(['Choice 1', 'Choice 2', 'Choice 3']).required();
    select       = field.select('Select').options(['Apple', 'Banana', 'Cherry']).required();
    // file         = field.file('File').required(); // todo:
    color        = field.color('Color').required();

    onSubmit(values) {
        alert(JSON.stringify(values, null, 2));
    }
}

// todo: visibleWhen
// todo: fieldGroup.minRequired