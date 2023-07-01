import { IsNotEmpty, IsString } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    public currentPassword: string;

    @IsNotEmpty()
    @IsString()
    public newPassword: string;
}

export class UpdateProfileDto {
    @IsString()
    public fullname: string;

    @IsString()
    public phone_number: string;
}

export class ChangeAvatar {
    @IsString()
    public avatar: string;
}