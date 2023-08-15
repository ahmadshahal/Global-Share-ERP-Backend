import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { Priority } from '@prisma/client';
@ValidatorConstraint({ name: 'isValidTaskPriority', async: false })
class IsValidTaskPriorityConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        const priorities = value.split(',');
        const isValid = priorities.every((priority: Priority) =>
            Object.values(Priority).includes(priority),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid priority value(s) provided for ${args.property}`;
    }
}

export function IsValidTaskPriority(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidTaskPriority',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidTaskPriorityConstraint,
        });
    };
}
