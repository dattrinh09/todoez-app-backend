import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleSigninDto, ResetPasswordDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { googleOauthConstants, jwtConstants } from 'src/utils/constants';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private readonly mailer: MailerService
    ) { }

    async signup(dto: SignupDto) {
        const { email, fullname, phone_number, password } = dto;

        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        if (foundUser) throw new BadRequestException('Email already exists');

        const hash_password = await this.hashPassword(password);
        if (!hash_password) throw new BadRequestException('Wrong credentials');

        const createdUser = await this.prisma.user.create({
            data: {
                email,
                fullname,
                phone_number,
                hash_password
            }
        });

        const token = await this.signToken(createdUser.id, createdUser.email);

        await this.mailer.sendMail({
            to: createdUser.email,
            subject: 'Welcome to website',
            template: 'index',
            context: {
                text: 'Click link below to verify your email',
                link: `http://localhost:3000/auth/verify-email?email=${createdUser.email}&token=${token}`,
            }
        });

        return { message: 'Signup successfully' };
    }

    async verifyEmail(email: string, token: string) {
        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        if (!foundUser) throw new BadRequestException('Email does not exists');

        if (!token) throw new UnauthorizedException();
        const payload = await this.jwt.verifyAsync(
            token,
            {
                secret: jwtConstants.secret
            }
        );
        if (payload.username !== foundUser.email) throw new UnauthorizedException();

        await this.prisma.user.update({
            where: { email },
            data: {
                is_verify: true,
            },
        });

        return { message: 'Verify email successfully' };
    }

    async forgotPassword(email: string) {
        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        if (!foundUser) throw new BadRequestException('Email does not exists');
        if (!foundUser.hash_password) throw new BadRequestException('This email use for google signin function');
        if (!foundUser.is_verify) throw new BadRequestException('Account is not verify');

        const token = await this.signToken(foundUser.id, foundUser.email);

        await this.mailer.sendMail({
            to: foundUser.email,
            subject: 'Forgot password',
            template: 'index',
            context: {
                text: 'Click link below to reset your password',
                link: `http://localhost:3000/auth/reset-password?email=${foundUser.email}&token=${token}`,
            }
        });

        return { mssage: 'Email exists' };
    }

    async resetPassword(email: string, dto: ResetPasswordDto) {
        const { password } = dto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        const isMatch = await this.comparePassword(password, user.hash_password);
        if (isMatch) throw new BadRequestException('Your new password is match to old password');

        const hash_password = await this.hashPassword(password);
        if (!hash_password) throw new BadRequestException('Wrong credentials');

        await this.prisma.user.update({
            where: { email },
            data: {
                hash_password,
            }
        });

        return { mssage: 'Reset password successfully' };
    }

    async signin(dto: SigninDto) {
        const { email, password } = dto;

        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        if (!foundUser) throw new BadRequestException('Email does not exists');

        const isMatch = await this.comparePassword(password, foundUser.hash_password);
        if (!isMatch) throw new BadRequestException('Password is not correct');

        if (!foundUser.is_verify) throw new BadRequestException('Account is not verify');

        const token = await this.signToken(foundUser.id, foundUser.email);
        if (!token) throw new BadRequestException('Wrong credentials');

        delete foundUser.hash_password;

        return {
            access_token: token,
            user_info: foundUser,
        };
    }

    async googleSignin(dto: GoogleSigninDto) {
        const { googleToken } = dto;

        const client = new OAuth2Client(
            googleOauthConstants.clientID,
            googleOauthConstants.clientSecret,
        );

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: googleOauthConstants.clientID,
        });

        if (!ticket) throw new BadRequestException("Google signin fail");

        const user = await this.createGoogleUser(ticket.getPayload().email, ticket.getPayload().name);
        const token = await this.signToken(user.id, user.email);
        delete user.hash_password;

        return {
            access_token: token,
            user_info: user,
        };
    }

    async signout() {
        return { message: 'signout successfully' };
    }

    
    async createGoogleUser(email: string, name: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) return user;
        return await this.prisma.user.create({
            data: {
                email: email,
                fullname: name,
                phone_number: "",
                hash_password: "",
                is_verify: true,
            },
        });
    }

    async hashPassword(password: string) {
        const saltOrRounds = 10;
        return await bcrypt.hash(password, saltOrRounds);
    }

    async comparePassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }

    async signToken(id: number, email: string) {
        const payload = { username: email, sub: id };
        return await this.jwt.signAsync(payload);
    }
}
