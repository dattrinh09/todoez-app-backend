import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamUsersDto } from './dto/team-users.dto';
import { ReqUser } from 'src/types/ReqUser';

@Injectable()
export class TeamUsersService {
    constructor(private prisma: PrismaService) { }

    async addUserToTeam(req: Request, team_id: number, dto: TeamUsersDto) {
        const { sub: user_id } = req.user as ReqUser;
        const { email } = dto;

        const team = await this.prisma.team.findUnique({ where: { id: team_id } });
        if (!team) throw new BadRequestException('Team not found');

        const creator = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                },
            }
        });
        if (!creator.is_creator) throw new UnauthorizedException('You are not team creator');

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new BadRequestException('User not found');
        if (!user.is_verify) throw new BadRequestException('This user is not verify');

        const teamUser = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id: user.id,
                    team_id,
                },
            }
        });
        if (teamUser) throw new BadRequestException('User already exists');

        return await this.prisma.teamUser.create({
            data: {
                user_id: user.id,
                team_id,
            },
        });
    }

    async getUsersInTeam(req: Request, team_id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const team = await this.prisma.team.findUnique({ where: { id: team_id } });
        if (!team) throw new BadRequestException('Team not found');

        const user = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                },
            }
        });
        if (!user) throw new UnauthorizedException();

        const users = await this.prisma.teamUser.findMany({
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
            where: { team_id },
        })

        return users;
    }

    async deleteUserFromTeam(req: Request, team_id: number, id: number) {
        const { sub: user_id } = req.user as ReqUser;

        const team = await this.prisma.team.findUnique({ where: { id: team_id } });
        if (!team) throw new BadRequestException('Team not found');

        const creator = await this.prisma.teamUser.findUnique({
            where: {
                user_id_team_id: {
                    user_id,
                    team_id,
                },
            }
        });
        if (!creator.is_creator) throw new UnauthorizedException('You are not team creator');

        if (creator.id === id) throw new BadRequestException('Can not delete team creator');

        const teamUser = await this.prisma.teamUser.findUnique({ where: { id } });
        if (!teamUser) throw new BadRequestException('User not found');

        await this.prisma.teamUser.delete({ where: { id } });

        return { message: 'Delete user from team successfully' };
    }
}
