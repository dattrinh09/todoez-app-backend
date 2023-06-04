import { IsNotEmpty, IsString } from "class-validator";

export class SprintDto {
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
