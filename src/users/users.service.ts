import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getUserById(id: number) {
        const user = await this.prisma.user.findUnique({ 
            select: {
                id: true,
                fullname: true,
                phone_number: true,
                create_time: true,
                update_time: true,
            },
            where: { id } 
        });
        if (!user) throw new NotFoundException('User not found');
        return { user };
    }
}
