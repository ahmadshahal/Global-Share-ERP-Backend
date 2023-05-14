import { Difficulty, Priority, Status, Comment, User } from '@prisma/client';

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
        readonly comments: Comment[],
    ) {}
}
