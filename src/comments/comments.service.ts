import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentDto, CommentUpdateDto } from './dto/comments.dto';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async createComment(req: Request, project_id: number, dto: CommentDto) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        });

        if (!user || user.delete_at) throw new BadRequestException('No permission');

        return await this.prisma.comment.create({
            data: {
                ...dto,
                user_id: user.id,
            }
        })
    }

    async getComments(req: Request, project_id: number, task_id: number, page: number, limit: number) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        });
        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const total = await this.prisma.comment.count({ where: { task_id } });

        const comments = await this.prisma.comment.findMany({
            select: {
                id: true,
                content: true,
                create_at: true,
                update_at: true,
                task_id: true,
                user: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                fullname: true,
                            }
                        }
                    }
                }
            },
            where: { task_id },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { update_at: "desc" },
        })

        return {
            total,
            list: comments,
        }
    }

    async updateComment(req: Request, project_id: number, id: number, dto: CommentUpdateDto) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        });
        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment || comment.user_id !== user.id) throw new BadRequestException('No permission');

        return await this.prisma.comment.update({
            data: { ...dto },
            where: { id },
        });
    }

    async deleteComment(req: Request, project_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.projectUser.findUnique({
            where: {
                user_id_project_id: {
                    user_id,
                    project_id,
                }
            }
        });
        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment || comment.user_id !== user.id) throw new BadRequestException('No permission');

        await this.prisma.comment.delete({ where: { id } });
        return { message: 'Delete message successfully' };
    }
}
