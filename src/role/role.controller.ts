import { Controller, Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { AuthorizationGuard } from "src/auth/guard/authorization.guard";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { RoleService } from "./role.service";
import { Permissions } from 'src/auth/decorator/permissions.decorator';
import { Action } from "@prisma/client";

@UseGuards(JwtGuard, AuthorizationGuard)
@Controller('role')
export class RoleController {
    constructor(private roleService: RoleService) {}

    @HttpCode(HttpStatus.OK)
    @Permissions({ action: Action.Read, subject: 'Role' })
    @Get()
    async readAll() {
        return await this.roleService.readAll();
    }
}
