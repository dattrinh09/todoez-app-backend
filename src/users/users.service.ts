import { Injectable, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReqUser } from 'src/types/ReqUser';
import { ChangeAvatar, ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers(req: Request) {
        const { sub: user_id } = req.user as ReqUser;

        return await this.prisma.user.findMany({
            select: {
                id: true,
                fullname: true,
                email: true,
                avatar: true,
                project_users: {
                    select: {
                        project_id: true,
                        delete_at: true,
                    }
                },
                team_users: {
                    select: {
                        team_id: true,
                        delete_at: true,
                    }
                }
            },
            where: {
                AND: [
                    {
                        NOT: { id: user_id },
                    },
                    {
                        is_verify: true,
                    },
                ]
            }
        })
    }

    async getUserProfile(req: Request) {
        const { sub: id } = req.user as ReqUser;

        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new BadRequestException('User not found');

        const is_email_signin = !!user.hash_password;
        delete user.hash_password;
        return {
            user_info: {
                ...user,
                is_email_signin,
            }
        };
    }

    async changePassword(req: Request, dto: ChangePasswordDto) {
        const { sub: id } = req.user as ReqUser;
        const { currentPassword, newPassword } = dto;

        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new BadRequestException('User not found');

        const isMatch = await this.comparePassword(currentPassword, user.hash_password);
        if (!isMatch) throw new BadRequestException('Current password is not correct');
        if (currentPassword === newPassword) throw new BadRequestException('New password is match to current password');

        const hash_password = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id },
            data: {
                hash_password,
            }
        });

        return { message: 'Change password successfully' };
    }

    async updateProfile(req: Request, dto: UpdateProfileDto) {
        const { sub: id } = req.user as ReqUser;

        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new BadRequestException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { ...dto },
        });

        const is_email_signin = !!updatedUser.hash_password;
        delete updatedUser.hash_password;
        return {
            user_info: {
                ...updatedUser,
                is_email_signin,
            }
        };
    }

    async changeAvatar(req: Request, dto: ChangeAvatar) {
        const { sub: id } = req.user as ReqUser;

        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new BadRequestException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { ...dto },
        });

        const is_email_signin = !!updatedUser.hash_password;
        delete updatedUser.hash_password;

        return {
            user_info: {
                ...updatedUser,
                is_email_signin,
            }
        };
    }

    async deleteAvatar(req: Request) {
        const { sub: id } = req.user as ReqUser;

        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new BadRequestException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                avatar: null,
            }
        });

        const is_email_signin = !!updatedUser.hash_password;
        delete updatedUser.hash_password;

        return {
            user_info: {
                ...updatedUser,
                is_email_signin,
            }
        };
    }

    async hashPassword(password: string) {
        const saltOrRounds = 10;
        return await bcrypt.hash(password, saltOrRounds);
    }

    async comparePassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }
}
