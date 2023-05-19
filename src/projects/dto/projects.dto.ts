import { IsNotEmpty, IsString } from "class-validator";

export class ProjectDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsString()
    public description: string;
}