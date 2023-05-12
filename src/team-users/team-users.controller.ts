import { Controller, Post, Get, Delete, Req, Body, Param } from '@nestjs/common';
import { TeamUsersService } from './team-users.service';
import { TeamUsersDto } from './dto/team-users.dto';

@Controller('team-users')
export class TeamUsersController {
  constructor(private readonly teamUsersService: TeamUsersService) { }

  @Post('/:team_id')
  async addUserToTeam(@Req() req, @Param() params: { team_id: string }, @Body() dto: TeamUsersDto) {
    return await this.teamUsersService.addUserToTeam(req, parseInt(params.team_id), dto);
  }

  @Get('/:team_id')
  async getUsersInTeam(@Req() req, @Param() params: { team_id: string }) {
    return await this.teamUsersService.getUsersInTeam(req, parseInt(params.team_id));
  }

  @Delete('/:team_id/:id')
  async deleteUserFromTeam(@Req() req, @Param() params: { team_id: string, id: string }) {
    return await this.teamUsersService.deleteUserFromTeam(req, parseInt(params.team_id), parseInt(params.id));
  }
}
