import {
    Difficulty,
    Priority,
    Status,
    Comment,
    User,
    Task,
} from '@prisma/client';

export class TaskOutDto {
    id: number;
    title: string;
    description: string;
    url: string;
    deadline: Date;
    priority: Priority;
    difficulty: Difficulty;
    assignedBy: User;
    status: Status;
    comments: Comment[];

    constructor(param: {
        task: Task;
        assignedBy: User;
        status: Status;
        comments: Comment[];
    }) {
        this.id = param.task.id;
        this.title = param.task.title;
        this.description = param.task.description;
        this.url = param.task.url;
        this.deadline = param.task.deadline;
        this.priority = param.task.priority;
        this.difficulty = param.task.difficulty;
        this.assignedBy = param.assignedBy;
        this.status = param.status;
        this.comments = param.comments;
    }
}
