import * as argon from 'argon2';
import { PrismaClient, Action, Prisma } from '@prisma/client';
const prismaService = new PrismaClient();
async function main() {
    await prismaService.user.deleteMany();
    await prismaService.rolePermission.deleteMany();
    await prismaService.role.deleteMany();
    await prismaService.permission.deleteMany();

    let id = 0;
    const models = Prisma.dmmf.datamodel.models;
    const actions = [Action.Create, Action.Delete, Action.Read, Action.Update];
    const permissions = models.flatMap((model) => {
        return actions.map((action) => {
            id++;
            const subject = model.name;
            return { action, subject, id };
        });
    });

    await prismaService.permission.createMany({ data: permissions });
    console.log(`Created ${permissions.length} permissions`);
    const employee_permissions = [
        25, 26, 27, 28, 41, 42, 43, 44, 69, 70, 71, 72, 73, 75, 75, 76, 81, 82,
        83, 84, 85, 86, 87, 88,
    ];
    // const hr_member_permissions = [

    // ];
    const employee = await prismaService.role.create({
        data: {
            name: 'Employee',
            permissions: {
                createMany: {
                    data: employee_permissions.map((permission) => ({
                        permissionId: permission,
                    })),
                },
            },
        },
    });
    // const hr_member = await prismaService.role.create({
    //     data: {
    //         name: 'HR_Member',
    //         permissions: {
    //             create: { permissionId: 1 },
    //         },
    //     },
    // });
    // const admin = await prismaService.role.create({
    //     data: {
    //         name: 'Admin',
    //     },
    // });
    // const hashedPassword = await argon.hash('12345678');
    // await prismaService.user.upsert({
    //     where: { email: 'alice@gs.com' },
    //     update: {},
    //     create: {
    //         email: 'alice@gs.com',
    //         password: hashedPassword,
    //         phoneNumber: '12345678',
    //         firstName: 'alice',
    //         lastName: 'doe',
    //         roleId: 13,
    //     },
    // });
    // await prismaService.user.upsert({
    //     where: { email: 'bob@gs.com' },
    //     update: {},
    //     create: {
    //         email: 'bob@gs.com',
    //         password: hashedPassword,
    //         phoneNumber: '123456789',
    //         firstName: 'bob',
    //         lastName: 'doe',
    //         roleId: hr_member.id,
    //     },
    // });
}
main()
    .then(async () => {
        await prismaService.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prismaService.$disconnect();
        process.exit(1);
    });
