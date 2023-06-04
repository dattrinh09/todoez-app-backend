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

    async getTeams(req: Request) {
        const { sub: user_id } = req.user as ReqUser;
        return await this.prisma.team.findMany({
            where: {
                team_users: { some: { user_id } },
            }
        });
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
        if (!teamUser) throw new UnauthorizedException();

        const userNumber = await this.prisma.teamUser.count({ where: { team_id: id } });

        return {
            is_creator: teamUser.is_creator,
            user_number: userNumber,
            team,
        };
    }

    async updateTeam(req: Request, id: number, dto: TeamDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { name } = dto;

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
        if (!teamUser || !teamUser.is_creator) throw new UnauthorizedException();

        return await this.prisma.team.update({
            where: { id },
            data: {
                name
            },
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
        if (!teamUser || !teamUser.is_creator) throw new UnauthorizedException();

        await this.prisma.team.delete({ where: { id } });

        return { message: 'Delete team successfully' };
    }
}
