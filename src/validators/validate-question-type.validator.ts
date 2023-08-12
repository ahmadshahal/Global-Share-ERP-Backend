import { QuestionType } from '@prisma/client';
import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidQuestionType', async: false })
class IsValidQuestionTypeConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        const levels = value.split(',');
        const isValid = levels.every((level: QuestionType) =>
            Object.values(QuestionType).includes(level),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid question type value(s) provided for ${args.property}`;
    }
}

export function IsValidQuestionType(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidQuestionType',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidQuestionTypeConstraint,
        });
    };
}
