import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const statuses = [
        { name: 'ToDo' },
        { name: 'Ongoing' },
        { name: 'Done' },
        { name: 'Approved' },
    ];
    for (const status of statuses) {
        console.log(status);
        await prisma.status.create({
            data: { name: status.name, crucial: true },
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
