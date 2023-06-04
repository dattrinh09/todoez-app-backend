import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TaskCreateDto {
    @IsNotEmpty()
    @IsString()
    public content: string;

    @IsNotEmpty()
    @IsString()
    public type: string;

    @IsNotEmpty()
    @IsString()
    public priority: string;

    @IsNotEmpty()
    @IsString()
    public end_time: string;

    @IsNotEmpty()
    @IsNumber()
    public sprint_id: number;

    @IsNotEmpty()
    @IsNumber()
    public assignee_id: number;
}


export class TaskUpdateDto {
    @IsNotEmpty()
    @IsString()
    public content: string;

    @IsNotEmpty()
    @IsString()
    public type: string;

    @IsNotEmpty()
    @IsString()
    public status: string;

    @IsNotEmpty()
    @IsString()
    public priority: string;

    @IsNotEmpty()
    @IsString()
    public end_time: string;

    @IsNotEmpty()
    @IsNumber()
    public sprint_id: number;

    @IsNotEmpty()
    @IsNumber()
    public assignee_id: number;

    @IsNotEmpty()
    @IsNumber()
    public reporter_id: number;
}
