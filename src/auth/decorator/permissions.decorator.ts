import { SetMetadata } from '@nestjs/common';
import { Action, Prisma } from '@prisma/client';

export const Permission_KEY = 'permissions';
export interface Permission {
    action: Action;
    subject: Prisma.ModelName;
}
export const Permissions = (...roles: Permission[]) =>
    SetMetadata(Permission_KEY, roles);
