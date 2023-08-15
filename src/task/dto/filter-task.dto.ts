import { IsInt, IsOptional, IsString } from 'class-validator';
import { IsValidTaskDifficulty } from 'src/validators/validate-task-difficulty.validator';
import { IsValidTaskPriority } from 'src/validators/validate-task-priority.validator';

export class FilterTaskDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsInt()
    squad: number;

    @IsOptional()
    @IsValidTaskPriority()
    priority: string;

    @IsOptional()
    @IsValidTaskDifficulty()
    difficulty: string;

    @IsOptional()
    assignedTo: string;
}
