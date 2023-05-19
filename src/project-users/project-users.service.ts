import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { ReqUser } from 'src/types/ReqUser';
import { ProjectUserDto } from './dto/project-users.dto';

@Injectable()
export class ProjectUsersService {
    constructor(private prisma: PrismaService) { }

    async addUserToProject(req: Request, project_id: number, dto: ProjectUserDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { email } = dto;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const creator = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                },
            }
        });
        if (!creator.is_creator) throw new UnauthorizedException('You are not project creator');

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new BadRequestException('User not found');
        if (!user.is_verify) throw new BadRequestException('This user is not verify');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id: user.id,
                    project_id,
                },
            }
        });
        if (projectUser) throw new BadRequestException('User already exists');

        return await this.prisma.projectUser.create({
            data: {
                user_id: user.id,
                project_id
            },
        });
    }

    async getUsersInProject(req: Request, project_id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                },
            }
        });
        if (!user) throw new UnauthorizedException();

        const users = await this.prisma.projectUser.findMany({
            select: {
                id: true,
                is_creator: true,
                user: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                    }
                }
            },
            where: { project_id },
        })

        return users;
    }

    async deleteUserFromProject(req: Request, project_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const creator = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                },
            }
        });
        if (!creator.is_creator) throw new UnauthorizedException('You are not project creator');
        if (creator.id === id) throw new BadRequestException('Can not delete project creator');

        const projectUser = await this.prisma.projectUser.findUnique({ where: { id } });
        if (!projectUser) throw new BadRequestException('User not found');

        await this.prisma.projectUser.delete({ where: { id } });

        return { message: 'Delete user from project successfully' };
    }
}
