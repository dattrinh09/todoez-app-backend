import { IsNotEmpty, IsString } from "class-validator";

export class SprintDto {
    @IsNotEmpty()
    @IsString()
    public title: string;

    @IsNotEmpty()
    @IsString()
    public start_at: string;

    @IsNotEmpty()
    @IsString()
    public end_at: string;
}

export class SprintUpdateDto {
    @IsNotEmpty()
    @IsString()
    public title: string;
}

