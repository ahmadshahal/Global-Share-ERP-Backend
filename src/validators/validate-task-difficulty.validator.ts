import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { Difficulty } from '@prisma/client';
@ValidatorConstraint({ name: 'isValidTaskDifficulty', async: false })
class IsValidTaskDifficultyConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        const difficulties = value.split(',');
        const isValid = difficulties.every((difficulty: Difficulty) =>
            Object.values(Difficulty).includes(difficulty),
        );
        return isValid || !value.length;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid difficulty value(s) provided for ${args.property}`;
    }
}

export function IsValidTaskDifficulty(validationOptions?: any) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidTaskDifficulty',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidTaskDifficultyConstraint,
        });
    };
}
