import { FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common";


export const SquadImageValidator = [
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
]