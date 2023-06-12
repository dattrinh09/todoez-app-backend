import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectDto } from './dto/projects.dto';
import { Request } from 'express';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async createProject(req: Request, dto: ProjectDto) {
        const { sub: user_id } = req.user as ReqUser;

        const newProject = await this.prisma.project.create({
            data: { ...dto },
        });

        await this.prisma.projectUser.create({
            data: {
                user_id,
                project_id: newProject.id,
                is_creator: true,
            }
        })

        return newProject;
    }

    async getProjects(req: Request) {
        const { sub: user_id } = req.user as ReqUser;
        return await this.prisma.project.findMany({
            where: {
                project_users: {
                    some: {
                        AND: [
                            { user_id },
                            { delete_at: null },
                        ]
                    }
                }
            }
        });
    }

    async getProjectById(req: Request, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id: id,
                }
            }
        });
        if (!projectUser || projectUser.delete_at) throw new BadRequestException('No permission');

        return {
            creator: projectUser.is_creator,
            information: project,
        }
    }

    async updateProject(req: Request, id: number, dto: ProjectDto) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id: id,
                },
            },
        });
        if (!projectUser || projectUser.delete_at) throw new BadRequestException('No permission');
        if (!projectUser.is_creator) throw new BadRequestException('You are not project creator');

        return await this.prisma.project.update({
            where: { id },
            data: { ...dto },
        });
    }

    async deleteProject(req: Request, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id: id,
                }
            }
        });
        if (!projectUser || projectUser.delete_at) throw new BadRequestException('No permission');
        if (!projectUser.is_creator) throw new BadRequestException('You are not project creator');

        await this.prisma.project.delete({ where: { id } });

        return { message: 'Delete project successfully' };
    }
}
