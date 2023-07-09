import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleSigninDto, RefreshTokenDto, ResetPasswordDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { clientUrl, googleOauthConstants, jwtConstants, rtConstants } from 'src/utils/constants';
import { OAuth2Client } from 'google-auth-library';
import { Request } from 'express';
import { ReqUser } from 'src/types/ReqUser';

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

        const hash_password = await this.hashData(password);
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
            template: './index',
            context: {
                text: 'Click link below to verify your email',
                link: this.getVerifyUrl("verify-email", createdUser.email, token),
            }
        });

        return { message: 'Signup successfully' };
    }

    async verifyEmail(email: string, token: string) {
        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        if (!foundUser) throw new BadRequestException('Email does not exists');

        if (!token) throw new UnauthorizedException();
        let payload = null;
        try {
            payload = await this.jwt.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret,
                }
            );
        } catch {
            throw new ForbiddenException('Can not verify token');
        }
        if (payload.email !== foundUser.email) throw new UnauthorizedException();

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
        if (!foundUser.hash_password) throw new BadRequestException('This email use for google signin');
        if (!foundUser.is_verify) throw new BadRequestException('Account is not verify');

        const token = await this.signToken(foundUser.id, foundUser.email);

        await this.mailer.sendMail({
            to: foundUser.email,
            subject: 'Forgot password',
            template: './index',
            context: {
                text: 'Click link below to reset your password',
                link: this.getVerifyUrl("reset-password", foundUser.email, token),
            }
        });

        return { mssage: 'Email exists' };
    }

    async resetPassword(email: string, dto: ResetPasswordDto) {
        const { password } = dto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        const isMatch = await this.compareHashData(password, user.hash_password);
        if (isMatch) throw new BadRequestException('Your new password is match to old password');

        const hash_password = await this.hashData(password);
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

        const isMatch = await this.compareHashData(password, foundUser.hash_password);
        if (!isMatch) throw new BadRequestException('Password is not correct');

        if (!foundUser.is_verify) throw new BadRequestException('Account is not verify');

        const token = await this.signToken(foundUser.id, foundUser.email);

        const rToken = await this.signRefreshToken(foundUser.id, foundUser.email);
        const hash_rtoken = await this.hashData(rToken);

        if (!token || !rToken || !hash_rtoken) throw new BadRequestException('Wrong credentials');

        await this.prisma.user.update({
            data: { hash_rtoken },
            where: {
                id: foundUser.id,
            }
        })

        delete foundUser.hash_password;
        delete foundUser.hash_rtoken;

        return {
            access_token: token,
            refresh_token: rToken,
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
        const rToken = await this.signRefreshToken(user.id, user.email);
        const hash_rtoken = await this.hashData(rToken);

        if (!token || !rToken || !hash_rtoken) throw new BadRequestException('Wrong credentials');

        await this.prisma.user.update({
            data: { hash_rtoken },
            where: { id: user.id },
        });

        delete user.hash_password;
        delete user.hash_rtoken;

        return {
            access_token: token,
            refresh_token: rToken,
            user_info: user,
        };
    }

    async signout(req: Request) {
        const { sub: id } = req.user as ReqUser;
        await this.prisma.user.update({
            data: { hash_rtoken: null },
            where: { id }
        })
        return { message: 'signout successfully' };
    }

    async refreshToken(dto: RefreshTokenDto) {
        const { refreshToken } = dto;

        let payload = null;

        try {
            payload = await this.jwt.verifyAsync(
                refreshToken,
                {
                    secret: rtConstants.secret
                }
            );
        } catch {
            throw new ForbiddenException('Access denied');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });
        if (!user || !user.hash_rtoken) throw new ForbiddenException('Access denied');

        const isMatch = await this.compareHashData(refreshToken, user.hash_rtoken);
        if (!isMatch) throw new ForbiddenException('Access denied');

        const token = await this.signToken(user.id, user.email);
        if (!token) throw new ForbiddenException('Wrong credentials');

        return {
            access_token: token,
        }
    }

    getVerifyUrl(type: string, email: string, token: string) {
        const baseUrl = clientUrl;
        return `${baseUrl}/${type}?email=${email}&token=${token}`;
    }

    async createGoogleUser(email: string, fullname: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            if (user.hash_password) throw new BadRequestException('Email already exist');

            return user;
        }
        return await this.prisma.user.create({
            data: {
                email,
                fullname,
                is_verify: true,
            },
        });
    }

    async hashData(data: string) {
        const saltOrRounds = 10;
        return await bcrypt.hash(data, saltOrRounds);
    }

    async compareHashData(data: string, hash: string) {
        return await bcrypt.compare(data, hash);
    }

    async signToken(id: number, email: string) {
        const payload = { sub: id, email };
        return await this.jwt.signAsync(payload);
    }

    async signRefreshToken(id: number, email: string) {
        const payload = { sub: id, email };
        return await this.jwt.signAsync(
            payload,
            {
                secret: rtConstants.secret,
                expiresIn: rtConstants.expires,
            }
        );
    }
}
