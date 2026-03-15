import { Form, field } from '../dist/index.js';

/**
 * Пример 1: Регистрация пользователя
 * Email (валидный формат), пароль (от 8 символов, минимум одна буква, минимум одна цифра), 
 * подтверждение пароля (совпадает с паролем).
 */
export class LoginForm extends Form {

    email = field.email('Электронная почта')
        .required('Введите email')
        // Валидация email включена автоматически

    password = field.password('Пароль')
        .required('Придумайте пароль')
        .minLength(8, 'Минимум 8 символов')
        .match(/[A-Za-z]/, 'Нужна хотя бы одна буква')
        .match(/[0-9]/, 'Нужна хотя бы одна цифра')

    passwordConfirm = field.password('Подтверждение пароля')
        .dependsOn(this.password)
        .validate(value => ({
            isValid: value === this.password.getValue(),
            message: 'Пароли не совпадают'
        }))

    onSubmit(values) {
        console.log('Login Form submitted:', values);
        alert('Форма регистрации отправлена!\n' + JSON.stringify(values, null, 2));
    }
}
