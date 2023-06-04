import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectDto } from './dto/projects.dto';
import { Request } from 'express';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async createProject(req: Request, dto: ProjectDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { name, description } = dto;

        const newProject = await this.prisma.project.create({
            data: {
                name,
                description,
            }
        });

        await this.prisma.projectUser.create({
            data: {
                user_id,
                project_id: newProject.id,
                is_creator: true,
            }
        })

        return { newProject };
    }

    async getProjects(req: Request) {
        const { sub: user_id } = req.user as ReqUser;
        return await this.prisma.project.findMany({
            where: {
                project_users: {
                    some: { user_id }
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
        if (!projectUser) throw new UnauthorizedException();

        const userNumber = await this.prisma.projectUser.count({ where: { project_id: id } });
        const sprintNumber = await this.prisma.sprint.count({ where: { project_id: id } });

        return {
            is_creator: projectUser.is_creator,
            user_number: userNumber,
            sprint_number: sprintNumber,
            project,
        }
    }

    async updateProject(req: Request, id: number, dto: ProjectDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { name, description } = dto;

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
        if (!projectUser || !projectUser.is_creator) throw new UnauthorizedException('You are not project creator');

        return await this.prisma.project.update({
            where: { id },
            data: {
                name,
                description,
            },
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
        if (!projectUser || !projectUser.is_creator) throw new UnauthorizedException('You are not project creator');

        await this.prisma.project.delete({ where: { id } });

        return { message: 'Delete project successfully' };
    }
}
