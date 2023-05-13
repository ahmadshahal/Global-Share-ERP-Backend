import { Difficulty, Priority, Status, Task, User } from '@prisma/client';

export class TaskOutDto {
    constructor(
        readonly id: number,
        readonly title: string,
        readonly description: string,
        readonly url: string,
        readonly deadline: Date,
        readonly priority: Priority,
        readonly difficulty: Difficulty,
        readonly assignedBy: User,
        readonly status: Status,
    ) {}
}
