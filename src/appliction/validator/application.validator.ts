import { FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common";

export const ApplicationFilesValidator = [
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 16 }),
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
];
