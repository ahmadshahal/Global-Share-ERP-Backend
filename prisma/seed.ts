import * as argon from 'argon2';
import { PrismaClient, Action } from '@prisma/client';
const prismaService = new PrismaClient();
async function main() {
    const permissionsList = [
        { id: 1, action: Action.Read, subject: 'Application' },
        { id: 2, action: Action.Delete, subject: 'Application' },
    ];
    await prismaService.user.deleteMany();
    await prismaService.role.deleteMany();
    await prismaService.permission.deleteMany();
    await prismaService.rolePermission.deleteMany();
    await prismaService.permission.createMany({
        data: permissionsList,
    });
    const hr_member = await prismaService.role.create({
        data: {
            name: 'HR_Member',
            permissions: {
                create: { permissionId: 1 },
            },
        },
    });
    const admin = await prismaService.role.create({
        data: {
            name: 'Admin',
        },
    });
    const hashedPassword = await argon.hash('12345678');
    await prismaService.user.upsert({
        where: { email: 'alice@gs.com' },
        update: {},
        create: {
            email: 'alice@gs.com',
            password: hashedPassword,
            phoneNumber: '12345678',
            firstName: 'alice',
            lastName: 'doe',
            roleId: admin.id,
        },
    });
    await prismaService.user.upsert({
        where: { email: 'bob@gs.com' },
        update: {},
        create: {
            email: 'bob@gs.com',
            password: hashedPassword,
            phoneNumber: '123456789',
            firstName: 'bob',
            lastName: 'doe',
            roleId: hr_member.id,
        },
    });
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
