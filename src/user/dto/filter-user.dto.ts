import { GsStatus, GsLevel } from '@prisma/client';
import {
    IsOptional,
    IsString,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
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
export class FilterUserDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsValidStatus()
    status: string;

    @IsOptional()
    @IsValidLevel()
    level: string;

    @IsOptional()
    positions: string;

    @IsOptional()
    squads: string;
}
