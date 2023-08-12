import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { RecruitmentStatus } from '@prisma/client';
@ValidatorConstraint({ name: 'isValidRecruitmentStatus', async: false })
class IsValidRecruitmentStatusConstraint
    implements ValidatorConstraintInterface
{
    validate(value: string) {
        const statuses = value.split(',');
        const isValid = statuses.every((status: RecruitmentStatus) =>
            Object.values(RecruitmentStatus).includes(status),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid status value(s) provided for ${args.property}`;
    }
}

export function IsValidRecruitmentStatus(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidRecruitmentStatus',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidRecruitmentStatusConstraint,
        });
    };
}
