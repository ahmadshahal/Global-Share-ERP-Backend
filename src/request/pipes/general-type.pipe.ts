import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { RequestGeneralType } from 'src/request/enums/request-general-type.enum';

@Injectable()
export class RequestGeneralTypeValidationPipe implements PipeTransform {
    transform(value: any): RequestGeneralType {
        if (!Object.values(RequestGeneralType).includes(value)) {
            throw new BadRequestException('Invalid generalType');
        }

        return value;
    }
}
