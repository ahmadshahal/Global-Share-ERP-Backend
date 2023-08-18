import * as argon from 'argon2';
import { PrismaClient, Action, Prisma } from '@prisma/client';

const prismaService = new PrismaClient();
async function main() {
    // await prismaService.positionUser.deleteMany();
    // await prismaService.request.deleteMany();
    // await prismaService.user.deleteMany();
    await prismaService.rolePermission.deleteMany();
    // await prismaService.role.deleteMany();
    await prismaService.permission.deleteMany();
    // await prismaService.vacancy.deleteMany();
    // await prismaService.position.deleteMany();
    // await prismaService.status.deleteMany();
    // await prismaService.squad.deleteMany();

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
    const volunteer_permissions = [
        3, 7, 11, 15, 19, 23, 25, 27, 31, 59, 61, 62, 63, 64, 65, 66, 56, 68,
    ];
    const recruiter_permissions = [
        ...volunteer_permissions.flatMap((value) => value),
        17,
        24,
        29,
        30,
        32,
        33,
        34,
        35,
        36,
        39,
        40,
        41,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        55,
        69,
        70,
        71,
        72,
    ];
    const orch_permissions = [
        ...volunteer_permissions.flatMap((value) => value),
        28,
        39,
        40,
        41,
        43,
        44,
        55,
        57,
        58,
        60,
    ];

    const volunteer = await prismaService.role.create({
        data: {
            name: 'Volunteer',
            permissions: {
                createMany: {
                    data: volunteer_permissions.map((permission) => ({
                        permissionId: permission,
                    })),
                },
            },
        },
    });
    const hr_member = await prismaService.role.create({
        data: {
            name: 'HR',
            permissions: {
                createMany: {
                    data: recruiter_permissions.map((permission: number) => ({
                        permissionId: permission,
                    })),
                },
            },
        },
    });
    const orch_member = await prismaService.role.create({
        data: {
            name: 'Orch',
            permissions: {
                createMany: {
                    data: orch_permissions.map((permission: number) => ({
                        permissionId: permission,
                    })),
                },
            },
        },
    });
    const admin = await prismaService.role.create({
        data: {
            name: 'Admin',
        },
    });

    const squad = await prismaService.squad.create({
        data: {
            name: 'HR Department',
            gsName: 'Hive Squad',
            description:
                'Hive squad is the squad responsible for managing the enterprise human resources',
            positions: {
                create: {
                    name: 'HR Manager',
                    gsName: 'HR Manager',
                    gsLevel: 'ORCHESTRATOR',
                    weeklyHours: 20,
                },
            },
        },
        include: {
            positions: true,
        },
    });
    const hashedPassword = await argon.hash('12345678');
    await prismaService.user.create({
        data: {
            email: 'admin@gs.com',
            password: hashedPassword,
            phoneNumber: '1234567890',
            firstName: 'admin',
            lastName: 'doe',
            roleId: admin.id,
            positions: {
                create: {
                    positionId: squad.positions[0].id,
                    startDate: new Date(),
                },
            },
        },
    });
    // await prismaService.user.create({
    //     data: {
    //         email: 'hr@gs.com',
    //         password: hashedPassword,
    //         phoneNumber: '123456789',
    //         firstName: 'HR_Member',
    //         lastName: 'doe',
    //         roleId: hr_member.id,
    //     },
    // });
    // await prismaService.user.create({
    //     data: {
    //         email: 'orch@gs.com',
    //         password: hashedPassword,
    //         phoneNumber: '123456798',
    //         firstName: 'Orch',
    //         lastName: 'doe',
    //         roleId: orch_member.id,
    //     },
    // });
    // await prismaService.user.create({
    //     data: {
    //         email: 'volunteer@gs.com',
    //         password: hashedPassword,
    //         phoneNumber: '12345679',
    //         firstName: 'Volunteer',
    //         lastName: 'doe',
    //         roleId: volunteer.id,
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
