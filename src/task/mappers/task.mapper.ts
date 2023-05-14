import { Status, Task, User, Comment } from '@prisma/client';
import { TaskOutDto } from '../dto/out/task-out.dto';

export function toTaskOutDto(param: {
    task: Task;
    assignedBy: User;
    status: Status;
    comments: Comment[];
}) {
    return new TaskOutDto(
        param.task.id,
        param.task.title,
        param.task.description,
        param.task.url,
        param.task.deadline,
        param.task.priority,
        param.task.difficulty,
        param.assignedBy,
        param.status,
        param.comments,
    );
}
