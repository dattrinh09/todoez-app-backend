import { Injectable, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReqUser } from 'src/types/ReqUser';
import { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getUserProfile(req: Request) {
        const { sub } = req.user as ReqUser;

        const user = await this.prisma.user.findUnique({ where: { id: sub } });
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
        const { sub } = req.user as ReqUser;
        const { currentPassword, newPassword } = dto;

        const user = await this.prisma.user.findUnique({ where: { id: sub } });
        if (!user) throw new BadRequestException('User not found');

        const isMatch = await this.comparePassword(currentPassword, user.hash_password);
        if (!isMatch) throw new BadRequestException('Current password is not correct');
        if (currentPassword === newPassword) throw new BadRequestException('New password is match to current password');

        const hash_password = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                hash_password,
            }
        });

        return { message: 'Change password successfully' };
    }

    async updateProfile(req: Request, dto: UpdateProfileDto) {
        const { sub } = req.user as ReqUser;
        const { fullname, phone_number } = dto;

        const user = await this.prisma.user.findUnique({ where: { id: sub } });
        if (!user) throw new BadRequestException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                fullname,
                phone_number
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
