import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamDto } from './dto/teams.dto';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class TeamsService {
    constructor(private prisma: PrismaService) { }

    async createTeam(req: Request, dto: TeamDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { name } = dto;

        const newTeam = await this.prisma.team.create({
            data: { name },
        });

        await this.prisma.teamUser.create({
            data: {
                user_id,
                team_id: newTeam.id,
                is_creator: true,
            }
        });

        return { newTeam };
    }

    async getTeams(
        req: Request,
        keyword: string,
        page: number,
        limit: number
    ) {
        const { sub: user_id } = req.user as ReqUser;
        const total = await this.prisma.team.count({
            where: {
                team_users: {
                    some: {
                        AND: [
                            { user_id },
                            { delete_at: null },
                        ]
                    }
                },
                AND: [
                    {
                        name: {
                            contains: keyword,
                            mode: 'insensitive',
                        }
                    }
                ],
            },
        })
        const list = await this.prisma.team.findMany({
            select: {
                id: true,
                name: true,
                create_at: true,
                team_users: {
                    select: {
                        notes: true,
                    }
                }
            },
            where: {
                team_users: {
                    some: {
                        AND: [
                            { user_id },
                            { delete_at: null },
                        ]
                    }
                },
                AND: [
                    {
                        name: {
                            contains: keyword,
                            mode: 'insensitive',
                        }
                    }
                ],
            },
            orderBy: { id: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            total,
            list,
        }
    }

    async getTeamById(req: Request, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const team = await this.prisma.team.findUnique({ where: { id } });
        if (!team) throw new BadRequestException('Team not found');

        const teamUser = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id: id,
                },
            }
        });
        if (!teamUser || teamUser.delete_at) throw new UnauthorizedException();

        return {
            creator: teamUser.is_creator,
            information: team,
        };
    }

    async updateTeam(req: Request, id: number, dto: TeamDto) {
        const { sub: user_id } = req.user as ReqUser;

        const team = await this.prisma.team.findUnique({ where: { id } });
        if (!team) throw new BadRequestException('Team not found');

        const teamUser = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id: id,
                },
            }
        });
        if (!teamUser || teamUser.delete_at) throw new UnauthorizedException();
        if (!teamUser.is_creator) throw new UnauthorizedException('You are not team creator');

        return await this.prisma.team.update({
            where: { id },
            data: { ...dto },
        });
    }

    async deleteTeam(req: Request, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const team = await this.prisma.team.findUnique({ where: { id } });
        if (!team) throw new BadRequestException('Team not found');

        const teamUser = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id: id,
                },
            }
        });
        if (!teamUser || teamUser.delete_at) throw new UnauthorizedException();
        if (!teamUser.is_creator) throw new UnauthorizedException('You are not team creator');

        await this.prisma.team.delete({ where: { id } });

        return { message: 'Delete team successfully' };
    }
}
