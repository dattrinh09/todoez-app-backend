import { Controller, Body, Get, Post, Req, Param, Put, Delete } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamDto } from './dto/teams.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) { }

  @Post('')
  async createTeam(@Req() req, @Body() dto: TeamDto) {
    return await this.teamsService.createTeam(req, dto);
  }

  @Get('')
  async getTeams(@Req() req) {
    return await this.teamsService.getTeams(req)
  }

  @Get('/:id')
  async getTeamById(@Req() req, @Param() params: { id: string }) {
    return await this.teamsService.getTeamById(req, parseInt(params.id));
  }

  @Put('/:id')
  async updateTeam(@Req() req, @Param() params: { id: string }, @Body() dto: TeamDto) {
    return await this.teamsService.updateTeam(req, parseInt(params.id), dto);
  }

  @Delete('/:id')
  async deleteTeam(@Req() req, @Param() params: { id: string }) {
    return await this.teamsService.deleteTeam(req, parseInt(params.id));
  }
}
