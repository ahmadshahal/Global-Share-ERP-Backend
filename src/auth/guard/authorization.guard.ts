import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission_KEY } from '../decorator/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prismaService: PrismaService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride(
            Permission_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredPermission) {
            return true;
        }
        const permission = await this.prismaService.permission.findFirst({
            where: {
                subject: requiredPermission[0].subject,
                action: requiredPermission[0].action,
            },
            include: {
                roles: {
                    select: {
                        roleId: true,
                    },
                },
            },
        });
        const request = context.switchToHttp().getRequest();
        const user = await this.prismaService.user.findUnique({
            where: {
                id: request.user.id,
            },
            include: {
                role: true
            }
        });
        const isAdmin = user.role.name == 'Admin' 
        return isAdmin || permission.roles.some((role) => role.roleId == user.roleId);
    }
}
