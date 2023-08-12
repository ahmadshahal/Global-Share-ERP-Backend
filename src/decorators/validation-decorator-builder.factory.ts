import {
    registerDecorator,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

function createIsValidConstraint(
    enumObject: object,
    errorMessage: string,
): Function {
    @ValidatorConstraint({ async: false })
    class IsValidConstraint implements ValidatorConstraintInterface {
        validate(value: string) {
            const enumValues = Object.values(enumObject);
            console.log(enumValues);
            const values = value.split(',');
            const isValid = values.every((val) => enumValues.includes(val));
            return isValid || !value.length;
        }

        defaultMessage(args: ValidationArguments) {
            return errorMessage.replace('${args.property}', args.property);
        }
    }

    return function (validationOptions?: any) {
        return function (object: object, propertyName: string) {
            registerDecorator({
                name: 'isValid',
                target: object.constructor,
                propertyName,
                options: validationOptions,
                validator: IsValidConstraint,
            });
        };
    };
}

export function IsValid(enumObject: object, errorMessage: string): Function {
    console.log(enumObject);
    return createIsValidConstraint(enumObject, errorMessage);
}
