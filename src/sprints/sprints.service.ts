import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { ReqUser } from 'src/types/ReqUser';
import { SprintDto } from './dto/sprints.dto';

@Injectable()
export class SprintsService {
    constructor(private prisma: PrismaService) { }

    async createSprint(req: Request, project_id: number, dto: SprintDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { title, start_time, end_time } = dto;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        })
        if (!user) throw new UnauthorizedException();

        return await this.prisma.sprint.create({
            data: {
                title,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                project_id
            }
        });
    }

    async getSprints(req: Request, project_id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        })
        if (!user) throw new UnauthorizedException();

        return await this.prisma.sprint.findMany({
            where: {
                project_id
            }
        });
    }

    async updateSprint(req: Request, project_id: number, id: number, dto: SprintDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { title, start_time, end_time } = dto;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const sprint = await this.prisma.sprint.findUnique({ where: { id } });
        if (!sprint) throw new BadRequestException('Sprint not found');

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id
                }
            }
        })

        if (!user) throw new UnauthorizedException();

        return await this.prisma.sprint.update({
            where: { id },
            data: {
                title,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
            }
        })
    }

    async deleteSprint(req: Request, project_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const project = await this.prisma.project.findUnique({ where: { id: project_id } });
        if (!project) throw new BadRequestException('Project not found');

        const sprint = await this.prisma.sprint.findUnique({ where: { id } });
        if (!sprint) throw new BadRequestException('Sprint not found');

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id
                }
            }
        })
        if (!user) throw new UnauthorizedException();

        await this.prisma.sprint.delete({ where: { id } });
        return { message: 'Delete sprint successfully' };
    }
}
