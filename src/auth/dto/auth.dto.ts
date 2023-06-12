import { IsNotEmpty, IsEmail, IsString } from "class-validator";

export class SignupDto {
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @IsString()
    public fullname: string;

    @IsString()
    public phone_number: string;

    @IsNotEmpty()
    @IsString()
    public password: string;
}

export class SigninDto {
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    public email: string;

    @IsNotEmpty()
    @IsString()
    public password: string;
}

export class GoogleSigninDto {
    @IsNotEmpty()
    @IsString()
    public googleToken: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    public password: string;
}

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    public refreshToken: string;
}
