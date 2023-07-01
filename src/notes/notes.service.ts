import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { NoteDto } from './dto/notes.dto';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class NotesService {
    constructor(private prisma: PrismaService) { }

    async createNote(req: Request, team_id: number, dto: NoteDto) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                }
            }
        });

        if (!user || user.delete_at) throw new BadRequestException('No permission');

        return await this.prisma.note.create({
            data: {
                ...dto,
                user_id: user.id,
            }
        });
    }

    async getNotes(req: Request, team_id: number, page: number, limit: number) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                }
            }
        });

        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const total = await this.prisma.note.count({
            where: {
                user: {
                    team_id,
                },
            },
        })

        const notes = await this.prisma.note.findMany({
            select: {
                id: true,
                content: true,
                description: true,
                create_at: true,
                update_at: true,
                user: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                fullname: true,
                                avatar: true,
                            }
                        }
                    }
                }
            },
            where: {
                user: {
                    team_id,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { create_at: 'desc' },
        });

        return {
            list: notes,
            total,
        }
    }

    async updateNote(req: Request, team_id: number, id: number, dto: NoteDto) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                }
            }
        });

        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note || note.user_id !== user.id) throw new BadRequestException('No permission');

        return await this.prisma.note.update({
            where: { id },
            data: { ...dto },
        })
    }

    async deleteNote(req: Request, team_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const user = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                }
            }
        });

        if (!user || user.delete_at) throw new BadRequestException('No permission');

        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note || note.user_id !== user.id) throw new BadRequestException('No permission');

        await this.prisma.note.delete({ where: { id } });

        return { message: 'Delete note successfully' };
    }
}
