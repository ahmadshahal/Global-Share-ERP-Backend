import { GsLevel } from '@prisma/client';
import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidLevel', async: false })
class IsValidLevelConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        const levels = value.split(',');
        const isValid = levels.every((level: GsLevel) =>
            Object.values(GsLevel).includes(level),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid level value(s) provided for ${args.property}`;
    }
}

export function IsValidLevel(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidLevel',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidLevelConstraint,
        });
    };
}
