import { FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';

export const jobDescriptionFileValidator = [
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
    new FileTypeValidator({ fileType: '.(pdf|docx)' }),
];
