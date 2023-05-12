import { IsEmail, IsNotEmpty } from "class-validator";

export class TeamUsersDto {
    @IsNotEmpty()
    @IsEmail()
    public email: string;
}