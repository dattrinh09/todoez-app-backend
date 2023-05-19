import { IsEmail, IsNotEmpty } from "class-validator";

export class ProjectUserDto {
    @IsNotEmpty()
    @IsEmail()
    public email: string;
}