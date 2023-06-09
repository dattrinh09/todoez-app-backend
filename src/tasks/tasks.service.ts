import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskCreateDto, TaskUpdateDto } from './dto/tasks.dto';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async createTask(req: Request, project_id: number, dto: TaskCreateDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { end_at, sprint_id, assignee_id } = dto;

        const project = await this.prisma.project.findUnique({
            where: { id: project_id }
        });
        if (!project) throw new BadRequestException('Project not found');

        const reporter = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        });
        if (!reporter || reporter.delete_at) throw new UnauthorizedException();

        const sprint = await this.prisma.sprint.findUnique({
            where: { id: sprint_id }
        });
        if (!sprint) throw new BadRequestException('sprint not found');

        const assignee = await this.prisma.projectUser.findUnique({
            where: { id: assignee_id }
        });
        if (!assignee || assignee.delete_at) throw new BadRequestException('Assignee not exist in this project');

        return await this.prisma.task.create({
            data: {
                ...dto,
                end_at: new Date(end_at),
                reporter_id: reporter.id,
            }
        })
    }

    async getTasks(
        req: Request,
        project_id: number,
        type: string,
        status: string,
        priority: string,
        keyword: string,
        assignee_id: number,
        reporter_id: number,
        page: number,
        limit: number
    ) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({
            where: { id: project_id }
        });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id
                }
            }
        });
        if (!projectUser || projectUser.delete_at) throw new UnauthorizedException();

        const total = await this.prisma.task.count({
            where: {
                sprint: {
                    project_id
                },
                AND: [
                    { type },
                    { status },
                    { priority },
                    {
                        content: {
                            contains: keyword,
                            mode: 'insensitive'
                        }
                    },
                    { assignee_id: assignee_id ? assignee_id : undefined },
                    { reporter_id: reporter_id ? reporter_id : undefined }
                ]
            }
        });

        const tasks = await this.prisma.task.findMany({
            select: {
                id: true,
                type: true,
                content: true,
                status: true,
                priority: true,
                create_at: true,
                update_at: true,
                end_at: true,
                sprint: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                reporter: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                email: true,
                                fullname: true,
                            }
                        },
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                email: true,
                                fullname: true,
                            }
                        },
                    }
                },
            },
            orderBy: {
                id: 'asc',
            },
            where: {
                sprint: {
                    project_id
                },
                AND: [
                    { type },
                    { status },
                    { priority },
                    {
                        content: {
                            contains: keyword,
                            mode: 'insensitive'
                        }
                    },
                    { assignee_id: assignee_id ? assignee_id : undefined },
                    { reporter_id: reporter_id ? reporter_id : undefined }

                ]
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            total,
            list: tasks,
        }
    }

    async getTaskById(req: Request, project_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({
            where: { id: project_id }
        });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id
                }
            }
        });
        if (!projectUser || projectUser.delete_at) throw new UnauthorizedException();

        return await this.prisma.task.findUnique({
            select: {
                id: true,
                type: true,
                content: true,
                description: true,
                status: true,
                priority: true,
                create_at: true,
                update_at: true,
                end_at: true,
                sprint: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                reporter: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                email: true,
                                fullname: true,
                            }
                        },
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                email: true,
                                fullname: true,
                            }
                        },
                    }
                },
            },
            where: { id },
        });
    }

    async updateTask(req: Request, project_id: number, id: number, dto: TaskUpdateDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { end_at, sprint_id, assignee_id, reporter_id } = dto;

        const project = await this.prisma.project.findUnique({
            where: { id: project_id }
        });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id
                }
            }
        });
        if (!projectUser || projectUser.delete_at) throw new UnauthorizedException();

        const sprint = await this.prisma.sprint.findUnique({
            where: { id: sprint_id }
        });
        if (!sprint) throw new BadRequestException('sprint not found');

        const assignee = await this.prisma.projectUser.findUnique({
            where: { id: assignee_id }
        });
        if (!assignee || assignee.delete_at) throw new BadRequestException('Assignee not exist in this project');


        const reporter = await this.prisma.projectUser.findUnique({
            where: { id: reporter_id }
        });
        if (!reporter || reporter.delete_at) throw new BadRequestException('Reporter not exist in this project');

        return await this.prisma.task.update({
            data: {
                ...dto,
                end_at: new Date(end_at),
            },
            where: { id },
        });
    }

    async deleteTask(req: Request, project_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({
            where: { id: project_id }
        });
        if (!project) throw new BadRequestException('Project not found');

        const projectUser = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id
                }
            }
        });
        if (!projectUser || projectUser.delete_at) throw new UnauthorizedException();

        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new BadRequestException('Task not found');

        await this.prisma.task.delete({ where: { id } });

        return { message: 'Delete task successfully' };
    }
}
