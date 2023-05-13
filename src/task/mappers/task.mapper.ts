import { Status, Task, User } from '@prisma/client';
import { TaskOutDto } from '../dto/out/task-out.dto';

export function toTaskOutDto(param: {
    task: Task;
    assignedBy: User;
    status: Status;
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
    );
}
