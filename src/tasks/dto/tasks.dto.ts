import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TaskCreateDto {
    @IsNotEmpty()
    @IsString()
    public content: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsNotEmpty()
    @IsString()
    public type: string;

    @IsNotEmpty()
    @IsString()
    public priority: string;

    @IsNotEmpty()
    @IsString()
    public end_at: string;

    @IsNotEmpty()
    @IsNumber()
    public sprint_id: number;

    @IsNotEmpty()
    @IsNumber()
    public assignee_id: number;
}


export class TaskUpdateDto {
    @IsString()
    public content: string;

    @IsString()
    public description: string;

    @IsString()
    public type: string;

    @IsString()
    public status: string;

    @IsString()
    public priority: string;

    @IsString()
    public end_at: string;

    @IsNumber()
    public sprint_id: number;

    @IsNumber()
    public assignee_id: number;

    @IsNumber()
    public reporter_id: number;
}

export class UpdateTaskStatus {
    @IsString()
    public status: string
}
