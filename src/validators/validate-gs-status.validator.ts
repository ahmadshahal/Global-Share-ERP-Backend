import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { GsStatus } from '@prisma/client';
@ValidatorConstraint({ name: 'isValidStatus', async: false })
class IsValidStatusConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        const statuses = value.split(',');
        const isValid = statuses.every((status: GsStatus) =>
            Object.values(GsStatus).includes(status),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid status value(s) provided for ${args.property}`;
    }
}

export function IsValidStatus(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidStatus',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidStatusConstraint,
        });
    };
}
