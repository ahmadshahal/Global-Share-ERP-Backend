import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { RequestStatus } from '@prisma/client';
@ValidatorConstraint({ name: 'isValidRequestStatus', async: false })
class IsValidRequestStatusConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        const statuses = value.split(',');
        const isValid = statuses.every((status: RequestStatus) =>
            Object.values(RequestStatus).includes(status),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid status value(s) provided for ${args.property}`;
    }
}

export function IsValidRequestStatus(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidRequestStatus',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidRequestStatusConstraint,
        });
    };
}
