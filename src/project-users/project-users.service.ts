import { Injectable, BadRequestException } from '@nestjs/common';
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
        if (!creator || creator.delete_at) throw new BadRequestException('No permission');
        if (!creator.is_creator) throw new BadRequestException('You are not project creator');

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
        if (projectUser && !projectUser.delete_at) throw new BadRequestException('User already exists');

        if (projectUser && projectUser.delete_at)
            return await this.prisma.projectUser.update({
                data: { delete_at: null },
                where: { id: projectUser.id }
            });

        return await this.prisma.projectUser.create({
            data: {
                user_id: user.id,
                project_id,
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
        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const users = await this.prisma.projectUser.findMany({
            select: {
                id: true,
                is_creator: true,
                delete_at: true,
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

        return {
            creator: user.is_creator,
            list: users,
        };
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
        if (!creator || creator.delete_at) throw new BadRequestException('No permission');
        if (!creator.is_creator)
            throw new BadRequestException('You are not project creator');
        if (creator.id === id)
            throw new BadRequestException('Can not delete project creator');

        const projectUser = await this.prisma.projectUser.findUnique({ where: { id } });
        if (!projectUser || projectUser.delete_at)
            throw new BadRequestException('User not found');

        await this.prisma.projectUser.update({
            data: {
                delete_at: new Date()
            },
            where: { id }
        });

        return { message: 'Delete user from project successfully' };
    }
}
