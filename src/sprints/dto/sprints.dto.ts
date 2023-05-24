import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SprintCreateDto {
    @IsNotEmpty()
    @IsString()
    public title: string;

    @IsNotEmpty()
    @IsString()
    public start_time: string;

    @IsNotEmpty()
    @IsString()
    public end_time: string;

    @IsNotEmpty()
    @IsNumber()
    public project_id: number;
}

export class SprintUpdateDto {
    @IsNotEmpty()
    @IsString()
    public title: string;

    @IsNotEmpty()
    @IsString()
    public start_time: string;

    @IsNotEmpty()
    @IsString()
    public end_time: string;
}